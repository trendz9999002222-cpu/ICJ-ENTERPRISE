import uuid
from decimal import Decimal
from django.db import models, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.listing import apply_ordering, apply_search
from common.responses import api_error, api_success
from apps.accounts.permissions import IsAdminRole, PasswordChangeCompleted
import random
from apps.services.models import (
    AssistanceRequest,
    LeadCommercialSettings,
    LeadCreditPlan,
    MarketplaceLead,
    ProfessionalPayment,
    ProfessionalWallet,
    WalletTransaction,
)
from apps.services.serializers import (
    LeadCommercialSettingsSerializer,
    LeadCreditPlanSerializer,
    MarketplaceLeadDetailSerializer,
    ProfessionalPaymentSerializer,
    ProfessionalWalletSerializer,
    WalletTransactionSerializer,
)


def sync_assistance_requests_to_leads():
    """
    Ensures every citizen seek-assistance intake has a corresponding MarketplaceLead
    so it appears immediately in the Unified Leads Management table.
    """
    orphaned_requests = AssistanceRequest.objects.filter(marketplace_lead__isnull=True).order_by("-created_at")
    if not orphaned_requests.exists():
        return

    settings_obj = LeadCommercialSettings.objects.first()
    default_price = settings_obj.default_lead_price_paise if settings_obj else 50000
    tax = settings_obj.tax_percentage if settings_obj else Decimal("18.00")
    year = timezone.now().year

    for req in orphaned_requests[:100]:
        lead_id = f"LEAD-{year}-{random.randint(10000, 99999)}"
        while MarketplaceLead.objects.filter(lead_id=lead_id).exists():
            lead_id = f"LEAD-{year}-{random.randint(10000, 99999)}"

        summary = (req.problem_description or "").strip()
        if len(summary) > 220:
            summary = summary[:217] + "..."

        urgency_raw = (req.urgency or "medium").lower()
        if "high" in urgency_raw or "critical" in urgency_raw:
            urgency_clean = "high"
        elif "low" in urgency_raw:
            urgency_clean = "low"
        else:
            urgency_clean = "medium"

        MarketplaceLead.objects.create(
            lead_id=lead_id,
            assistance_request=req,
            category=req.category or "General Legal Assistance",
            urgency=urgency_clean,
            state_name=req.state_name or "",
            city_name=req.city_name or "",
            anonymized_summary=summary or f"Assistance request for {req.category or 'General Legal Assistance'}",
            full_description=req.problem_description or "",
            price_paise=default_price,
            tax_percentage=tax,
            status=MarketplaceLead.Status.PENDING_REVIEW,
            client_name=req.full_name or "",
            client_email=req.email or "",
            client_mobile=req.mobile or "",
            client_preferred_contact=req.preferred_contact or "Phone",
        )


class AdminLeadsBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted, IsAdminRole]


# ============================================================================
# Marketplace Leads Management
# ============================================================================

class AdminLeadsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        sync_assistance_requests_to_leads()
        params = list_params(request)
        qs = MarketplaceLead.objects.select_related('accepted_by', 'assistance_request').all()

        status_param = request.query_params.get("status")
        if status_param and status_param != "all":
            qs = qs.filter(status=status_param)

        category_param = request.query_params.get("category")
        if category_param and category_param != "all":
            qs = qs.filter(category__iexact=category_param)

        search = params.get("search")
        if search:
            qs = qs.filter(
                models.Q(lead_id__icontains=search)
                | models.Q(category__icontains=search)
                | models.Q(anonymized_summary__icontains=search)
                | models.Q(city_name__icontains=search)
                | models.Q(state_name__icontains=search)
                | models.Q(client_name__icontains=search)
                | models.Q(client_email__icontains=search)
                | models.Q(assistance_request__reference_id__icontains=search)
            )

        qs = apply_ordering(qs, params.get("ordering"), "-created_at")

        return paginated_success(
            request,
            qs,
            lambda page, **kwargs: MarketplaceLeadDetailSerializer(page, context={"request": request}, **kwargs),
            message="Leads retrieved.",
        )


class AdminLeadDetailAPIView(AdminLeadsBaseView):
    def get(self, request, pk):
        lead = get_object_or_404(MarketplaceLead.objects.select_related('accepted_by', 'assistance_request'), pk=pk)
        return api_success(
            data=MarketplaceLeadDetailSerializer(lead, context={"request": request}).data,
            message="Lead details retrieved.",
        )


class AdminLeadPublishAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        lead = get_object_or_404(MarketplaceLead, pk=pk)
        lead.status = MarketplaceLead.Status.PUBLISHED
        if not lead.published_at:
            lead.published_at = timezone.now()
        lead.save()
        return api_success(
            data=MarketplaceLeadDetailSerializer(lead, context={"request": request}).data,
            message=f"Lead {lead.lead_id} published to marketplace successfully.",
        )


class AdminLeadUnpublishAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        lead = get_object_or_404(MarketplaceLead, pk=pk)
        lead.status = MarketplaceLead.Status.UNAVAILABLE
        lead.save()
        return api_success(
            data=MarketplaceLeadDetailSerializer(lead, context={"request": request}).data,
            message=f"Lead {lead.lead_id} marked as unavailable.",
        )


class AdminLeadPricingAPIView(AdminLeadsBaseView):
    def patch(self, request, pk):
        lead = get_object_or_404(MarketplaceLead, pk=pk)
        price_paise = request.data.get("price_paise")
        tax_percentage = request.data.get("tax_percentage")

        if price_paise is not None:
            try:
                lead.price_paise = int(price_paise)
            except (ValueError, TypeError):
                return api_error("Invalid price value.", status_code=status.HTTP_400_BAD_REQUEST)

        if tax_percentage is not None:
            try:
                lead.tax_percentage = Decimal(str(tax_percentage))
            except Exception:
                return api_error("Invalid tax percentage.", status_code=status.HTTP_400_BAD_REQUEST)

        lead.save()
        return api_success(
            data=MarketplaceLeadDetailSerializer(lead, context={"request": request}).data,
            message=f"Pricing updated for lead {lead.lead_id}.",
        )


# ============================================================================
# Professional Wallets & Transactions
# ============================================================================

class AdminWalletsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = ProfessionalWallet.objects.select_related('user').all()

        search = params.get("search")
        if search:
            qs = qs.filter(
                models.Q(user__email__icontains=search)
                | models.Q(user__first_name__icontains=search)
                | models.Q(user__last_name__icontains=search)
                | models.Q(user__phone_number__icontains=search)
            )

        qs = apply_ordering(qs, params.get("ordering"), "-updated_at")

        return paginated_success(
            request,
            qs,
            ProfessionalWalletSerializer,
            message="Wallets retrieved.",
        )


class AdminWalletAdjustAPIView(AdminLeadsBaseView):
    @transaction.atomic
    def post(self, request, pk):
        wallet = get_object_or_404(ProfessionalWallet.objects.select_related('user'), pk=pk)
        amount_inr = request.data.get("amount_inr")
        is_credit = bool(request.data.get("is_credit", True))
        reason = (request.data.get("reason") or "").strip() or "Admin Adjustment"

        try:
            amt = float(amount_inr)
            if amt <= 0:
                return api_error("Adjustment amount must be positive.", status_code=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return api_error("Invalid adjustment amount.", status_code=status.HTTP_400_BAD_REQUEST)

        amount_paise = int(round(amt * 100))

        if is_credit:
            wallet.balance_paise += amount_paise
            tx_type = WalletTransaction.TxType.ADJUSTMENT
        else:
            if wallet.balance_paise < amount_paise:
                return api_error("Insufficient wallet balance for debit adjustment.", status_code=status.HTTP_400_BAD_REQUEST)
            wallet.balance_paise -= amount_paise
            tx_type = WalletTransaction.TxType.DEBIT

        wallet.save()

        tx = WalletTransaction.objects.create(
            wallet=wallet,
            reference=f"ADJ-{uuid.uuid4().hex[:8].upper()}",
            tx_type=tx_type,
            amount_paise=amount_paise,
            balance_after_paise=wallet.balance_paise,
            description=reason,
        )

        return api_success(
            data={
                "wallet": ProfessionalWalletSerializer(wallet).data,
                "transaction": WalletTransactionSerializer(tx).data,
            },
            message=f"Wallet successfully adjusted by ₹{amt:.2f}.",
        )


class AdminWalletTransactionsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = WalletTransaction.objects.select_related('wallet', 'wallet__user').all()

        tx_type = request.query_params.get("type")
        if tx_type and tx_type != "all":
            qs = qs.filter(tx_type=tx_type)

        search = params.get("search")
        if search:
            qs = qs.filter(
                models.Q(reference__icontains=search)
                | models.Q(description__icontains=search)
                | models.Q(wallet__user__email__icontains=search)
            )

        qs = apply_ordering(qs, params.get("ordering"), "-created_at")

        return paginated_success(
            request,
            qs,
            WalletTransactionSerializer,
            message="Wallet transactions retrieved.",
        )


# ============================================================================
# Lead Credit Plans
# ============================================================================

class AdminLeadPlansListCreateAPIView(AdminLeadsBaseView):
    def get(self, request):
        plans = LeadCreditPlan.objects.all().order_by("display_order", "price_paise")
        return api_success(
            data=LeadCreditPlanSerializer(plans, many=True).data,
            message="Lead credit plans retrieved.",
        )

    def post(self, request):
        data = dict(request.data)
        # Handle price_inr if provided instead of price_paise
        if "price_inr" in data and not data.get("price_paise"):
            try:
                data["price_paise"] = int(round(float(data["price_inr"]) * 100))
            except (ValueError, TypeError):
                pass

        if not data.get("code") and data.get("name"):
            import re
            data["code"] = re.sub(r'[^a-zA-Z0-9_]', '_', data["name"]).upper()[:30]

        serializer = LeadCreditPlanSerializer(data=data)
        if not serializer.is_valid():
            return api_error("Validation error", serializer.errors, status.HTTP_400_BAD_REQUEST)

        plan = serializer.save()
        return api_success(
            data=LeadCreditPlanSerializer(plan).data,
            message="Lead credit plan created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class AdminLeadPlanDetailAPIView(AdminLeadsBaseView):
    def get(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk)
        return api_success(data=LeadCreditPlanSerializer(plan).data)

    def patch(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk)
        data = dict(request.data)
        if "price_inr" in data:
            try:
                data["price_paise"] = int(round(float(data["price_inr"]) * 100))
            except (ValueError, TypeError):
                pass

        serializer = LeadCreditPlanSerializer(plan, data=data, partial=True)
        if not serializer.is_valid():
            return api_error("Validation error", serializer.errors, status.HTTP_400_BAD_REQUEST)

        updated = serializer.save()
        return api_success(data=LeadCreditPlanSerializer(updated).data, message="Plan updated.")

    def delete(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk)
        plan.delete()
        return api_success(message="Plan deleted successfully.")


# ============================================================================
# Payments & Refunds
# ============================================================================

class AdminPaymentsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = ProfessionalPayment.objects.select_related('user').all()

        st = request.query_params.get("status")
        if st and st != "all":
            qs = qs.filter(status=st)

        search = params.get("search")
        if search:
            qs = qs.filter(
                models.Q(order_id__icontains=search)
                | models.Q(easebuzz_txnid__icontains=search)
                | models.Q(user__email__icontains=search)
            )

        qs = apply_ordering(qs, params.get("ordering"), "-created_at")

        return paginated_success(
            request,
            qs,
            ProfessionalPaymentSerializer,
            message="Payment orders retrieved.",
        )


class AdminRefundsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        # Collect refund requests from ProfessionalPayment where status='refunded' or metadata indicates refund
        # and from leads where status is refund_requested
        st_filter = request.query_params.get("status")

        refund_items = []

        # 1. From MarketplaceLead with refund requested
        leads_qs = MarketplaceLead.objects.filter(
            models.Q(status="refund_requested")
            | models.Q(acceptance_payment_method__icontains="refund")
        ).select_related('accepted_by')

        for lead in leads_qs:
            status_val = "pending" if lead.status == "refund_requested" else "approved"
            if st_filter and st_filter != "all" and status_val != st_filter:
                continue
            refund_items.append({
                "id": str(lead.id),
                "professional_email": lead.accepted_by.email if lead.accepted_by else "—",
                "reason": f"Lead {lead.lead_id}: Lead client unresponsive or disputed",
                "amount_paise": lead.price_paise,
                "amount_inr": lead.price_inr,
                "status": status_val,
                "created_at": lead.updated_at.isoformat() if lead.updated_at else timezone.now().isoformat(),
            })

        # 2. From ProfessionalPayment with status='refunded'
        payments_qs = ProfessionalPayment.objects.filter(status="refunded").select_related('user')
        for pay in payments_qs:
            status_val = "approved"
            if st_filter and st_filter != "all" and status_val != st_filter:
                continue
            meta = pay.metadata if isinstance(pay.metadata, dict) else {}
            refund_items.append({
                "id": str(pay.id),
                "professional_email": pay.user.email if pay.user else "—",
                "reason": meta.get("refund_reason") or f"Payment refund for order {pay.order_id}",
                "amount_paise": pay.amount_paise,
                "amount_inr": pay.amount_inr,
                "status": status_val,
                "created_at": pay.updated_at.isoformat() if pay.updated_at else timezone.now().isoformat(),
            })

        count = len(refund_items)
        page = int(params.get("page") or 1)
        page_size = int(params.get("page_size") or 10)
        start = (page - 1) * page_size
        end = start + page_size
        paged_results = refund_items[start:end]

        return api_success(
            data={
                "results": paged_results,
                "count": count,
                "next": f"?page={page+1}&page_size={page_size}" if end < count else None,
                "previous": f"?page={page-1}&page_size={page_size}" if page > 1 else None,
            },
            message="Refund requests retrieved.",
        )


class AdminRefundProcessAPIView(AdminLeadsBaseView):
    @transaction.atomic
    def post(self, request, pk):
        approve = bool(request.data.get("approve", True))
        notes = (request.data.get("notes") or "").strip()

        # Check if pk is a MarketplaceLead
        lead = MarketplaceLead.objects.filter(pk=pk).select_related('accepted_by').first()
        if lead:
            if approve:
                lead.status = MarketplaceLead.Status.UNAVAILABLE
                lead.save()
                # Credit back professional wallet
                if lead.accepted_by:
                    wallet, _ = ProfessionalWallet.objects.get_or_create(user=lead.accepted_by)
                    wallet.balance_paise += lead.price_paise
                    wallet.save()
                    WalletTransaction.objects.create(
                        wallet=wallet,
                        reference=f"REF-{lead.lead_id}",
                        tx_type=WalletTransaction.TxType.REFUND,
                        amount_paise=lead.price_paise,
                        balance_after_paise=wallet.balance_paise,
                        description=f"Refund approved for Lead {lead.lead_id}. Notes: {notes}",
                    )
                return api_success(message=f"Refund approved and ₹{lead.price_inr:.2f} credited back to wallet.")
            else:
                lead.status = MarketplaceLead.Status.ACCEPTED
                lead.save()
                return api_success(message="Refund request rejected.")

        # Check if pk is a ProfessionalPayment
        payment = ProfessionalPayment.objects.filter(pk=pk).select_related('user').first()
        if payment:
            if not isinstance(payment.metadata, dict):
                payment.metadata = {}
            if approve:
                payment.status = ProfessionalPayment.Status.REFUNDED
                payment.metadata['refund_notes'] = notes
                payment.metadata['refunded_at'] = timezone.now().isoformat()
                payment.save()
                return api_success(message=f"Payment {payment.order_id} marked as refunded.")
            else:
                payment.metadata['refund_rejected_notes'] = notes
                payment.save()
                return api_success(message="Refund request rejected.")

        return api_error("Refund record not found.", status_code=status.HTTP_404_NOT_FOUND)


# ============================================================================
# Lead Commercial Settings
# ============================================================================

class AdminLeadCommercialSettingsAPIView(AdminLeadsBaseView):
    def get(self, request):
        settings_obj = LeadCommercialSettings.objects.first()
        if not settings_obj:
            settings_obj = LeadCommercialSettings.objects.create()
        return api_success(
            data=LeadCommercialSettingsSerializer(settings_obj).data,
            message="Commercial settings retrieved.",
        )

    def patch(self, request):
        settings_obj = LeadCommercialSettings.objects.first()
        if not settings_obj:
            settings_obj = LeadCommercialSettings.objects.create()

        serializer = LeadCommercialSettingsSerializer(settings_obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_error("Validation error", serializer.errors, status.HTTP_400_BAD_REQUEST)

        updated = serializer.save()
        return api_success(
            data=LeadCommercialSettingsSerializer(updated).data,
            message="Commercial settings updated successfully.",
        )


# ============================================================================
# Lead Reports & Analytics
# ============================================================================

class AdminLeadReportsAPIView(AdminLeadsBaseView):
    def get(self, request):
        total_leads = MarketplaceLead.objects.count()
        published_leads = MarketplaceLead.objects.filter(status=MarketplaceLead.Status.PUBLISHED).count()
        accepted_leads = MarketplaceLead.objects.filter(status=MarketplaceLead.Status.ACCEPTED).count()
        pending_review = MarketplaceLead.objects.filter(status=MarketplaceLead.Status.PENDING_REVIEW).count()

        conversion_rate_percent = round((accepted_leads / total_leads * 100), 2) if total_leads > 0 else 0.0

        revenue_agg = ProfessionalPayment.objects.filter(
            status=ProfessionalPayment.Status.SUCCESS
        ).aggregate(total=models.Sum('amount_paise'))['total'] or 0
        total_revenue_inr = round(revenue_agg / 100.0, 2)

        wallet_agg = ProfessionalWallet.objects.aggregate(total=models.Sum('balance_paise'))['total'] or 0
        total_wallet_balance_inr = round(wallet_agg / 100.0, 2)

        topup_agg = ProfessionalPayment.objects.filter(
            status=ProfessionalPayment.Status.SUCCESS,
            order_type=ProfessionalPayment.Purpose.WALLET_TOPUP
        ).aggregate(total=models.Sum('amount_paise'))['total'] or 0
        total_wallet_topups_inr = round(topup_agg / 100.0, 2)

        data = {
            "total_leads": total_leads,
            "published_leads": published_leads,
            "accepted_leads": accepted_leads,
            "pending_review": pending_review,
            "conversion_rate_percent": conversion_rate_percent,
            "total_revenue_inr": total_revenue_inr,
            "total_wallet_balance_inr": total_wallet_balance_inr,
            "total_wallet_topups_inr": total_wallet_topups_inr,
        }

        return api_success(
            data=data,
            message="Lead reports & analytics retrieved.",
        )
