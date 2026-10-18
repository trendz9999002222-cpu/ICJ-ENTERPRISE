from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.listing import apply_ordering, apply_search
from common.responses import api_error, api_success
from apps.accounts.permissions import PasswordChangeCompleted
from apps.leads.models import (
    Lead,
    LeadAcceptance,
    LeadReservation,
    LeadCreditPlan,
    PaymentOrder,
    WalletTransaction,
    LeadCommercialSettings,
)
from apps.leads.serializers import (
    LeadMarketplacePreviewSerializer,
    LeadDetailSerializer,
    LeadAcceptanceSerializer,
    ProfessionalWalletSerializer,
    WalletTransactionSerializer,
    LeadCreditPlanSerializer,
    PaymentOrderSerializer,
    RefundRequestSerializer,
)
from apps.leads.services.lead_service import LeadService
from apps.leads.services.wallet_service import WalletService
from apps.leads.services.plan_service import PlanService
from apps.leads.services.payment_service import PaymentGatewayService, is_razorpay_configured, get_razorpay_key_id


class ProfessionalLeadBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted]

    def get_request_data(self, request):
        data = request.data
        if isinstance(data, str):
            import json
            try:
                data = json.loads(data)
            except Exception:
                data = {}
        return data if isinstance(data, dict) else {}


class LeadMarketplaceListAPIView(ProfessionalLeadBaseView):
    """
    List published leads in the marketplace for verified professionals.
    Sensitive client data is anonymized.
    """
    def get(self, request):
        if not LeadService.is_professional_eligible(request.user):
            return api_error("You must have an approved professional account to access the Lead Marketplace.", status_code=403)

        params = list_params(request)
        qs = Lead.objects.all()

        # Availability filter
        avail = request.query_params.get("availability", "available")
        if avail == "available":
            qs = qs.filter(status__in=[Lead.Status.PUBLISHED, Lead.Status.RESERVED])
        elif avail == "taken":
            qs = qs.filter(status=Lead.Status.ACCEPTED)
        elif avail == "all":
            qs = qs.filter(status__in=[Lead.Status.PUBLISHED, Lead.Status.RESERVED, Lead.Status.ACCEPTED])

        category = request.query_params.get("category")
        if category and category != "all":
            qs = qs.filter(category__iexact=category)

        urgency = request.query_params.get("urgency")
        if urgency and urgency != "all":
            qs = qs.filter(urgency__iexact=urgency)

        state = request.query_params.get("state")
        if state and state != "all":
            qs = qs.filter(state_name__icontains=state)

        district = request.query_params.get("district")
        if district:
            qs = qs.filter(city_name__icontains=district)

        qs = apply_search(qs, params.get("search"), "lead_id", "category", "anonymized_summary", "state_name", "city_name")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")

        settings_obj = LeadCommercialSettings.get_settings()
        extra_meta = {
            "paid_unlock_enabled": settings_obj.paid_unlock_enabled,
            "compliance_notice": settings_obj.compliance_notice if not settings_obj.paid_unlock_enabled else "",
        }
        res = paginated_success(request, qs, LeadMarketplacePreviewSerializer, message="Marketplace leads retrieved.")
        res.data["meta"] = extra_meta
        return res


class LeadMarketplaceDetailAPIView(ProfessionalLeadBaseView):
    def get(self, request, pk):
        if not LeadService.is_professional_eligible(request.user):
            return api_error("Access restricted to approved professionals.", status_code=403)

        lead = get_object_or_404(Lead, pk=pk)
        serializer = LeadDetailSerializer(lead, context={"request": request})
        return api_success(data=serializer.data, message="Lead details retrieved.")


class LeadReserveAPIView(ProfessionalLeadBaseView):
    def post(self, request, pk):
        try:
            res = LeadService.reserve_lead(
                lead_id=pk,
                user=request.user,
                idempotency_key=request.headers.get("idempotency-key"),
            )
            return api_success(
                data={
                    "reservation_id": str(res.id),
                    "expires_at": res.expires_at,
                    "lead_id": res.lead.lead_id,
                },
                message="Lead reserved successfully for checkout.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class LeadAcceptAPIView(ProfessionalLeadBaseView):
    def post(self, request, pk):
        lead = get_object_or_404(Lead, pk=pk)
        data = self.get_request_data(request)
        payment_method = data.get("payment_method", LeadAcceptance.PaymentMethod.WALLET)
        idempotency_key = request.headers.get("idempotency-key")

        # If direct payment is chosen, create payment order
        if payment_method == LeadAcceptance.PaymentMethod.DIRECT_PAYMENT:
            settings_obj = LeadCommercialSettings.get_settings()
            if not settings_obj.paid_unlock_enabled:
                return api_error(
                    "Commercial lead unlocking is disabled pending compliance review.",
                    status_code=403,
                )
            try:
                order = PaymentGatewayService.create_order(
                    user=request.user,
                    order_type=PaymentOrder.OrderType.LEAD_ACCEPTANCE,
                    amount_paise=lead.price_paise,
                    lead=lead,
                    idempotency_key=idempotency_key,
                )
                return api_success(
                    data={
                        "order_id": order.order_id,
                        "gateway_order_id": order.gateway_order_id,
                        "amount_paise": order.amount_paise,
                        "amount_inr": round(order.amount_paise / 100, 2),
                        "razorpay_key_id": get_razorpay_key_id() if is_razorpay_configured() else "test_key",
                        "is_mock": not is_razorpay_configured(),
                    },
                    message="Direct payment order created.",
                )
            except Exception as exc:
                return api_error(str(exc), status_code=400)

        # ICJ Wallet, Lead Credit, or Non-Commercial allocation
        try:
            acceptance = LeadService.accept_lead(
                lead_id=pk,
                user=request.user,
                payment_method=payment_method,
                idempotency_key=idempotency_key,
            )
            return api_success(
                data=LeadAcceptanceSerializer(acceptance).data,
                message="Lead accepted successfully! Client contact information is now unlocked.",
                status_code=201,
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class LeadReleaseAPIView(ProfessionalLeadBaseView):
    def post(self, request, pk):
        data = self.get_request_data(request)
        reason = data.get("reason", "")
        try:
            acceptance = LeadService.release_lead(lead_id=pk, user=request.user, reason=reason)
            return api_success(
                data=LeadAcceptanceSerializer(acceptance).data,
                message="Lead released successfully.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class LeadRefundRequestAPIView(ProfessionalLeadBaseView):
    def post(self, request, pk):
        data = self.get_request_data(request)
        reason = data.get("reason", "")
        try:
            req = LeadService.request_refund(lead_id=pk, user=request.user, reason=reason)
            return api_success(
                data=RefundRequestSerializer(req).data,
                message="Refund request submitted for administrator review.",
                status_code=201,
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class ProfessionalMyLeadsAPIView(ProfessionalLeadBaseView):
    """
    List of leads accepted by this professional with full client contact details.
    """
    def get(self, request):
        params = list_params(request)
        lead_ids = LeadAcceptance.objects.filter(
            professional=request.user,
            status=LeadAcceptance.Status.ACTIVE,
        ).values_list("lead_id", flat=True)

        qs = Lead.objects.filter(
            Q(id__in=lead_ids) | Q(assigned_professional=request.user)
        ).distinct().select_related("assistance_request")
        qs = apply_search(qs, params.get("search"), "lead_id", "category", "assistance_request__full_name")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, LeadDetailSerializer, message="My accepted leads retrieved.")


class ProfessionalLeadCaseProgressAPIView(ProfessionalLeadBaseView):
    """
    Allows the accepted professional to update stage and cumulative case notes for a matter.
    """
    def patch(self, request, pk):
        lead = get_object_or_404(Lead, pk=pk)
        has_access = (
            lead.assigned_professional_id == request.user.id or
            lead.acceptances.filter(professional=request.user, status=LeadAcceptance.Status.ACTIVE).exists()
        )
        if not has_access:
            return api_error("You do not have permission to manage this lead.", status_code=403)

        data = self.get_request_data(request)
        from django.utils import timezone
        timestamp_str = timezone.now().strftime('%Y-%m-%d %I:%M %p')

        if "case_stage" in data:
            lead.case_stage = data["case_stage"]
        if "case_notes" in data and data["case_notes"].strip():
            new_note = data["case_notes"].strip()
            author = request.user.get_full_name() or request.user.email
            lead.case_notes = (lead.case_notes + f"\n[{author} - {timestamp_str}]: {new_note}").strip()
        lead.save()
        return api_success(
            data=LeadDetailSerializer(lead, context={"request": request}).data,
            message="Case progress and notes updated successfully."
        )


class ProfessionalWalletAPIView(ProfessionalLeadBaseView):
    def get(self, request):
        wallet = WalletService.get_or_create_wallet(request.user)
        available_credits = PlanService.get_available_credits(request.user)
        serializer = ProfessionalWalletSerializer(wallet)
        data = serializer.data
        data["available_lead_credits"] = available_credits
        return api_success(data=data, message="Wallet retrieved.")


class ProfessionalWalletTransactionsAPIView(ProfessionalLeadBaseView):
    def get(self, request):
        params = list_params(request)
        wallet = WalletService.get_or_create_wallet(request.user)
        qs = WalletTransaction.objects.filter(wallet=wallet)

        tx_type = request.query_params.get("type")
        if tx_type and tx_type != "all":
            qs = qs.filter(tx_type=tx_type)

        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, WalletTransactionSerializer, message="Wallet transactions retrieved.")


class ProfessionalWalletTopupOrderAPIView(ProfessionalLeadBaseView):
    def post(self, request):
        data = self.get_request_data(request)
        amount_paise = data.get("amount_paise")
        if not amount_paise:
            amount_inr = data.get("amount_inr")
            if amount_inr:
                amount_paise = int(float(amount_inr) * 100)

        if not amount_paise or int(amount_paise) < 10000:
            return api_error("Minimum top-up amount is ₹100.", status_code=400)

        try:
            order = PaymentGatewayService.create_order(
                user=request.user,
                order_type=PaymentOrder.OrderType.WALLET_TOPUP,
                amount_paise=int(amount_paise),
                idempotency_key=request.headers.get("idempotency-key"),
            )
            return api_success(
                data={
                    "order_id": order.order_id,
                    "gateway_order_id": order.gateway_order_id,
                    "amount_paise": order.amount_paise,
                    "amount_inr": round(order.amount_paise / 100, 2),
                    "razorpay_key_id": get_razorpay_key_id() if is_razorpay_configured() else "test_key",
                    "is_mock": not is_razorpay_configured(),
                },
                message="Wallet top-up order created.",
                status_code=201,
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class ProfessionalLeadPlansListAPIView(ProfessionalLeadBaseView):
    def get(self, request):
        qs = LeadCreditPlan.objects.filter(is_active=True).order_by("display_order", "price_paise")
        available_credits = PlanService.get_available_credits(request.user)
        return api_success(
            data={
                "plans": LeadCreditPlanSerializer(qs, many=True).data,
                "available_lead_credits": available_credits,
            },
            message="Lead plans retrieved.",
        )


class ProfessionalLeadPlanPurchaseAPIView(ProfessionalLeadBaseView):
    def post(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk, is_active=True)
        data = self.get_request_data(request)
        pay_with_wallet = data.get("pay_with_wallet", False)
        idempotency_key = request.headers.get("idempotency-key")

        if pay_with_wallet:
            try:
                WalletService.debit_wallet(
                    user=request.user,
                    amount_paise=plan.price_paise,
                    description=f"Purchased Lead Plan: {plan.name}",
                    reference=f"TX-PLAN-{plan.code}",
                    idempotency_key=f"plan_wal_{plan.id}_{request.user.id}",
                )
                purchase = PlanService.grant_plan_credits(user=request.user, plan=plan)
                return api_success(
                    data={
                        "purchase_id": str(purchase.id),
                        "credits_granted": plan.credits_granted,
                        "remaining_credits": purchase.remaining_credits,
                    },
                    message=f"Plan '{plan.name}' purchased successfully with ICJ Wallet!",
                    status_code=201,
                )
            except Exception as exc:
                return api_error(str(exc), status_code=400)

        # Gateway order
        try:
            order = PaymentGatewayService.create_order(
                user=request.user,
                order_type=PaymentOrder.OrderType.PLAN_PURCHASE,
                amount_paise=plan.price_paise,
                plan=plan,
                idempotency_key=idempotency_key,
            )
            return api_success(
                data={
                    "order_id": order.order_id,
                    "gateway_order_id": order.gateway_order_id,
                    "amount_paise": order.amount_paise,
                    "amount_inr": round(order.amount_paise / 100, 2),
                    "razorpay_key_id": get_razorpay_key_id() if is_razorpay_configured() else "test_key",
                    "is_mock": not is_razorpay_configured(),
                },
                message="Plan purchase order created.",
                status_code=201,
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class ProfessionalPaymentsListAPIView(ProfessionalLeadBaseView):
    def get(self, request):
        params = list_params(request)
        qs = PaymentOrder.objects.filter(professional=request.user)
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, PaymentOrderSerializer, message="Payments retrieved.")


class PaymentVerifyAPIView(ProfessionalLeadBaseView):
    """
    Client passes gateway payment signature to verify and finalize order.
    """
    def post(self, request):
        data = self.get_request_data(request)
        gateway_order_id = data.get("razorpay_order_id")
        gateway_payment_id = data.get("razorpay_payment_id")
        signature = data.get("razorpay_signature")

        if not gateway_order_id or not gateway_payment_id:
            return api_error("Missing order or payment ID.", status_code=400)

        try:
            tx = PaymentGatewayService.verify_and_process_payment(
                gateway_order_id=gateway_order_id,
                gateway_payment_id=gateway_payment_id,
                gateway_signature=signature or "",
                raw_payload=data,
            )
            return api_success(
                data={
                    "order_id": tx.order.order_id,
                    "status": "success",
                    "amount_inr": round(tx.amount_paise / 100, 2),
                    "order_type": tx.order.order_type,
                },
                message="Payment verified and processed successfully.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)
