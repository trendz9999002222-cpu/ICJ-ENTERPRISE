from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.listing import apply_ordering, apply_search
from common.responses import api_error, api_success
from apps.accounts.permissions import IsAdminRole, PasswordChangeCompleted
from apps.accounts.models import User
from apps.leads.models import (
    Lead,
    LeadAcceptance,
    LeadCommercialSettings,
    LeadCreditPlan,
    ProfessionalWallet,
    WalletTransaction,
    PaymentOrder,
    RefundRequest,
    LeadAuditLog,
)
from apps.leads.serializers import (
    LeadDetailSerializer,
    LeadAcceptanceSerializer,
    LeadCommercialSettingsSerializer,
    LeadCreditPlanSerializer,
    ProfessionalWalletSerializer,
    WalletTransactionSerializer,
    PaymentOrderSerializer,
    RefundRequestSerializer,
)
from apps.leads.services.lead_service import LeadService
from apps.leads.services.wallet_service import WalletService


class AdminLeadsBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted, IsAdminRole]

    def get_request_data(self, request):
        data = request.data
        if isinstance(data, str):
            import json
            try:
                data = json.loads(data)
            except Exception:
                data = {}
        return data if isinstance(data, dict) else {}


class AdminLeadListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = Lead.objects.select_related("assistance_request", "acceptance", "legal_case").all()

        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)

        category = request.query_params.get("category")
        if category and category != "all":
            qs = qs.filter(category=category)

        qs = apply_search(qs, params.get("search"), "lead_id", "category", "assistance_request__full_name", "state_name")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, LeadDetailSerializer, message="Admin leads retrieved.")


class AdminLeadDetailAPIView(AdminLeadsBaseView):
    def get(self, request, pk):
        lead = get_object_or_404(Lead.objects.select_related("assistance_request", "acceptance"), pk=pk)
        return api_success(data=LeadDetailSerializer(lead, context={"request": request}).data, message="Lead retrieved.")

    def patch(self, request, pk):
        lead = get_object_or_404(Lead, pk=pk)
        data = self.get_request_data(request)
        if "price_paise" in data:
            lead.price_paise = int(data["price_paise"])
        if "category" in data:
            lead.category = data["category"]
        if "urgency" in data:
            lead.urgency = data["urgency"]
        if "anonymized_summary" in data:
            lead.anonymized_summary = data["anonymized_summary"]
        lead.save()
        return api_success(data=LeadDetailSerializer(lead, context={"request": request}).data, message="Lead updated.")


class AdminLeadPublishAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        data = self.get_request_data(request)
        notes = data.get("notes", "")
        try:
            lead = LeadService.publish_lead(lead_id=pk, admin_user=request.user, notes=notes)
            return api_success(
                data=LeadDetailSerializer(lead, context={"request": request}).data,
                message=f"Lead {lead.lead_id} successfully published to marketplace.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class AdminLeadUnpublishAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        data = self.get_request_data(request)
        notes = data.get("notes", "")
        try:
            lead = LeadService.unpublish_lead(lead_id=pk, admin_user=request.user, notes=notes)
            return api_success(
                data=LeadDetailSerializer(lead, context={"request": request}).data,
                message=f"Lead {lead.lead_id} unpublished from marketplace.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class AdminLeadPricingUpdateAPIView(AdminLeadsBaseView):
    def patch(self, request, pk):
        lead = get_object_or_404(Lead, pk=pk)
        if lead.status == Lead.Status.ACCEPTED:
            return api_error("Cannot alter pricing of an already accepted lead.", status_code=400)

        data = self.get_request_data(request)
        price_paise = data.get("price_paise")
        if price_paise is not None:
            lead.price_paise = int(price_paise)
        tax = data.get("tax_percentage")
        if tax is not None:
            lead.tax_percentage = tax
        lead.save()
        return api_success(data=LeadDetailSerializer(lead, context={"request": request}).data, message="Pricing updated.")


class AdminWalletsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = ProfessionalWallet.objects.select_related("professional").all()
        qs = apply_search(qs, params.get("search"), "professional__email", "professional__first_name")
        qs = apply_ordering(qs, params.get("ordering"), "-balance_paise")
        return paginated_success(request, qs, ProfessionalWalletSerializer, message="Wallets retrieved.")


class AdminWalletAdjustAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        wallet = get_object_or_404(ProfessionalWallet, pk=pk)
        data = self.get_request_data(request)
        amount_paise = data.get("amount_paise")
        is_credit = data.get("is_credit", True)
        reason = data.get("reason", "")

        if not amount_paise:
            amount_inr = data.get("amount_inr")
            if amount_inr:
                amount_paise = int(float(amount_inr) * 100)

        if not amount_paise or int(amount_paise) <= 0:
            return api_error("Valid positive adjustment amount required.", status_code=400)
        if not reason:
            return api_error("Audit reason is required for adjustments.", status_code=400)

        try:
            tx = WalletService.admin_adjust_balance(
                admin_user=request.user,
                target_user=wallet.professional,
                amount_paise=int(amount_paise),
                is_credit=bool(is_credit),
                reason=reason,
            )
            return api_success(
                data=WalletTransactionSerializer(tx).data,
                message=f"Wallet balance adjusted by ₹{tx.amount_paise / 100:.2f}.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class AdminWalletTransactionsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = WalletTransaction.objects.select_related("wallet__professional", "created_by").all()
        tx_type = request.query_params.get("type")
        if tx_type and tx_type != "all":
            qs = qs.filter(tx_type=tx_type)
        qs = apply_search(qs, params.get("search"), "reference", "wallet__professional__email", "description")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, WalletTransactionSerializer, message="Wallet transactions retrieved.")


class AdminLeadCreditPlansListCreateAPIView(AdminLeadsBaseView):
    def get(self, request):
        qs = LeadCreditPlan.objects.all().order_by("display_order", "price_paise")
        return api_success(data=LeadCreditPlanSerializer(qs, many=True).data, message="Plans retrieved.")

    def post(self, request):
        data = self.get_request_data(request)
        serializer = LeadCreditPlanSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return api_success(data=LeadCreditPlanSerializer(obj).data, message="Plan created.", status_code=201)


class AdminLeadCreditPlanDetailAPIView(AdminLeadsBaseView):
    def get(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk)
        return api_success(data=LeadCreditPlanSerializer(plan).data, message="Plan retrieved.")

    def patch(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk)
        data = self.get_request_data(request)
        serializer = LeadCreditPlanSerializer(plan, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return api_success(data=LeadCreditPlanSerializer(obj).data, message="Plan updated.")

    def delete(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk)
        plan.is_active = False
        plan.save(update_fields=["is_active"])
        return api_success(message="Plan archived.")


class AdminPaymentsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = PaymentOrder.objects.select_related("professional", "lead", "plan").all()

        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)

        order_type = request.query_params.get("type")
        if order_type and order_type != "all":
            qs = qs.filter(order_type=order_type)

        qs = apply_search(qs, params.get("search"), "order_id", "gateway_order_id", "professional__email")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, PaymentOrderSerializer, message="Payments retrieved.")


class AdminRefundsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = RefundRequest.objects.select_related("lead_acceptance__lead", "requested_by").all()
        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, RefundRequestSerializer, message="Refund requests retrieved.")


class AdminRefundProcessAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        data = self.get_request_data(request)
        approve = data.get("approve", True)
        notes = data.get("notes", "")
        try:
            refund = LeadService.process_refund(
                refund_request_id=pk,
                admin_user=request.user,
                approve=bool(approve),
                notes=notes,
            )
            return api_success(
                data=RefundRequestSerializer(refund).data,
                message=f"Refund request {'approved and processed' if approve else 'rejected'}.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class AdminCommercialSettingsAPIView(AdminLeadsBaseView):
    def get(self, request):
        settings_obj = LeadCommercialSettings.get_settings()
        return api_success(data=LeadCommercialSettingsSerializer(settings_obj).data, message="Commercial settings retrieved.")

    def patch(self, request):
        settings_obj = LeadCommercialSettings.get_settings()
        data = self.get_request_data(request)
        serializer = LeadCommercialSettingsSerializer(settings_obj, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(updated_by=request.user)

        LeadAuditLog.objects.create(
            entity_type="SETTINGS",
            entity_id=str(obj.id),
            action="COMMERCIAL_SETTINGS_UPDATED",
            actor=request.user,
            details=data,
        )
        return api_success(data=LeadCommercialSettingsSerializer(obj).data, message="Commercial settings updated.")


class AdminLeadReportsAPIView(AdminLeadsBaseView):
    def get(self, request):
        total_leads = Lead.objects.count()
        published_leads = Lead.objects.filter(status=Lead.Status.PUBLISHED).count()
        accepted_leads = Lead.objects.filter(status=Lead.Status.ACCEPTED).count()
        pending_review = Lead.objects.filter(status=Lead.Status.PENDING_REVIEW).count()

        # Revenue & Wallets
        total_revenue_paise = LeadAcceptance.objects.filter(status=LeadAcceptance.Status.ACTIVE).aggregate(
            total=Sum("price_paid_paise")
        )["total"] or 0

        total_wallet_balance_paise = ProfessionalWallet.objects.aggregate(
            total=Sum("balance_paise")
        )["total"] or 0

        total_wallet_added_paise = ProfessionalWallet.objects.aggregate(
            total=Sum("total_added_paise")
        )["total"] or 0

        conversion_rate = round((accepted_leads / total_leads * 100), 2) if total_leads > 0 else 0.0

        return api_success(
            data={
                "total_leads": total_leads,
                "published_leads": published_leads,
                "accepted_leads": accepted_leads,
                "pending_review": pending_review,
                "conversion_rate_percent": conversion_rate,
                "total_revenue_inr": round(total_revenue_paise / 100, 2),
                "total_wallet_balance_inr": round(total_wallet_balance_paise / 100, 2),
                "total_wallet_topups_inr": round(total_wallet_added_paise / 100, 2),
            },
            message="Lead marketplace reports retrieved.",
        )
