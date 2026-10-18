from datetime import timedelta
import uuid
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import transaction
from django.utils import timezone

from apps.leads.models import (
    Lead,
    LeadPublication,
    LeadReservation,
    LeadAcceptance,
    LeadActivity,
    LeadCommercialSettings,
    RefundRequest,
    LeadAuditLog,
    WalletTransaction,
    ProfessionalWallet,
)
from apps.leads.services.pricing_service import PricingService
from apps.leads.services.wallet_service import WalletService
from apps.leads.services.plan_service import PlanService
from apps.professional_onboarding.models.submission import ProfessionalRegistrationSubmission


class LeadService:
    @staticmethod
    def is_professional_eligible(user) -> bool:
        """
        Verifies user is an active professional with approved registration.
        """
        if not user or not user.is_authenticated or not user.is_active:
            return False
        if user.role == "professional" or user.is_staff or user.is_superuser:
            return True
        return ProfessionalRegistrationSubmission.objects.filter(
            user=user,
            status=ProfessionalRegistrationSubmission.Status.APPROVED,
        ).exists()

    @staticmethod
    @transaction.atomic
    def publish_lead(lead_id: str, admin_user, notes: str = "") -> Lead:
        lead = Lead.objects.select_for_update().get(id=lead_id)
        if lead.status == Lead.Status.ACCEPTED:
            raise ValidationError("Cannot publish a lead that has already been accepted.")

        lead.status = Lead.Status.PUBLISHED
        lead.published_at = timezone.now()
        lead.save(update_fields=["status", "published_at", "updated_at"])

        LeadPublication.objects.create(
            lead=lead,
            published_by=admin_user,
            published_at=lead.published_at,
            notes=notes,
            is_active=True,
        )

        LeadActivity.objects.create(
            lead=lead,
            actor=admin_user,
            action="LEAD_PUBLISHED",
            description=f"Lead {lead.lead_id} approved and published to marketplace by admin.",
            metadata={"notes": notes},
        )
        return lead

    @staticmethod
    @transaction.atomic
    def unpublish_lead(lead_id: str, admin_user, notes: str = "") -> Lead:
        lead = Lead.objects.select_for_update().get(id=lead_id)
        if lead.status == Lead.Status.ACCEPTED:
            raise ValidationError("Cannot unpublish an accepted lead.")

        lead.status = Lead.Status.UNAVAILABLE
        lead.save(update_fields=["status", "updated_at"])

        # Deactivate latest publication record
        LeadPublication.objects.filter(lead=lead, is_active=True).update(
            is_active=False,
            unpublished_at=timezone.now(),
        )

        LeadActivity.objects.create(
            lead=lead,
            actor=admin_user,
            action="LEAD_UNPUBLISHED",
            description=f"Lead {lead.lead_id} removed from marketplace: {notes}",
            metadata={"notes": notes},
        )
        return lead

    @staticmethod
    @transaction.atomic
    def reserve_lead(lead_id: str, user, idempotency_key: str | None = None) -> LeadReservation:
        """
        Enforces single-active checkout reservation with row-level locks and strict expiry.
        """
        if not LeadService.is_professional_eligible(user):
            raise PermissionDenied("You must be an approved, verified professional to reserve leads.")

        lead = Lead.objects.select_for_update().get(id=lead_id)
        now = timezone.now()

        if lead.status == Lead.Status.ACCEPTED:
            raise ValidationError("This lead has already been accepted by another professional.")
        if lead.status not in (Lead.Status.PUBLISHED, Lead.Status.RESERVED):
            raise ValidationError(f"Lead is currently not available for checkout (Status: {lead.status}).")

        # Expire old reservations on this lead
        active_res = (
            LeadReservation.objects.select_for_update()
            .filter(lead=lead, status=LeadReservation.Status.ACTIVE)
            .first()
        )
        if active_res:
            if active_res.expires_at > now:
                if active_res.professional_id == user.id:
                    return active_res
                raise ValidationError("This lead is currently reserved by another professional in checkout.")
            else:
                active_res.status = LeadReservation.Status.EXPIRED
                active_res.save(update_fields=["status"])

        settings_obj = LeadCommercialSettings.get_settings()
        timeout_minutes = settings_obj.reservation_timeout_minutes or 10
        expires_at = now + timedelta(minutes=timeout_minutes)

        key = idempotency_key or f"res_{lead.id}_{user.id}_{int(now.timestamp())}"
        reservation = LeadReservation.objects.create(
            lead=lead,
            professional=user,
            idempotency_key=key,
            reserved_at=now,
            expires_at=expires_at,
            status=LeadReservation.Status.ACTIVE,
        )

        lead.status = Lead.Status.RESERVED
        lead.save(update_fields=["status", "updated_at"])

        LeadActivity.objects.create(
            lead=lead,
            actor=user,
            action="LEAD_RESERVED",
            description=f"Lead {lead.lead_id} reserved for checkout until {expires_at.strftime('%H:%M:%S')}.",
            metadata={"reservation_id": str(reservation.id), "expires_at": expires_at.isoformat()},
        )
        return reservation

    @staticmethod
    @transaction.atomic
    def accept_lead(
        lead_id: str,
        user,
        payment_method: str,
        idempotency_key: str | None = None,
    ) -> LeadAcceptance:
        """
        Atomic lead acceptance.
        Validates eligibility, exclusivity, pricing, compliance flag, and deducts payment.
        """
        if not LeadService.is_professional_eligible(user):
            raise PermissionDenied("You must be an approved, verified professional to accept leads.")

        lead = Lead.objects.select_for_update().get(id=lead_id)
        now = timezone.now()

        # Concurrency / Exclusivity Check
        if lead.status == Lead.Status.ACCEPTED:
            raise ValidationError("This lead has already been accepted by another professional.")
        if lead.status not in (Lead.Status.PUBLISHED, Lead.Status.RESERVED):
            raise ValidationError(f"This lead is not available for acceptance (Status: {lead.status}).")

        # Check existing reservation
        active_res = (
            LeadReservation.objects.select_for_update()
            .filter(lead=lead, status=LeadReservation.Status.ACTIVE)
            .first()
        )
        if active_res and active_res.expires_at > now and active_res.professional_id != user.id:
            raise ValidationError("This lead is currently held in checkout by another professional.")

        commercial_settings = LeadCommercialSettings.get_settings()
        receipt_ref = f"ICJ-REC-{now.year}-{uuid.uuid4().hex[:10].upper()}"
        wallet = WalletService.get_or_create_wallet(user)
        required_tokens = max(1, lead.tokens_required or 1)

        price_paid_paise = 0
        tokens_spent = 0

        if payment_method == LeadAcceptance.PaymentMethod.WALLET:
            if not commercial_settings.paid_unlock_enabled:
                raise ValidationError("Commercial lead unlocking is disabled pending compliance review.")
            if not commercial_settings.allow_wallet_payment:
                raise ValidationError("Wallet payment is disabled in commercial settings.")
            price_paise = lead.price_paise or 0
            if wallet.available_paise < price_paise:
                raise ValidationError("Insufficient wallet balance.")
            WalletService.debit_for_lead(
                user=user,
                amount_paise=price_paise,
                lead_id=str(lead.id),
                receipt_ref=receipt_ref,
            )
            price_paid_paise = price_paise
            tokens_spent = 0
        elif payment_method == LeadAcceptance.PaymentMethod.LEAD_CREDIT:
            if not commercial_settings.allow_lead_credit_payment:
                raise ValidationError("Lead credit payment is disabled.")
            if PlanService.get_available_credits(user) < 1:
                raise ValidationError("No active, valid lead credits available.")
            price_paid_paise = 0
            tokens_spent = 1
        else:
            # Token-based economy ("tokens" or default)
            plan_credits = PlanService.get_available_credits(user)
            if plan_credits > wallet.token_balance:
                wallet.token_balance = plan_credits
                wallet.save(update_fields=["token_balance", "updated_at"])

            if wallet.token_balance < required_tokens:
                raise ValidationError(
                    f"Insufficient tokens. You have {wallet.token_balance} token(s), but this lead requires {required_tokens} token(s). Please purchase tokens to accept this lead."
                )

            # Deduct tokens from wallet
            wallet.token_balance -= required_tokens
            wallet.total_tokens_spent += required_tokens
            wallet.save(update_fields=["token_balance", "total_tokens_spent", "updated_at"])

            WalletTransaction.objects.create(
                wallet=wallet,
                reference=f"TX-TOK-ACC-{receipt_ref}",
                tx_type=WalletTransaction.TxType.DEBIT,
                amount_paise=0,
                balance_after_paise=wallet.balance_paise,
                tokens_delta=-required_tokens,
                token_balance_after=wallet.token_balance,
                description=f"Tokens deducted for Lead Acceptance: {lead.lead_id}",
                idempotency_key=f"tok_acc_{lead.id}_{user.id}_{int(now.timestamp())}",
                created_by=user,
            )
            price_paid_paise = 0
            tokens_spent = required_tokens
            payment_method = "tokens"

        # Update Lead status to ACCEPTED and set assigned professional
        lead.status = Lead.Status.ACCEPTED
        lead.assigned_professional = user
        lead.save(update_fields=["status", "assigned_professional", "updated_at"])

        # Mark any active reservation consumed
        if active_res:
            active_res.status = LeadReservation.Status.CONSUMED
            active_res.save(update_fields=["status"])

        # Create immutable LeadAcceptance
        acceptance = LeadAcceptance.objects.create(
            lead=lead,
            professional=user,
            accepted_at=now,
            payment_method=payment_method,
            price_paid_paise=price_paid_paise,
            tokens_spent=tokens_spent,
            receipt_reference=receipt_ref,
            client_contact_unlocked=True,
            status=LeadAcceptance.Status.ACTIVE,
        )

        if PlanService.get_available_credits(user) > 0:
            PlanService.consume_one_credit(user=user, lead_acceptance=acceptance)

        LeadActivity.objects.create(
            lead=lead,
            actor=user,
            action="LEAD_ACCEPTED",
            description=f"Lead {lead.lead_id} accepted exclusively by {user.email} via {payment_method}.",
            metadata={"receipt": receipt_ref, "tokens_spent": tokens_spent, "price_paid_paise": price_paid_paise},
        )

        LeadAuditLog.objects.create(
            entity_type="LEAD",
            entity_id=str(lead.id),
            action="LEAD_ACCEPTED",
            actor=user,
            details={"professional_id": user.id, "tokens_spent": tokens_spent, "receipt_reference": receipt_ref},
        )
        return acceptance

    @staticmethod
    @transaction.atomic
    def reassign_lead(
        lead_id: str,
        admin_user,
        new_professional_id: str | None = None,
        refund_previous: bool = True,
        handover_notes: str = "",
        return_to_marketplace: bool = False,
    ) -> Lead:
        """
        Reassigns lead from one professional to another or returns it to the marketplace.
        Preserves 100% of case progress, history, and uploaded documents.
        Optionally refunds tokens back to the previous professional.
        """
        lead = Lead.objects.select_for_update().get(id=lead_id)
        now = timezone.now()

        active_acc = lead.acceptances.filter(status=LeadAcceptance.Status.ACTIVE).first()
        prev_pro = lead.assigned_professional or (active_acc.professional if active_acc else None)

        # 1. Refund previous professional if requested
        if prev_pro and refund_previous:
            refund_tokens = active_acc.tokens_spent if active_acc else lead.tokens_required
            prev_wallet = WalletService.get_or_create_wallet(prev_pro)
            prev_wallet.token_balance += refund_tokens
            prev_wallet.save(update_fields=["token_balance", "updated_at"])

            ref_code = f"TX-TOK-REF-{uuid.uuid4().hex[:10].upper()}"
            WalletTransaction.objects.create(
                wallet=prev_wallet,
                reference=ref_code,
                tx_type=WalletTransaction.TxType.REFUND,
                amount_paise=0,
                balance_after_paise=prev_wallet.balance_paise,
                tokens_delta=refund_tokens,
                token_balance_after=prev_wallet.token_balance,
                description=f"Refund of {refund_tokens} token(s) for Lead {lead.lead_id} due to administrative reassignment.",
                created_by=admin_user,
            )
            if active_acc:
                active_acc.status = LeadAcceptance.Status.REFUNDED
                active_acc.notes = f"Refunded & reassigned by admin: {handover_notes}"
                active_acc.save(update_fields=["status", "notes"])
        elif active_acc:
            active_acc.status = LeadAcceptance.Status.REASSIGNED
            active_acc.notes = f"Reassigned by admin without token refund: {handover_notes}"
            active_acc.save(update_fields=["status", "notes"])

        # 2. Append Handover Notes while preserving all prior case notes and milestones
        timestamp_str = now.strftime('%Y-%m-%d %I:%M %p')
        prev_name = (prev_pro.get_full_name() or prev_pro.email) if prev_pro else "Previous Professional"
        handover_entry = (
            f"\n\n--- [Case Handover by Admin on {timestamp_str}] ---\n"
            f"Transferred from: {prev_name}\n"
            f"Handover Notes: {handover_notes}\n"
            f"(All previous documents, problem details, and case progress notes above remain intact)"
        )
        lead.reassignment_notes = (lead.reassignment_notes + handover_entry).strip()

        # 3. Assign to new professional or return to marketplace
        if new_professional_id and not return_to_marketplace:
            from apps.accounts.models import User
            new_pro = User.objects.get(id=new_professional_id)
            lead.assigned_professional = new_pro
            lead.status = Lead.Status.ACCEPTED

            receipt_ref = f"ICJ-REASSIGN-{now.year}-{uuid.uuid4().hex[:8].upper()}"
            LeadAcceptance.objects.create(
                lead=lead,
                professional=new_pro,
                accepted_at=now,
                payment_method="admin_reassignment",
                price_paid_paise=0,
                tokens_spent=0,
                receipt_reference=receipt_ref,
                client_contact_unlocked=True,
                status=LeadAcceptance.Status.ACTIVE,
                notes=f"Reassigned by admin {admin_user.email}. Handover: {handover_notes}",
            )

            LeadActivity.objects.create(
                lead=lead,
                actor=admin_user,
                action="LEAD_REASSIGNED",
                description=f"Lead {lead.lead_id} reassigned from {prev_name} to {new_pro.get_full_name() or new_pro.email}. Case progress preserved.",
                metadata={"handover_notes": handover_notes},
            )
        else:
            lead.assigned_professional = None
            lead.status = Lead.Status.PUBLISHED
            lead.published_at = now

            LeadActivity.objects.create(
                lead=lead,
                actor=admin_user,
                action="LEAD_REPUBLISHED_AFTER_REASSIGNMENT",
                description=f"Lead {lead.lead_id} released from {prev_name} and republished to marketplace. Case progress preserved.",
                metadata={"handover_notes": handover_notes},
            )

        lead.save()
        return lead


    @staticmethod
    @transaction.atomic
    def finalize_direct_acceptance(lead: Lead, user, price_paise: int, receipt_ref: str) -> LeadAcceptance:
        """
        Called after successful direct gateway payment verification.
        """
        now = timezone.now()
        lead.refresh_from_db()
        if lead.status == Lead.Status.ACCEPTED:
            # Late payment scenario!
            # Lead is already taken by someone else: safely initiate automatic refund or wallet credit
            WalletService.credit_wallet(
                user=user,
                amount_paise=price_paise,
                description=f"Auto-credited: Lead {lead.lead_id} was taken before payment completion.",
                reference=f"TX-LATEPAY-{receipt_ref}",
            )
            LeadActivity.objects.create(
                lead=lead,
                actor=user,
                action="LATE_PAYMENT_RESOLVED",
                description=f"Late payment of ₹{price_paise / 100:.2f} credited to wallet as lead was already accepted.",
            )
            return None

        lead.status = Lead.Status.ACCEPTED
        lead.save(update_fields=["status", "updated_at"])

        acceptance = LeadAcceptance.objects.create(
            lead=lead,
            professional=user,
            accepted_at=now,
            payment_method=LeadAcceptance.PaymentMethod.DIRECT_PAYMENT,
            price_paid_paise=price_paise,
            receipt_reference=receipt_ref,
            client_contact_unlocked=True,
            status=LeadAcceptance.Status.ACTIVE,
        )

        LeadActivity.objects.create(
            lead=lead,
            actor=user,
            action="LEAD_ACCEPTED_DIRECT_PAYMENT",
            description=f"Lead {lead.lead_id} finalized via direct payment {receipt_ref}.",
            metadata={"price_paid_paise": price_paise},
        )
        return acceptance

    @staticmethod
    @transaction.atomic
    def release_lead(lead_id: str, user, reason: str = "") -> LeadAcceptance:
        acceptance = LeadAcceptance.objects.select_for_update().get(lead__id=lead_id, professional=user)
        if acceptance.status != LeadAcceptance.Status.ACTIVE:
            raise ValidationError("Acceptance is not active.")

        acceptance.status = LeadAcceptance.Status.RELEASED
        acceptance.notes = f"Released by professional: {reason}"
        acceptance.save(update_fields=["status", "notes"])

        lead = acceptance.lead
        lead.status = Lead.Status.UNAVAILABLE
        lead.save(update_fields=["status", "updated_at"])

        LeadActivity.objects.create(
            lead=lead,
            actor=user,
            action="LEAD_RELEASED",
            description=f"Lead {lead.lead_id} released by {user.email}: {reason}",
            metadata={"reason": reason},
        )
        return acceptance

    @staticmethod
    @transaction.atomic
    def request_refund(lead_id: str, user, reason: str) -> RefundRequest:
        acceptance = LeadAcceptance.objects.get(lead__id=lead_id, professional=user)
        if not reason:
            raise ValidationError("Reason is required to request a refund.")

        existing = RefundRequest.objects.filter(
            lead_acceptance=acceptance,
            status__in=[RefundRequest.Status.PENDING, RefundRequest.Status.APPROVED],
        ).first()
        if existing:
            raise ValidationError("A refund request is already pending or approved for this lead.")

        req = RefundRequest.objects.create(
            lead_acceptance=acceptance,
            requested_by=user,
            amount_paise=acceptance.price_paid_paise,
            reason=reason,
            status=RefundRequest.Status.PENDING,
        )

        LeadActivity.objects.create(
            lead=acceptance.lead,
            actor=user,
            action="REFUND_REQUESTED",
            description=f"Refund of ₹{acceptance.price_paid_paise / 100:.2f} requested: {reason}",
        )
        return req

    @staticmethod
    @transaction.atomic
    def process_refund(refund_request_id: str, admin_user, approve: bool, notes: str = "") -> RefundRequest:
        refund = RefundRequest.objects.select_for_update().get(id=refund_request_id)
        if refund.status != RefundRequest.Status.PENDING:
            raise ValidationError("Refund request is not pending review.")

        if not approve:
            refund.status = RefundRequest.Status.REJECTED
            refund.admin_notes = notes
            refund.reviewed_by = admin_user
            refund.resolved_at = timezone.now()
            refund.save(update_fields=["status", "admin_notes", "reviewed_by", "resolved_at"])
            return refund

        # Approve and execute compensating ledger entry
        refund.status = RefundRequest.Status.PROCESSED
        refund.admin_notes = notes
        refund.reviewed_by = admin_user
        refund.resolved_at = timezone.now()
        refund.save(update_fields=["status", "admin_notes", "reviewed_by", "resolved_at"])

        acceptance = refund.lead_acceptance
        if acceptance:
            acceptance.status = LeadAcceptance.Status.REFUNDED
            acceptance.save(update_fields=["status"])

            lead = acceptance.lead
            lead.status = Lead.Status.UNAVAILABLE
            lead.save(update_fields=["status", "updated_at"])

            # Compensating transaction based on original payment method
            if acceptance.payment_method == LeadAcceptance.PaymentMethod.WALLET:
                WalletService.credit_wallet(
                    user=acceptance.professional,
                    amount_paise=refund.amount_paise,
                    description=f"Refund for Lead {lead.lead_id}",
                    reference=f"TX-REF-{uuid.uuid4().hex[:10].upper()}",
                    created_by=admin_user,
                )
            elif acceptance.payment_method == LeadAcceptance.PaymentMethod.LEAD_CREDIT:
                PlanService.restore_one_credit(
                    user=acceptance.professional,
                    lead_acceptance=acceptance,
                    reason=f"Refund approved by admin: {notes}",
                )

            LeadActivity.objects.create(
                lead=lead,
                actor=admin_user,
                action="REFUND_PROCESSED",
                description=f"Refund of ₹{refund.amount_paise / 100:.2f} processed by admin.",
                metadata={"notes": notes},
            )
        return refund
