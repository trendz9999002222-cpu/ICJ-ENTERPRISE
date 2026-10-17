from apps.membership_onboarding.models import MembershipFeeSettings
from apps.membership_onboarding.services.easebuzz_client import (
    get_easebuzz_key,
    get_easebuzz_env,
    is_easebuzz_configured,
)
# Razorpay import (Commented out)
# from apps.membership_onboarding.services.razorpay_client import razorpay_configured, get_razorpay_key_id


def get_membership_fee_settings() -> MembershipFeeSettings:
    obj, _ = MembershipFeeSettings.objects.get_or_create(pk=1)
    return obj


def payment_required_for_submission() -> bool:
    return False


def public_payment_payload() -> dict:
    settings = get_membership_fee_settings()

    return {
        "payment_required": False,
        "is_payment_enabled": settings.is_payment_enabled,
        "amount_paise": settings.amount_paise,
        "amount_inr": float(settings.amount_paise) / 100.0,
        "currency": settings.currency,
        "payment_gateway": "easebuzz",
        "easebuzz_configured": is_easebuzz_configured(),
        "easebuzz_key": get_easebuzz_key() if settings.is_payment_enabled else "",
        "easebuzz_env": get_easebuzz_env(),
        # Razorpay backward compatibility (commented / empty)
        "razorpay_key_id": "",
    }
