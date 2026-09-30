from apps.membership_onboarding.models import MembershipFeeSettings
from apps.membership_onboarding.services.razorpay_client import razorpay_configured


def get_membership_fee_settings() -> MembershipFeeSettings:
    obj, _ = MembershipFeeSettings.objects.get_or_create(pk=1)
    return obj


def payment_required_for_submission() -> bool:
    settings = get_membership_fee_settings()
    if not settings.is_payment_enabled:
        return False
    if settings.amount_paise <= 0:
        return False
    return razorpay_configured()


def public_payment_payload() -> dict:
    settings = get_membership_fee_settings()
    required = payment_required_for_submission()
    from apps.membership_onboarding.services.razorpay_client import get_razorpay_key_id

    return {
        "payment_required": required,
        "is_payment_enabled": settings.is_payment_enabled,
        "amount_paise": settings.amount_paise,
        "amount_inr": float(settings.amount_paise) / 100.0,
        "currency": settings.currency,
        "razorpay_key_id": get_razorpay_key_id() if required else "",
    }
