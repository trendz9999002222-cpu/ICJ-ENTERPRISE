import hashlib
import json
from datetime import date, timedelta
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import (
    User,
    ProfessionalApplication,
    ApplicationDocument,
    ApplicationReviewHistory,
)
from apps.services.models import (
    AssistanceRequest,
    LegalCase,
    CaseAssignmentHistory,
    CaseInstallmentSchedule,
    CaseOtpVerification,
)


class ICJRebuildFeaturesTests(TestCase):
    def setUp(self):
        self.super_admin = User.objects.create_superuser(
            username="superadmin_test",
            email="superadmin@test.com",
            password="AdminPassword123!",
            role=User.Role.SUPER_ADMIN,
        )
        self.admin = User.objects.create_user(
            username="admin_test2",
            email="admin2@test.com",
            password="AdminPassword123!",
            role=User.Role.ADMIN,
        )
        self.member = User.objects.create_user(
            username="member_test",
            email="member@test.com",
            password="MemberPassword123!",
            role=User.Role.MEMBER,
            first_name="Rajesh",
            last_name="Sharma",
            phone_number="9876543210",
        )
        self.advocate = User.objects.create_user(
            username="advocate_test",
            email="advocate@test.com",
            password="AdvocatePassword123!",
            role=User.Role.LEGAL_PROFESSIONAL,
            first_name="Ananya",
            last_name="Deshmukh",
        )
        self.advocate2 = User.objects.create_user(
            username="advocate2_test",
            email="advocate2@test.com",
            password="AdvocatePassword123!",
            role=User.Role.LEGAL_PROFESSIONAL,
            first_name="Vikram",
            last_name="Seth",
        )

    def test_01_profile_completion_endpoint(self):
        """Profile completion returns percentage and missing fields list."""
        client = APIClient()
        client.force_authenticate(user=self.member)
        res = client.get("/api/v1/auth/profile-completion/")
        self.assertEqual(res.status_code, 200)
        data = res.data.get("data", {})
        self.assertIn("completion_percentage", data)
        self.assertIn("is_complete", data)
        self.assertIn("missing_fields", data)
        # Should have missing date_of_birth and address
        missing_keys = [f["key"] for f in data["missing_fields"]]
        self.assertIn("date_of_birth", missing_keys)
        self.assertIn("address", missing_keys)

    def test_02_professional_application_submission_and_status(self):
        """Member can submit a professional application and check status."""
        client = APIClient()
        client.force_authenticate(user=self.member)

        payload = {
            "pathway": ProfessionalApplication.Pathway.LEGAL_PROFESSIONAL,
            "category": "Advocate",
            "personal_data": {
                "full_name": "Rajesh Sharma",
                "email": "member@test.com",
                "phone": "9876543210",
                "date_of_birth": "1990-05-15",
                "address": "42 Barakhamba Road, New Delhi",
            },
            "professional_data": {
                "enrollment_number": "D/1234/2015",
                "bar_council": "Bar Council of Delhi",
                "year_of_enrollment": 2015,
                "experience_years": 9,
                "practice_areas": ["Civil", "Constitutional"],
            },
            "declaration_accepted": True,
        }
        res = client.post("/api/v1/applications/submit/", data=payload, format="json")
        self.assertEqual(res.status_code, 201)
        ref = res.data.get("data", {}).get("application_reference")
        self.assertTrue(ref.startswith("ICJ-APP-"))

        # Check status
        res_status = client.get("/api/v1/applications/my-status/")
        self.assertEqual(res_status.status_code, 200)
        apps_list = res_status.data.get("data", [])
        self.assertTrue(len(apps_list) >= 1)
        self.assertEqual(apps_list[0]["status"], "under_review")

    def test_03_admin_application_review_and_approval(self):
        """Admin can approve an application, upgrading user role to legal_professional."""
        app = ProfessionalApplication.objects.create(
            user=self.member,
            application_reference="ICJ-APP-2026-TEST1",
            pathway=ProfessionalApplication.Pathway.LEGAL_PROFESSIONAL,
            category="Advocate",
            status=ProfessionalApplication.Status.UNDER_REVIEW,
        )

        client = APIClient()
        client.force_authenticate(user=self.admin)
        res = client.post(
            f"/api/v1/admin/applications/{app.id}/review/",
            data={"action": "approve", "notes": "Verified Bar Council enrollment."},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        app.refresh_from_db()
        self.assertEqual(app.status, ProfessionalApplication.Status.APPROVED)
        self.assertEqual(app.reviewed_by, self.admin)

        # User role must be upgraded
        self.member.refresh_from_db()
        self.assertEqual(self.member.role, User.Role.LEGAL_PROFESSIONAL)

    def test_04_2factor_case_tracking(self):
        """Citizen can initiate and verify 2-factor OTP case tracking."""
        ar = AssistanceRequest.objects.create(
            reference_id="ICJ-CASE-TRACK-001",
            full_name="Pooja Verma",
            email="pooja@example.com",
            mobile="9876500001",
            problem_description="Property dispute matter in Delhi High Court.",
            category="Property Law",
        )

        client = APIClient()
        # Step 1: Initiate
        res_init = client.post(
            "/api/v1/services/cases/track/initiate/",
            data={"case_id": "ICJ-CASE-TRACK-001", "contact": "pooja@example.com"},
            format="json",
        )
        self.assertEqual(res_init.status_code, 200)
        data = res_init.data.get("data", {})
        session_id = data.get("session_id")
        self.assertTrue(session_id.startswith("otp-sess-"))

        # Verify record exists in DB and set known test OTP hash
        otp_rec = CaseOtpVerification.objects.get(session_id=session_id)
        self.assertEqual(otp_rec.case_reference, "ICJ-CASE-TRACK-001")
        test_otp = "654321"
        otp_rec.otp_hash = hashlib.sha256(test_otp.encode("utf-8")).hexdigest()
        otp_rec.save()

        # Step 2: Verify with correct OTP
        res_ver = client.post(
            "/api/v1/services/cases/track/verify/",
            data={"case_id": "ICJ-CASE-TRACK-001", "session_id": session_id, "otp": test_otp},
            format="json",
        )
        self.assertEqual(res_ver.status_code, 200)
        track_data = res_ver.data.get("data", {})
        self.assertEqual(track_data["case_id"], "ICJ-CASE-TRACK-001")
        self.assertIn("milestones", track_data)

    def test_05_admin_case_reassignment_with_audit(self):
        """Admin can reassign a case to a new professional with mandatory reason."""
        ar = AssistanceRequest.objects.create(
            reference_id="ICJ-REQ-REASSIGN-1",
            full_name="Karan Johar",
            email="karan@example.com",
            mobile="9811223344",
            problem_description="Commercial contract breach.",
        )
        lc = LegalCase.objects.create(
            case_id="ICJ-MATTER-REASSIGN-1",
            assistance_request=ar,
            professional=self.advocate,
            status=LegalCase.Status.ASSIGNED,
            budget=Decimal("50000.00"),
            client_fee_agreed=Decimal("40000.00"),
        )

        client = APIClient()
        client.force_authenticate(user=self.admin)
        res = client.post(
            f"/api/v1/admin/services/cases/{lc.id}/reassign/",
            data={
                "new_professional_id": self.advocate2.pk,
                "reassignment_reason": "Advocate Ananya has requested conflict of interest transfer.",
                "notify_client": True,
            },
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        lc.refresh_from_db()
        self.assertEqual(lc.professional, self.advocate2)

        # Audit trail must exist
        self.assertEqual(lc.assignment_history.count(), 1)
        history = lc.assignment_history.first()
        self.assertEqual(history.previous_professional, self.advocate)
        self.assertEqual(history.new_professional, self.advocate2)
        self.assertEqual(history.reassigned_by, self.admin)
        self.assertIn("conflict of interest", history.reason)

    def test_06_admin_case_installment_schedule(self):
        """Admin can configure milestone installment schedules ensuring <= 100%."""
        ar = AssistanceRequest.objects.create(
            reference_id="ICJ-REQ-INST-1",
            full_name="Meera Bai",
            email="meera@example.com",
            mobile="9822334455",
            problem_description="Civil appeal matter.",
        )
        lc = LegalCase.objects.create(
            case_id="ICJ-MATTER-INST-1",
            assistance_request=ar,
            professional=self.advocate,
            client_fee_agreed=Decimal("100000.00"),
        )

        client = APIClient()
        client.force_authenticate(user=self.admin)

        # Add installment 1 (40%)
        res1 = client.post(
            f"/api/v1/admin/services/cases/{lc.id}/installments/",
            data={
                "installment_number": 1,
                "percentage": "40.00",
                "amount": "40000.00",
                "due_date": str(date.today() + timedelta(days=15)),
            },
            format="json",
        )
        self.assertEqual(res1.status_code, 201)

        # Add installment 2 (60%)
        res2 = client.post(
            f"/api/v1/admin/services/cases/{lc.id}/installments/",
            data={
                "installment_number": 2,
                "percentage": "60.00",
                "amount": "60000.00",
                "due_date": str(date.today() + timedelta(days=45)),
            },
            format="json",
        )
        self.assertEqual(res2.status_code, 201)

        # Attempt to add installment 3 (20%) -> Total 120% -> Must fail with 400
        res3 = client.post(
            f"/api/v1/admin/services/cases/{lc.id}/installments/",
            data={
                "installment_number": 3,
                "percentage": "20.00",
                "amount": "20000.00",
            },
            format="json",
        )
        self.assertEqual(res3.status_code, 400)
        self.assertIn("exceed 100%", res3.data.get("message", ""))
