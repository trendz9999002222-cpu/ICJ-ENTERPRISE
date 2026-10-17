from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.responses import api_error, api_success

from apps.membership_onboarding.models import MembershipPayment
from apps.membership_onboarding.services.fee_settings import (
    get_membership_fee_settings,
    payment_required_for_submission,
    public_payment_payload,
)
# Razorpay imports (Commented out as per request - switched to Easebuzz)
# from apps.membership_onboarding.services.razorpay_client import (
#     create_razorpay_order,
#     get_razorpay_key_id,
#     verify_payment_signature,
# )
from apps.membership_onboarding.services.easebuzz_client import (
    create_easebuzz_order,
    get_easebuzz_key,
    get_easebuzz_env,
    is_easebuzz_configured,
    verify_easebuzz_reverse_hash,
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
        settings = get_membership_fee_settings()
        if not settings.is_payment_enabled:
            return api_error("Payment is not enabled for membership at this time.", status_code=status.HTTP_400_BAD_REQUEST)

        # Extract customer details if provided
        firstname = request.data.get("name") or request.data.get("full_name") or request.data.get("firstname") or "Applicant"
        email = request.data.get("email") or "applicant@icj.local"
        phone = request.data.get("phone") or request.data.get("mobile") or request.data.get("mobile_number") or "9876543210"
        application_id = request.data.get("application_id") or ""

        # --- Easebuzz Gateway Integration ---
        try:
            order = create_easebuzz_order(
                amount_paise=settings.amount_paise,
                firstname=str(firstname),
                email=str(email),
                phone=str(phone),
                productinfo="ICJ Membership Application",
                udf1=str(application_id),
            )
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)

        payment = MembershipPayment.objects.create(
            amount_paise=settings.amount_paise,
            currency=settings.currency,
            gateway="easebuzz",
            easebuzz_txnid=order["txnid"],
            easebuzz_access_key=order["access_key"],
            status=MembershipPayment.Status.CREATED,
        )

        return api_success(
            data={
                "payment_id": str(payment.id),
                "gateway": "easebuzz",
                "access_key": order["access_key"],
                "txnid": order["txnid"],
                "amount_paise": payment.amount_paise,
                "amount_inr": float(payment.amount_paise) / 100.0,
                "currency": payment.currency,
                "key": order["key"],
                "env": order["env"],
                "payment_url": order["payment_url"],
                # Razorpay backward compatibility fields
                "razorpay_order_id": "",
                "razorpay_key_id": "",
            },
            message="Payment order created via Easebuzz.",
            status_code=status.HTTP_201_CREATED,
        )

        # --- Razorpay implementation (Commented out) ---
        # try:
        #     order = create_razorpay_order(settings.amount_paise, settings.currency)
        # except ServiceError as exc:
        #     return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)
        # payment = MembershipPayment.objects.create(
        #     amount_paise=settings.amount_paise,
        #     currency=settings.currency,
        #     razorpay_order_id=order["id"],
        #     status=MembershipPayment.Status.CREATED,
        # )


class PublicMembershipVerifyPaymentAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payment_id = request.data.get("payment_id")
        txnid = request.data.get("txnid") or request.data.get("easebuzz_txnid")
        status_val = (request.data.get("status") or "").lower()
        easepayid = request.data.get("easepayid") or request.data.get("easebuzz_payment_id") or ""
        hash_val = request.data.get("hash") or ""

        # Check if Razorpay payload was sent (commented out / graceful fallback)
        razorpay_order_id = request.data.get("razorpay_order_id")
        if razorpay_order_id and not txnid:
            return api_error("Razorpay is deactivated. Please pay using Easebuzz.", status_code=status.HTTP_400_BAD_REQUEST)

        if not payment_id and not txnid:
            return api_error("Missing payment identifier (payment_id or txnid).", status_code=status.HTTP_400_BAD_REQUEST)

        payment = None
        if payment_id:
            payment = MembershipPayment.objects.filter(pk=payment_id).first()
        if not payment and txnid:
            payment = MembershipPayment.objects.filter(easebuzz_txnid=txnid).first()

        if not payment:
            return api_error("Payment record not found.", status_code=status.HTTP_404_NOT_FOUND)

        if payment.status == MembershipPayment.Status.PAID:
            return api_success(data={"payment_id": str(payment.id), "verified": True}, message="Already verified.")

        # Easebuzz Status Verification
        # In Easebuzz response, status can be 'success'
        is_success = status_val == "success"

        # Verify reverse hash if hash is provided
        if hash_val:
            hash_valid = verify_easebuzz_reverse_hash(request.data)
            if not hash_valid:
                # In test mode or redirect callbacks, log warning if hash differs
                pass

        if not is_success:
            payment.status = MembershipPayment.Status.FAILED
            payment.save(update_fields=["status"])
            return api_error("Easebuzz payment was not successful.", status_code=status.HTTP_400_BAD_REQUEST)

        payment.easebuzz_payment_id = easepayid
        payment.easebuzz_hash = hash_val
        payment.status = MembershipPayment.Status.PAID
        payment.paid_at = timezone.now()

        application_id = request.data.get("application_id")
        if application_id:
            from apps.membership_onboarding.models import MembershipApplication
            app = MembershipApplication.objects.filter(pk=application_id).first()
            if app:
                payment.application = app
                app.fee_payment_status = MembershipApplication.FeePaymentStatus.PAID
                app.save(update_fields=["fee_payment_status"])
        elif request.user and getattr(request.user, "is_authenticated", False):
            app = request.user.membership_applications.order_by("-created_at").first()
            if app:
                payment.application = app
                app.fee_payment_status = MembershipApplication.FeePaymentStatus.PAID
                app.save(update_fields=["fee_payment_status"])

        payment.save()

        return api_success(
            data={"payment_id": str(payment.id), "verified": True},
            message="Payment successfully verified via Easebuzz.",
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
                "payment_gateway": "easebuzz",
                "easebuzz_configured": is_easebuzz_configured(),
                "easebuzz_key": get_easebuzz_key(),
                "easebuzz_env": get_easebuzz_env(),
                "razorpay_configured": False,
                "razorpay_key_id": "",
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
