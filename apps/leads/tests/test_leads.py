from datetime import timedelta
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.services.models import AssistanceRequest, LegalCase
from apps.leads.models import (
    Lead,
    LeadCommercialSettings,
    LeadCreditPlan,
    LeadReservation,
    LeadAcceptance,
    ProfessionalWallet,
    WalletTransaction,
    ProfessionalPlanPurchase,
    LeadCreditLedger,
    PaymentOrder,
    RefundRequest,
)
from apps.leads.services.lead_service import LeadService
from apps.leads.services.wallet_service import WalletService
from apps.leads.services.plan_service import PlanService
from apps.leads.services.payment_service import PaymentGatewayService


class LeadMarketplaceTests(TestCase):
    def setUp(self):
        # Admin user
        self.admin_user = User.objects.create_superuser(
            username="admin_test",
            email="admin@test.com",
            password="AdminPassword123!",
            role=User.Role.ADMIN,
        )

        # Professional A
        self.pro_a = User.objects.create_user(
            username="pro_a",
            email="pro_a@test.com",
            password="ProPassword123!",
            role=User.Role.PROFESSIONAL,
        )

        # Professional B
        self.pro_b = User.objects.create_user(
            username="pro_b",
            email="pro_b@test.com",
            password="ProPassword123!",
            role=User.Role.PROFESSIONAL,
        )

        # Regular Member / Client
        self.client_user = User.objects.create_user(
            username="client_user",
            email="client@test.com",
            password="ClientPassword123!",
            role=User.Role.MEMBER,
        )

        # Base commercial settings (paid unlocks disabled by default as per compliance rule)
        self.settings = LeadCommercialSettings.get_settings()
        self.settings.paid_unlock_enabled = False
        self.settings.default_lead_price_paise = 100000
        self.settings.save()

        # Seed plan
        self.plan = LeadCreditPlan.objects.create(
            name="Starter Test",
            code="starter-test",
            price_paise=500000,
            credits_granted=5,
            validity_days=30,
        )

    def test_01_client_assistance_submission_creates_lead(self):
        """1. Client assistance submission creates or links an unpublished lead."""
        client = APIClient()
        payload = {
            "full_name": "Ramesh Kumar",
            "email": "ramesh@example.com",
            "mobile": "9876543210",
            "preferred_contact": "Phone",
            "state_name": "Delhi",
            "city_name": "New Delhi",
            "category": "Property Dispute",
            "urgency": "High",
            "problem_description": "Property boundary dispute with neighbor over ancestral land.",
        }
        res = client.post("/api/v1/services/seek-assistance/", data=payload, format="json")
        self.assertEqual(res.status_code, 201)

        req = AssistanceRequest.objects.get(email="ramesh@example.com")
        self.assertTrue(hasattr(req, "marketplace_lead"))
        lead = req.marketplace_lead
        self.assertEqual(lead.status, Lead.Status.PENDING_REVIEW)
        self.assertEqual(lead.category, "Property Dispute")
        self.assertEqual(lead.price_paise, 100000)

    def test_02_existing_assistance_functionality_remains_intact(self):
        """2. Existing assistance endpoints continue working."""
        req = AssistanceRequest.objects.create(
            reference_id="ICJ-REQ-2026-99991",
            full_name="Sunita Sharma",
            email="sunita@example.com",
            mobile="9811122233",
            preferred_contact="Email",
            state_name="Maharashtra",
            city_name="Mumbai",
            category="Civil Law",
            urgency="Medium",
            problem_description="Need advice on civil recovery.",
        )
        self.assertEqual(req.status, AssistanceRequest.Status.PENDING)
        client = APIClient()
        client.force_authenticate(user=self.admin_user)
        res = client.get(f"/api/v1/admin/services/assistance-requests/{req.id}/")
        self.assertEqual(res.status_code, 200)

    def test_03_admin_review_and_publish_lead(self):
        """3. Admin can review and publish an eligible lead."""
        req = AssistanceRequest.objects.create(
            reference_id="ICJ-REQ-2026-99992",
            full_name="Vijay Singh",
            email="vijay@example.com",
            mobile="9822233344",
            preferred_contact="Phone",
            state_name="Karnataka",
            city_name="Bengaluru",
            category="Consumer Fraud",
            urgency="Medium",
            problem_description="Online shopping scam.",
        )
        lead = req.marketplace_lead
        self.assertEqual(lead.status, Lead.Status.PENDING_REVIEW)

        published_lead = LeadService.publish_lead(lead.id, admin_user=self.admin_user, notes="Approved for market")
        self.assertEqual(published_lead.status, Lead.Status.PUBLISHED)
        self.assertIsNotNone(published_lead.published_at)

    def test_04_eligible_professionals_can_view_published_preview(self):
        """4. Eligible professionals can view published lead previews in marketplace."""
        lead = Lead.objects.create(
            lead_id="ICJ-LEAD-2026-00001",
            category="Labour Law",
            urgency="High",
            state_name="Uttar Pradesh",
            city_name="Noida",
            anonymized_summary="Summary of wage claim dispute.",
            full_description="Full private description of worker.",
            price_paise=100000,
            status=Lead.Status.PUBLISHED,
            published_at=timezone.now(),
        )
        client = APIClient()
        client.force_authenticate(user=self.pro_a)
        res = client.get("/api/v1/professional/leads/")
        self.assertEqual(res.status_code, 200)
        results = res.data.get("data", {}).get("results", [])
        self.assertTrue(any(item["lead_id"] == "ICJ-LEAD-2026-00001" for item in results))

    def test_05_unauthorized_users_cannot_access_confidential_details(self):
        """5. Confidential client information is masked until acceptance."""
        req = AssistanceRequest.objects.create(
            reference_id="ICJ-REQ-2026-99993",
            full_name="Secret Client Name",
            email="secret@example.com",
            mobile="9999999999",
            preferred_contact="Phone",
            state_name="Punjab",
            city_name="Amritsar",
            category="Cyber Crime",
            urgency="Critical",
            problem_description="Extortion and confidential cyber fraud details.",
        )
        lead = req.marketplace_lead
        lead.status = Lead.Status.PUBLISHED
        lead.save()

        client = APIClient()
        client.force_authenticate(user=self.pro_a)
        res = client.get(f"/api/v1/professional/leads/{lead.id}/")
        self.assertEqual(res.status_code, 200)
        data = res.data.get("data", {})
        # Client fields must be None / masked!
        self.assertIsNone(data.get("client_name"))
        self.assertIsNone(data.get("client_email"))
        self.assertIsNone(data.get("client_mobile"))

    def test_06_wallet_balance_and_ledger(self):
        """6. Wallet balance is correctly calculated and auditable."""
        wallet = WalletService.get_or_create_wallet(self.pro_a)
        self.assertEqual(wallet.balance_paise, 0)

        WalletService.credit_wallet(self.pro_a, 200000, "Top-up 2000")
        wallet.refresh_from_db()
        self.assertEqual(wallet.balance_paise, 200000)
        self.assertEqual(wallet.available_inr, 2000.0)

        WalletService.debit_wallet(self.pro_a, 100000, "Debit 1000")
        wallet.refresh_from_db()
        self.assertEqual(wallet.balance_paise, 100000)
        self.assertEqual(wallet.available_inr, 1000.0)

    def test_07_commercial_feature_flag_blocks_paid_unlock(self):
        """20. Commercial feature flag blocks unauthorized paid lead acceptance."""
        self.settings.paid_unlock_enabled = False
        self.settings.save()

        # Give pro_a sufficient wallet balance
        WalletService.credit_wallet(self.pro_a, 500000, "Test Balance")

        lead = Lead.objects.create(
            lead_id="ICJ-LEAD-2026-00002",
            category="Civil Law",
            urgency="Medium",
            state_name="Delhi",
            city_name="Delhi",
            anonymized_summary="Summary",
            status=Lead.Status.PUBLISHED,
            price_paise=100000,
        )

        client = APIClient()
        client.force_authenticate(user=self.pro_a)
        res = client.post(f"/api/v1/professional/leads/{lead.id}/accept/", data={"payment_method": "wallet"}, format="json")
        self.assertEqual(res.status_code, 400)
        # Lead status must remain PUBLISHED
        lead.refresh_from_db()
        self.assertEqual(lead.status, Lead.Status.PUBLISHED)

    def test_08_wallet_lead_acceptance_when_enabled(self):
        """10. ₹1,000 wallet debit is recorded exactly once upon acceptance."""
        self.settings.paid_unlock_enabled = True
        self.settings.save()

        WalletService.credit_wallet(self.pro_a, 300000, "Initial ₹3,000")
        lead = Lead.objects.create(
            lead_id="ICJ-LEAD-2026-00003",
            category="Property Law",
            urgency="Medium",
            state_name="Haryana",
            city_name="Gurugram",
            anonymized_summary="Summary of property matter",
            status=Lead.Status.PUBLISHED,
            price_paise=100000,
        )

        acceptance = LeadService.accept_lead(
            lead_id=str(lead.id),
            user=self.pro_a,
            payment_method=LeadAcceptance.PaymentMethod.WALLET,
        )
        self.assertEqual(acceptance.price_paid_paise, 100000)

        wallet = ProfessionalWallet.objects.get(professional=self.pro_a)
        self.assertEqual(wallet.balance_paise, 200000)  # 3000 - 1000 = 2000
        lead.refresh_from_db()
        self.assertEqual(lead.status, Lead.Status.ACCEPTED)

    def test_09_insufficient_wallet_balance_blocks_payment(self):
        """11. Insufficient wallet balance blocks wallet payment."""
        self.settings.paid_unlock_enabled = True
        self.settings.save()

        WalletService.credit_wallet(self.pro_a, 50000, "Only ₹500")
        lead = Lead.objects.create(
            lead_id="ICJ-LEAD-2026-00004",
            category="Family Law",
            urgency="Medium",
            state_name="Delhi",
            city_name="Delhi",
            anonymized_summary="Summary",
            status=Lead.Status.PUBLISHED,
            price_paise=100000,
        )

        client = APIClient()
        client.force_authenticate(user=self.pro_a)
        res = client.post(f"/api/v1/professional/leads/{lead.id}/accept/", data={"payment_method": "wallet"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Insufficient wallet balance", res.data.get("message", ""))

    def test_10_credit_plan_purchase_and_single_credit_consumption(self):
        """8 & 9. Plan purchase grants correct credits; accepted lead consumes exactly 1 credit."""
        self.settings.paid_unlock_enabled = True
        self.settings.save()

        # Grant starter plan (5 credits)
        PlanService.grant_plan_credits(self.pro_a, self.plan)
        self.assertEqual(PlanService.get_available_credits(self.pro_a), 5)

        lead = Lead.objects.create(
            lead_id="ICJ-LEAD-2026-00005",
            category="Corporate Law",
            urgency="Low",
            state_name="Maharashtra",
            city_name="Pune",
            anonymized_summary="Summary",
            status=Lead.Status.PUBLISHED,
            price_paise=100000,
        )

        LeadService.accept_lead(
            lead_id=str(lead.id),
            user=self.pro_a,
            payment_method=LeadAcceptance.PaymentMethod.LEAD_CREDIT,
        )
        self.assertEqual(PlanService.get_available_credits(self.pro_a), 4)

    def test_11_two_professionals_cannot_exclusively_accept_same_lead(self):
        """14. Two professionals cannot exclusively accept the same lead."""
        self.settings.paid_unlock_enabled = True
        self.settings.save()

        WalletService.credit_wallet(self.pro_a, 200000, "Pro A Balance")
        WalletService.credit_wallet(self.pro_b, 200000, "Pro B Balance")

        lead = Lead.objects.create(
            lead_id="ICJ-LEAD-2026-00006",
            category="Criminal Law",
            urgency="High",
            state_name="Delhi",
            city_name="Delhi",
            anonymized_summary="Summary",
            status=Lead.Status.PUBLISHED,
            price_paise=100000,
        )

        # Pro A accepts lead
        LeadService.accept_lead(
            lead_id=str(lead.id),
            user=self.pro_a,
            payment_method=LeadAcceptance.PaymentMethod.WALLET,
        )

        # Pro B tries to accept lead
        client = APIClient()
        client.force_authenticate(user=self.pro_b)
        res = client.post(f"/api/v1/professional/leads/{lead.id}/accept/", data={"payment_method": "wallet"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("already been accepted", res.data.get("message", ""))

        # Pro B's wallet must NOT be deducted
        wallet_b = ProfessionalWallet.objects.get(professional=self.pro_b)
        self.assertEqual(wallet_b.balance_paise, 200000)

    def test_12_reservation_and_expiry(self):
        """16. Expired reservations release correctly."""
        lead = Lead.objects.create(
            lead_id="ICJ-LEAD-2026-00007",
            category="Cyber Law",
            urgency="Medium",
            state_name="Delhi",
            city_name="Delhi",
            anonymized_summary="Summary",
            status=Lead.Status.PUBLISHED,
            price_paise=100000,
        )

        res = LeadService.reserve_lead(str(lead.id), user=self.pro_a)
        self.assertEqual(res.status, LeadReservation.Status.ACTIVE)

        # Pro B tries to reserve active reservation -> blocked
        with self.assertRaises(Exception):
            LeadService.reserve_lead(str(lead.id), user=self.pro_b)

        # Fast forward time to expire reservation
        res.expires_at = timezone.now() - timedelta(minutes=1)
        res.save()

        # Pro B can now reserve
        res_b = LeadService.reserve_lead(str(lead.id), user=self.pro_b)
        self.assertEqual(res_b.status, LeadReservation.Status.ACTIVE)
        self.assertEqual(res_b.professional, self.pro_b)

    def test_13_refund_compensating_ledger(self):
        """18. Refunds use compensating ledger entries."""
        self.settings.paid_unlock_enabled = True
        self.settings.save()

        WalletService.credit_wallet(self.pro_a, 200000, "Pro A Balance")
        lead = Lead.objects.create(
            lead_id="ICJ-LEAD-2026-00008",
            category="Civil Law",
            urgency="Medium",
            state_name="Delhi",
            city_name="Delhi",
            anonymized_summary="Summary",
            status=Lead.Status.PUBLISHED,
            price_paise=100000,
        )

        acceptance = LeadService.accept_lead(
            lead_id=str(lead.id),
            user=self.pro_a,
            payment_method=LeadAcceptance.PaymentMethod.WALLET,
        )
        self.assertEqual(acceptance.price_paid_paise, 100000)

        # Pro A requests refund
        req = LeadService.request_refund(str(lead.id), user=self.pro_a, reason="Client conflict of interest")
        self.assertEqual(req.status, RefundRequest.Status.PENDING)

        # Admin approves refund
        LeadService.process_refund(str(req.id), admin_user=self.admin_user, approve=True, notes="Valid conflict")
        acceptance.refresh_from_db()
        self.assertEqual(acceptance.status, LeadAcceptance.Status.REFUNDED)

        # Wallet should be credited back ₹1,000
        wallet = ProfessionalWallet.objects.get(professional=self.pro_a)
        self.assertEqual(wallet.balance_paise, 200000)
