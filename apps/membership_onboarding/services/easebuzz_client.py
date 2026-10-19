import hashlib
import json
import logging
import os
import urllib.error
import urllib.parse
import urllib.request
import uuid
from typing import Any

from django.conf import settings

from apps.professional_onboarding.services.crud import ServiceError

logger = logging.getLogger(__name__)


def get_easebuzz_key() -> str:
    val = getattr(settings, "EASEBUZZ_KEY", None)
    if val is None or val == "DUMMY":
        val = os.getenv("EASEBUZZ_KEY", "")
    return str(val or "").strip()


def get_easebuzz_salt() -> str:
    val = getattr(settings, "EASEBUZZ_SALT", None)
    if val is None or val == "DUMMY":
        val = os.getenv("EASEBUZZ_SALT", "")
    return str(val or "").strip()


def get_easebuzz_env() -> str:
    val = getattr(settings, "EASEBUZZ_ENV", None)
    if val is None:
        val = os.getenv("EASEBUZZ_ENV", "test")
    return str(val or "test").strip().lower()


def get_easebuzz_surl() -> str:
    val = getattr(settings, "EASEBUZZ_SURL", None)
    if val is None:
        val = os.getenv("EASEBUZZ_SURL", "")
    return str(val or "").strip()


def get_easebuzz_furl() -> str:
    val = getattr(settings, "EASEBUZZ_FURL", None)
    if val is None:
        val = os.getenv("EASEBUZZ_FURL", "")
    return str(val or "").strip()


def is_easebuzz_configured() -> bool:
    return bool(get_easebuzz_key() and get_easebuzz_salt())


def generate_initiate_hash(
    key: str,
    txnid: str,
    amount: str,
    productinfo: str,
    firstname: str,
    email: str,
    udf1: str = "",
    udf2: str = "",
    udf3: str = "",
    udf4: str = "",
    udf5: str = "",
    udf6: str = "",
    udf7: str = "",
    salt: str = "",
) -> str:
    """
    Easebuzz initiate payment SHA-512 hash sequence:
    key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
    """
    parts = [
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
        udf6,
        udf7,
        "",  # udf8
        "",  # udf9
        "",  # udf10
        salt,
    ]
    raw_str = "|".join(str(p) for p in parts)
    return hashlib.sha512(raw_str.encode("utf-8")).hexdigest().lower()


def verify_easebuzz_reverse_hash(response_data: dict[str, Any]) -> bool:
    """
    Easebuzz reverse hash verification sequence:
    salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    """
    salt = get_easebuzz_salt()
    if not salt:
        return False

    received_hash = (response_data.get("hash") or "").strip().lower()
    if not received_hash:
        return False

    parts = [
        salt,
        response_data.get("status", ""),
        response_data.get("udf10", ""),
        response_data.get("udf9", ""),
        response_data.get("udf8", ""),
        response_data.get("udf7", ""),
        response_data.get("udf6", ""),
        response_data.get("udf5", ""),
        response_data.get("udf4", ""),
        response_data.get("udf3", ""),
        response_data.get("udf2", ""),
        response_data.get("udf1", ""),
        response_data.get("email", ""),
        response_data.get("firstname", ""),
        response_data.get("productinfo", ""),
        response_data.get("amount", ""),
        response_data.get("txnid", ""),
        response_data.get("key", get_easebuzz_key()),
    ]
    raw_str = "|".join(str(p) for p in parts)
    calculated_hash = hashlib.sha512(raw_str.encode("utf-8")).hexdigest().lower()
    return calculated_hash == received_hash


def create_easebuzz_order(
    amount_paise: int,
    firstname: str = "Applicant",
    email: str = "applicant@icj.local",
    phone: str = "9876543210",
    productinfo: str = "ICJ Membership",
    txnid: str | None = None,
    udf1: str = "",
    surl: str | None = None,
    furl: str | None = None,
) -> dict[str, Any]:
    key = get_easebuzz_key()
    salt = get_easebuzz_salt()
    env = get_easebuzz_env()

    if not key or not salt:
        raise ServiceError(
            "Easebuzz gateway is not configured. Please set EASEBUZZ_KEY and EASEBUZZ_SALT in your environment variables.",
            {"payment": ["Gateway credentials missing."]},
        )

    # Generate unique txnid
    if not txnid:
        txnid = f"TXN_{uuid.uuid4().hex[:16]}"

    amount_str = f"{float(amount_paise) / 100.0:.2f}"
    clean_firstname = (firstname or "Applicant").strip()[:50]
    clean_email = (email or "info@icj.local").strip()[:100]
    clean_phone = "".join(filter(str.isdigit, phone or "9876543210"))[-10:] or "9876543210"

    default_base = "https://icj.co.in" if env == "prod" else "http://localhost:3000"
    s_url = surl or get_easebuzz_surl() or f"{default_base}/membership-application/payment-success"
    f_url = furl or get_easebuzz_furl() or f"{default_base}/membership-application/payment-failure"

    # Calculate SHA-512 initiate hash
    req_hash = generate_initiate_hash(
        key=key,
        txnid=txnid,
        amount=amount_str,
        productinfo=productinfo,
        firstname=clean_firstname,
        email=clean_email,
        udf1=udf1,
        salt=salt,
    )

    payload = {
        "key": key,
        "txnid": txnid,
        "amount": amount_str,
        "productinfo": productinfo,
        "firstname": clean_firstname,
        "email": clean_email,
        "phone": clean_phone,
        "surl": s_url,
        "furl": f_url,
        "hash": req_hash,
        "udf1": udf1,
        "udf2": "",
        "udf3": "",
        "udf4": "",
        "udf5": "",
        "udf6": "",
        "udf7": "",
    }

    base_url = "https://pay.easebuzz.in" if env == "prod" else "https://testpay.easebuzz.in"
    endpoint = f"{base_url}/payment/initiateLink"

    encoded_data = urllib.parse.urlencode(payload).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=encoded_data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            res_json = json.loads(body)
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8") if exc.fp else str(exc)
        logger.error("Easebuzz initiate HTTPError: %s", err_body)
        raise ServiceError("Easebuzz initiate request failed.", {"payment": [err_body[:500]]}) from exc
    except urllib.error.URLError as exc:
        logger.error("Easebuzz initiate URLError: %s", exc)
        raise ServiceError("Easebuzz gateway unreachable.", {"payment": [str(exc)]}) from exc
    except Exception as exc:
        logger.error("Easebuzz initiate unexpected error: %s", exc)
        raise ServiceError("Failed to initiate Easebuzz payment.", {"payment": [str(exc)]}) from exc

    status_val = res_json.get("status")
    access_key = res_json.get("data")

    if status_val == 1 and access_key:
        payment_url = f"{base_url}/pay/{access_key}"
        return {
            "access_key": str(access_key),
            "key": key,
            "txnid": txnid,
            "amount": amount_str,
            "amount_paise": amount_paise,
            "currency": "INR",
            "env": env,
            "payment_url": payment_url,
        }
    else:
        err_desc = res_json.get("error_desc") or res_json.get("error_msg") or res_json.get("data") or "Payment initiation failed."
        logger.error("Easebuzz returned failure: %s", res_json)
        raise ServiceError(f"Easebuzz Gateway Error: {err_desc}", {"payment": [str(err_desc)]})
