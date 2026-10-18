import uuid
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.leads.models import ProfessionalWallet, WalletTransaction, LeadAuditLog


class WalletService:
    @staticmethod
    def get_or_create_wallet(user) -> ProfessionalWallet:
        wallet, _ = ProfessionalWallet.objects.get_or_create(
            professional=user,
            defaults={"balance_paise": 0, "reserved_paise": 0, "currency": "INR"},
        )
        return wallet

    @staticmethod
    @transaction.atomic
    def credit_wallet(
        user,
        amount_paise: int,
        description: str,
        reference: str | None = None,
        idempotency_key: str | None = None,
        created_by=None,
    ) -> WalletTransaction:
        if amount_paise <= 0:
            raise ValidationError("Credit amount must be greater than zero.")

        if idempotency_key:
            existing = WalletTransaction.objects.filter(idempotency_key=idempotency_key).first()
            if existing:
                return existing

        wallet = ProfessionalWallet.objects.select_for_update().get_or_create(
            professional=user,
            defaults={"balance_paise": 0, "reserved_paise": 0},
        )[0]

        wallet.balance_paise += amount_paise
        wallet.total_added_paise += amount_paise
        wallet.save(update_fields=["balance_paise", "total_added_paise", "updated_at"])

        ref = reference or f"TX-CR-{uuid.uuid4().hex[:12].upper()}"
        tx = WalletTransaction.objects.create(
            wallet=wallet,
            reference=ref,
            tx_type=WalletTransaction.TxType.CREDIT,
            amount_paise=amount_paise,
            balance_after_paise=wallet.balance_paise,
            description=description,
            idempotency_key=idempotency_key,
            created_by=created_by or user,
        )

        LeadAuditLog.objects.create(
            entity_type="WALLET",
            entity_id=str(wallet.id),
            action="WALLET_CREDITED",
            actor=created_by or user,
            details={"amount_paise": amount_paise, "reference": ref, "new_balance": wallet.balance_paise},
        )
        return tx

    @staticmethod
    @transaction.atomic
    def debit_wallet(
        user,
        amount_paise: int,
        description: str,
        reference: str | None = None,
        idempotency_key: str | None = None,
    ) -> WalletTransaction:
        if amount_paise <= 0:
            raise ValidationError("Debit amount must be greater than zero.")

        if idempotency_key:
            existing = WalletTransaction.objects.filter(idempotency_key=idempotency_key).first()
            if existing:
                return existing

        wallet = ProfessionalWallet.objects.select_for_update().get_or_create(
            professional=user,
            defaults={"balance_paise": 0, "reserved_paise": 0},
        )[0]

        if wallet.balance_paise < amount_paise:
            raise ValidationError(
                f"Insufficient wallet balance. Required: ₹{amount_paise / 100:.2f}, Available: ₹{wallet.balance_paise / 100:.2f}"
            )

        wallet.balance_paise -= amount_paise
        wallet.total_spent_paise += amount_paise
        wallet.save(update_fields=["balance_paise", "total_spent_paise", "updated_at"])

        ref = reference or f"TX-DB-{uuid.uuid4().hex[:12].upper()}"
        tx = WalletTransaction.objects.create(
            wallet=wallet,
            reference=ref,
            tx_type=WalletTransaction.TxType.DEBIT,
            amount_paise=amount_paise,
            balance_after_paise=wallet.balance_paise,
            description=description,
            idempotency_key=idempotency_key,
            created_by=user,
        )

        LeadAuditLog.objects.create(
            entity_type="WALLET",
            entity_id=str(wallet.id),
            action="WALLET_DEBITED",
            actor=user,
            details={"amount_paise": amount_paise, "reference": ref, "new_balance": wallet.balance_paise},
        )
        return tx

    @staticmethod
    def debit_for_lead(user, amount_paise: int, lead_id: str, receipt_ref: str) -> WalletTransaction:
        return WalletService.debit_wallet(
            user=user,
            amount_paise=amount_paise,
            description=f"Payment for Lead Acceptance: {lead_id}",
            reference=receipt_ref,
        )

    @staticmethod
    @transaction.atomic
    def hold_balance(user, amount_paise: int, reference: str | None = None) -> WalletTransaction:
        if amount_paise <= 0:
            raise ValidationError("Hold amount must be greater than zero.")

        wallet = ProfessionalWallet.objects.select_for_update().get_or_create(
            professional=user,
            defaults={"balance_paise": 0, "reserved_paise": 0},
        )[0]

        if wallet.balance_paise < amount_paise:
            raise ValidationError("Insufficient available balance to reserve.")

        wallet.balance_paise -= amount_paise
        wallet.reserved_paise += amount_paise
        wallet.save(update_fields=["balance_paise", "reserved_paise", "updated_at"])

        ref = reference or f"TX-HLD-{uuid.uuid4().hex[:12].upper()}"
        return WalletTransaction.objects.create(
            wallet=wallet,
            reference=ref,
            tx_type=WalletTransaction.TxType.HOLD,
            amount_paise=amount_paise,
            balance_after_paise=wallet.balance_paise,
            description=f"Temporary hold for checkout reservation ₹{amount_paise / 100:.2f}",
            created_by=user,
        )

    @staticmethod
    @transaction.atomic
    def release_hold(user, amount_paise: int, reference: str | None = None) -> WalletTransaction:
        wallet = ProfessionalWallet.objects.select_for_update().get_or_create(
            professional=user,
            defaults={"balance_paise": 0, "reserved_paise": 0},
        )[0]

        actual_release = min(wallet.reserved_paise, amount_paise)
        if actual_release > 0:
            wallet.reserved_paise -= actual_release
            wallet.balance_paise += actual_release
            wallet.save(update_fields=["balance_paise", "reserved_paise", "updated_at"])

            ref = reference or f"TX-REL-{uuid.uuid4().hex[:12].upper()}"
            return WalletTransaction.objects.create(
                wallet=wallet,
                reference=ref,
                tx_type=WalletTransaction.TxType.HOLD_RELEASE,
                amount_paise=actual_release,
                balance_after_paise=wallet.balance_paise,
                description=f"Released reservation hold ₹{actual_release / 100:.2f}",
                created_by=user,
            )
        return None

    @staticmethod
    @transaction.atomic
    def admin_adjust_balance(
        admin_user,
        target_user,
        amount_paise: int,
        is_credit: bool,
        reason: str,
    ) -> WalletTransaction:
        if amount_paise <= 0:
            raise ValidationError("Adjustment amount must be positive.")
        if not reason:
            raise ValidationError("Adjustment reason is required for audit compliance.")

        wallet = ProfessionalWallet.objects.select_for_update().get_or_create(
            professional=target_user,
            defaults={"balance_paise": 0, "reserved_paise": 0},
        )[0]

        if not is_credit and wallet.balance_paise < amount_paise:
            raise ValidationError(
                f"Cannot debit ₹{amount_paise / 100:.2f}. Current balance is ₹{wallet.balance_paise / 100:.2f}."
            )

        if is_credit:
            wallet.balance_paise += amount_paise
            wallet.total_added_paise += amount_paise
        else:
            wallet.balance_paise -= amount_paise
            wallet.total_spent_paise += amount_paise

        wallet.save(update_fields=["balance_paise", "total_added_paise", "total_spent_paise", "updated_at"])

        ref = f"TX-ADJ-{uuid.uuid4().hex[:12].upper()}"
        tx = WalletTransaction.objects.create(
            wallet=wallet,
            reference=ref,
            tx_type=WalletTransaction.TxType.ADJUSTMENT,
            amount_paise=amount_paise,
            balance_after_paise=wallet.balance_paise,
            description=f"Admin Adjustment ({'Credit' if is_credit else 'Debit'}): {reason}",
            created_by=admin_user,
        )

        LeadAuditLog.objects.create(
            entity_type="WALLET",
            entity_id=str(wallet.id),
            action="ADMIN_WALLET_ADJUSTMENT",
            actor=admin_user,
            details={
                "is_credit": is_credit,
                "amount_paise": amount_paise,
                "reason": reason,
                "target_user_id": target_user.id,
                "new_balance": wallet.balance_paise,
            },
        )
        return tx
