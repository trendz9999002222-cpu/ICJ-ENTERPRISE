import base64
import hashlib
import hmac
import json
import os
import urllib.error
import urllib.request
import uuid
from typing import Any

from django.conf import settings

from apps.professional_onboarding.services.crud import ServiceError


def get_razorpay_key_id() -> str:
    return (getattr(settings, "RAZORPAY_KEY_ID", None) or os.getenv("RAZORPAY_KEY_ID", "")).strip()


def get_razorpay_key_secret() -> str:
    return (getattr(settings, "RAZORPAY_KEY_SECRET", None) or os.getenv("RAZORPAY_KEY_SECRET", "")).strip()


def razorpay_configured() -> bool:
    return bool(get_razorpay_key_id() and get_razorpay_key_secret())


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    secret = get_razorpay_key_secret()
    if not secret:
        return False
    payload = f"{order_id}|{payment_id}".encode()
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature or "")


def create_razorpay_order(amount_paise: int, currency: str = "INR", receipt: str | None = None) -> dict[str, Any]:
    key_id = get_razorpay_key_id()
    key_secret = get_razorpay_key_secret()
    if not key_id or not key_secret:
        raise ServiceError(
            "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
            {"payment": ["Gateway not configured."]},
        )

    body = {
        "amount": int(amount_paise),
        "currency": currency,
        "receipt": receipt or f"mem_{uuid.uuid4().hex[:20]}",
        "payment_capture": 1,
    }
    data = json.dumps(body).encode()
    auth = base64.b64encode(f"{key_id}:{key_secret}".encode()).decode()
    req = urllib.request.Request(
        "https://api.razorpay.com/v1/orders",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode() if exc.fp else str(exc)
        raise ServiceError("Could not create Razorpay order.", {"payment": [detail[:500]]}) from exc
    except urllib.error.URLError as exc:
        raise ServiceError("Payment gateway unreachable.", {"payment": [str(exc)]}) from exc
