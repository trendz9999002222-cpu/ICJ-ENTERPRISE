from datetime import timedelta
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.leads.models import (
    LeadCreditPlan,
    ProfessionalPlanPurchase,
    LeadCreditLedger,
    LeadAcceptance,
    LeadAuditLog,
)


class PlanService:
    @staticmethod
    def get_available_credits(user) -> int:
        now = timezone.now()
        purchases = ProfessionalPlanPurchase.objects.filter(
            professional=user,
            status=ProfessionalPlanPurchase.Status.ACTIVE,
            remaining_credits__gt=0,
        )
        total = 0
        for p in purchases:
            if p.valid_until and p.valid_until < now:
                p.status = ProfessionalPlanPurchase.Status.EXPIRED
                p.save(update_fields=["status"])
                continue
            total += p.remaining_credits
        return total

    @staticmethod
    @transaction.atomic
    def grant_plan_credits(user, plan: LeadCreditPlan, payment_order=None) -> ProfessionalPlanPurchase:
        valid_until = None
        if plan.validity_days and plan.validity_days > 0:
            valid_until = timezone.now() + timedelta(days=plan.validity_days)

        purchase = ProfessionalPlanPurchase.objects.create(
            professional=user,
            plan=plan,
            total_credits=plan.credits_granted,
            remaining_credits=plan.credits_granted,
            price_paid_paise=plan.price_paise,
            valid_until=valid_until,
            status=ProfessionalPlanPurchase.Status.ACTIVE,
        )

        LeadCreditLedger.objects.create(
            purchase=purchase,
            professional=user,
            entry_type=LeadCreditLedger.EntryType.CREDIT_GRANTED,
            credits_delta=plan.credits_granted,
            balance_after=PlanService.get_available_credits(user),
            notes=f"Purchased plan '{plan.name}' with {plan.credits_granted} credits",
        )

        from apps.leads.services.wallet_service import WalletService
        from apps.leads.models import WalletTransaction
        import uuid
        wallet = WalletService.get_or_create_wallet(user)
        wallet.token_balance += plan.credits_granted
        wallet.total_tokens_purchased += plan.credits_granted
        wallet.save(update_fields=["token_balance", "total_tokens_purchased", "updated_at"])

        WalletTransaction.objects.create(
            wallet=wallet,
            reference=f"TX-PLAN-{uuid.uuid4().hex[:10].upper()}",
            tx_type=WalletTransaction.TxType.CREDIT,
            amount_paise=plan.price_paise,
            balance_after_paise=wallet.balance_paise,
            tokens_delta=plan.credits_granted,
            token_balance_after=wallet.token_balance,
            description=f"Purchased plan '{plan.name}' (+{plan.credits_granted} tokens)",
            created_by=user,
        )

        LeadAuditLog.objects.create(
            entity_type="PLAN",
            entity_id=str(plan.id),
            action="PLAN_PURCHASED",
            actor=user,
            details={"plan_name": plan.name, "credits": plan.credits_granted, "purchase_id": str(purchase.id)},
        )
        return purchase

    @staticmethod
    @transaction.atomic
    def consume_one_credit(user, lead_acceptance: LeadAcceptance) -> LeadCreditLedger:
        now = timezone.now()
        active_purchases = (
            ProfessionalPlanPurchase.objects.select_for_update()
            .filter(
                professional=user,
                status=ProfessionalPlanPurchase.Status.ACTIVE,
                remaining_credits__gt=0,
            )
            .order_by("created_at")
        )

        valid_purchase = None
        for p in active_purchases:
            if p.valid_until and p.valid_until < now:
                p.status = ProfessionalPlanPurchase.Status.EXPIRED
                p.save(update_fields=["status"])
                continue
            valid_purchase = p
            break

        if not valid_purchase:
            raise ValidationError("No active, valid lead credits available.")

        valid_purchase.remaining_credits -= 1
        if valid_purchase.remaining_credits == 0:
            valid_purchase.status = ProfessionalPlanPurchase.Status.EXHAUSTED
        valid_purchase.save(update_fields=["remaining_credits", "status"])

        remaining_total = PlanService.get_available_credits(user)
        entry = LeadCreditLedger.objects.create(
            purchase=valid_purchase,
            professional=user,
            entry_type=LeadCreditLedger.EntryType.CREDIT_CONSUMED,
            credits_delta=-1,
            balance_after=remaining_total,
            lead_acceptance=lead_acceptance,
            notes=f"Consumed 1 credit for lead {lead_acceptance.lead.lead_id}",
        )
        return entry

    @staticmethod
    @transaction.atomic
    def restore_one_credit(user, lead_acceptance: LeadAcceptance, reason: str = "") -> LeadCreditLedger:
        # Find purchase associated with this acceptance
        last_entry = (
            LeadCreditLedger.objects.filter(
                professional=user,
                lead_acceptance=lead_acceptance,
                entry_type=LeadCreditLedger.EntryType.CREDIT_CONSUMED,
            )
            .select_related("purchase")
            .first()
        )
        if last_entry and last_entry.purchase:
            purchase = ProfessionalPlanPurchase.objects.select_for_update().get(id=last_entry.purchase_id)
            purchase.remaining_credits += 1
            if purchase.status == ProfessionalPlanPurchase.Status.EXHAUSTED:
                purchase.status = ProfessionalPlanPurchase.Status.ACTIVE
            purchase.save(update_fields=["remaining_credits", "status"])
        else:
            # Fallback to most recent active purchase
            purchase = (
                ProfessionalPlanPurchase.objects.select_for_update()
                .filter(professional=user)
                .order_by("-created_at")
                .first()
            )
            if not purchase:
                raise ValidationError("Cannot restore credit: no purchase record found.")
            purchase.remaining_credits += 1
            purchase.save(update_fields=["remaining_credits"])

        remaining_total = PlanService.get_available_credits(user)
        return LeadCreditLedger.objects.create(
            purchase=purchase,
            professional=user,
            entry_type=LeadCreditLedger.EntryType.CREDIT_RESTORED,
            credits_delta=1,
            balance_after=remaining_total,
            lead_acceptance=lead_acceptance,
            notes=f"Restored 1 credit for lead {lead_acceptance.lead.lead_id}: {reason}",
        )
