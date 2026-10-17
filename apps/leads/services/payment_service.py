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
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.leads.models import (
    PaymentOrder,
    PaymentTransaction,
    Lead,
    LeadCreditPlan,
    LeadAuditLog,
)
from apps.leads.services.wallet_service import WalletService
from apps.leads.services.plan_service import PlanService


def get_razorpay_key_id() -> str:
    return (getattr(settings, "RAZORPAY_KEY_ID", None) or os.getenv("RAZORPAY_KEY_ID", "")).strip()


def get_razorpay_key_secret() -> str:
    return (getattr(settings, "RAZORPAY_KEY_SECRET", None) or os.getenv("RAZORPAY_KEY_SECRET", "")).strip()


def is_razorpay_configured() -> bool:
    return bool(get_razorpay_key_id() and get_razorpay_key_secret())


def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    secret = get_razorpay_key_secret()
    if not secret:
        # In test mode with dummy keys, accept test signature if prefixed with test_
        return signature == f"test_sig_{order_id}_{payment_id}"
    payload = f"{order_id}|{payment_id}".encode()
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature or "")


def verify_webhook_signature(body_bytes: bytes, signature: str) -> bool:
    secret = get_razorpay_key_secret()
    if not secret:
        return True
    expected = hmac.new(secret.encode(), body_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature or "")


class PaymentGatewayService:
    @staticmethod
    def create_order(
        user,
        order_type: str,
        amount_paise: int,
        lead: Lead | None = None,
        plan: LeadCreditPlan | None = None,
        idempotency_key: str | None = None,
    ) -> PaymentOrder:
        if amount_paise <= 0:
            raise ValidationError("Order amount must be greater than zero.")

        if idempotency_key:
            existing = PaymentOrder.objects.filter(idempotency_key=idempotency_key).first()
            if existing:
                return existing

        order_ref = f"ICJ-ORD-{timezone.now().year}-{uuid.uuid4().hex[:10].upper()}"

        key_id = get_razorpay_key_id()
        key_secret = get_razorpay_key_secret()

        gateway_order_id = ""
        if key_id and key_secret:
            body = {
                "amount": int(amount_paise),
                "currency": "INR",
                "receipt": order_ref,
                "payment_capture": 1,
            }
            data = json.dumps(body).encode()
            auth = base64.b64encode(f"{key_id}:{key_secret}".encode()).decode()
            req = urllib.request.Request(
                "https://api.razorpay.com/v1/orders",
                data=data,
                headers={"Content-Type": "application/json", "Authorization": f"Basic {auth}"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    resp_data = json.loads(resp.read().decode())
                    gateway_order_id = resp_data.get("id", "")
            except Exception as exc:
                raise ValidationError(f"Gateway error creating order: {exc}")
        else:
            # Test/Development fallback order ID
            gateway_order_id = f"order_mock_{uuid.uuid4().hex[:16]}"

        payment_order = PaymentOrder.objects.create(
            order_id=order_ref,
            gateway_order_id=gateway_order_id,
            professional=user,
            order_type=order_type,
            amount_paise=amount_paise,
            currency="INR",
            status=PaymentOrder.Status.PENDING,
            lead=lead,
            plan=plan,
            idempotency_key=idempotency_key,
            metadata={"gateway": "razorpay" if is_razorpay_configured() else "test_mock"},
        )
        return payment_order

    @staticmethod
    @transaction.atomic
    def verify_and_process_payment(
        gateway_order_id: str,
        gateway_payment_id: str,
        gateway_signature: str,
        raw_payload: dict | None = None,
    ) -> PaymentTransaction:
        order = PaymentOrder.objects.select_for_update().filter(gateway_order_id=gateway_order_id).first()
        if not order:
            raise ValidationError(f"Payment order not found for gateway order {gateway_order_id}")

        if order.status == PaymentOrder.Status.SUCCESS:
            existing_tx = PaymentTransaction.objects.filter(gateway_payment_id=gateway_payment_id).first()
            if existing_tx:
                return existing_tx
            raise ValidationError("Order has already been processed.")

        # Signature verification
        valid = verify_razorpay_signature(gateway_order_id, gateway_payment_id, gateway_signature)
        if not valid:
            order.status = PaymentOrder.Status.FAILED
            order.save(update_fields=["status", "updated_at"])
            raise ValidationError("Payment signature verification failed.")

        # Record verified transaction
        tx = PaymentTransaction.objects.create(
            order=order,
            gateway_payment_id=gateway_payment_id,
            gateway_signature=gateway_signature,
            amount_paise=order.amount_paise,
            payment_method=(raw_payload or {}).get("method", "card/upi/netbanking"),
            status=PaymentTransaction.Status.CAPTURED,
            raw_payload=raw_payload or {},
        )

        order.status = PaymentOrder.Status.SUCCESS
        order.save(update_fields=["status", "updated_at"])

        # Execute downstream action based on order type
        if order.order_type == PaymentOrder.OrderType.WALLET_TOPUP:
            WalletService.credit_wallet(
                user=order.professional,
                amount_paise=order.amount_paise,
                description=f"Wallet top-up via {gateway_payment_id}",
                reference=f"TX-TOPUP-{gateway_payment_id}",
                idempotency_key=f"topup_{gateway_payment_id}",
            )
        elif order.order_type == PaymentOrder.OrderType.PLAN_PURCHASE:
            if order.plan:
                PlanService.grant_plan_credits(
                    user=order.professional,
                    plan=order.plan,
                    payment_order=order,
                )
        elif order.order_type == PaymentOrder.OrderType.LEAD_ACCEPTANCE:
            from apps.leads.services.lead_service import LeadService
            if order.lead:
                LeadService.finalize_direct_acceptance(
                    lead=order.lead,
                    user=order.professional,
                    price_paise=order.amount_paise,
                    receipt_ref=f"REC-DIR-{gateway_payment_id}",
                )

        LeadAuditLog.objects.create(
            entity_type="PAYMENT",
            entity_id=str(order.id),
            action="PAYMENT_CAPTURED",
            actor=order.professional,
            details={"order_type": order.order_type, "gateway_payment_id": gateway_payment_id, "amount_paise": order.amount_paise},
        )
        return tx
