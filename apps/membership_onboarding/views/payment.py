from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.responses import api_error, api_success

from apps.membership_onboarding.models import MembershipPayment
from apps.membership_onboarding.services.fee_settings import get_membership_fee_settings, payment_required_for_submission, public_payment_payload
from apps.membership_onboarding.services.razorpay_client import (
    create_razorpay_order,
    get_razorpay_key_id,
    verify_payment_signature,
)
from apps.membership_onboarding.views.base import AdminMembershipConfigAPIView
from apps.professional_onboarding.services.crud import ServiceError


class PublicMembershipPaymentSettingsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return api_success(data=public_payment_payload(), message="Payment settings retrieved.")


class PublicMembershipCreateOrderAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if not payment_required_for_submission():
            return api_error("Payment is not required for membership at this time.", status_code=status.HTTP_400_BAD_REQUEST)

        settings = get_membership_fee_settings()
        try:
            order = create_razorpay_order(settings.amount_paise, settings.currency)
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)

        payment = MembershipPayment.objects.create(
            amount_paise=settings.amount_paise,
            currency=settings.currency,
            razorpay_order_id=order["id"],
            status=MembershipPayment.Status.CREATED,
        )
        return api_success(
            data={
                "payment_id": str(payment.id),
                "razorpay_order_id": payment.razorpay_order_id,
                "amount_paise": payment.amount_paise,
                "currency": payment.currency,
                "razorpay_key_id": get_razorpay_key_id(),
            },
            message="Order created.",
            status_code=status.HTTP_201_CREATED,
        )


class PublicMembershipVerifyPaymentAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payment_id = request.data.get("payment_id")
        order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        signature = request.data.get("razorpay_signature")

        if not all([payment_id, order_id, razorpay_payment_id, signature]):
            return api_error("Missing payment verification fields.", status_code=status.HTTP_400_BAD_REQUEST)

        payment = MembershipPayment.objects.filter(pk=payment_id).first()
        if not payment:
            return api_error("Payment not found.", status_code=status.HTTP_404_NOT_FOUND)
        if payment.razorpay_order_id != order_id:
            return api_error("Order mismatch.", status_code=status.HTTP_400_BAD_REQUEST)
        if payment.status == MembershipPayment.Status.PAID:
            return api_success(data={"payment_id": str(payment.id), "verified": True}, message="Already verified.")

        if not verify_payment_signature(order_id, razorpay_payment_id, signature):
            payment.status = MembershipPayment.Status.FAILED
            payment.save(update_fields=["status"])
            return api_error("Invalid payment signature.", status_code=status.HTTP_400_BAD_REQUEST)

        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = signature
        payment.status = MembershipPayment.Status.PAID
        payment.paid_at = timezone.now()
        payment.save()

        return api_success(
            data={"payment_id": str(payment.id), "verified": True},
            message="Payment verified.",
        )


class AdminMembershipFeeSettingsAPIView(AdminMembershipConfigAPIView):
    def get(self, request):
        settings = get_membership_fee_settings()
        return api_success(
            data={
                "amount_paise": settings.amount_paise,
                "amount_inr": float(settings.amount_paise) / 100.0,
                "currency": settings.currency,
                "is_payment_enabled": settings.is_payment_enabled,
                "updated_at": settings.updated_at.isoformat() if settings.updated_at else None,
            },
            message="Fee settings retrieved.",
        )

    def patch(self, request):
        settings = get_membership_fee_settings()
        amount_inr = request.data.get("amount_inr")
        is_payment_enabled = request.data.get("is_payment_enabled")

        if amount_inr is not None:
            try:
                rupees = float(amount_inr)
            except (TypeError, ValueError):
                return api_error("Invalid amount_inr.", status_code=status.HTTP_400_BAD_REQUEST)
            if rupees < 0:
                return api_error("Amount cannot be negative.", status_code=status.HTTP_400_BAD_REQUEST)
            settings.amount_paise = int(round(rupees * 100))

        if is_payment_enabled is not None:
            settings.is_payment_enabled = bool(is_payment_enabled)

        settings.updated_by = request.user
        settings.save()

        return api_success(
            data={
                "amount_paise": settings.amount_paise,
                "amount_inr": float(settings.amount_paise) / 100.0,
                "currency": settings.currency,
                "is_payment_enabled": settings.is_payment_enabled,
                "updated_at": settings.updated_at.isoformat(),
            },
            message="Fee settings updated.",
        )
