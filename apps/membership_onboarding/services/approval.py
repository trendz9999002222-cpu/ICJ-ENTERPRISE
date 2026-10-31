from django.db import transaction
from django.utils import timezone

from apps.membership_onboarding.models import Membership, MembershipApplication, MembershipApplicationHistory
from apps.professional_onboarding.services.crud import ServiceError
from apps.accounts.services.user_provisioning import provision_user_for_membership
from apps.membership_onboarding.services.submission import allocate_membership_id


@transaction.atomic
def ensure_approved_membership(application: MembershipApplication, actor=None) -> tuple[MembershipApplication, str]:
    """
    Ensures that a membership application is approved by default and has an associated active Membership record.
    Members are approved by default.
    """
    now = timezone.now()
    if application.status != MembershipApplication.Status.APPROVED:
        application.status = MembershipApplication.Status.APPROVED
        application.approved_at = application.approved_at or now
        if actor:
            application.approved_by = actor
        application.save(update_fields=["status", "approved_at", "approved_by"] if actor else ["status", "approved_at"])

    record = getattr(application, "membership_record", None)
    if record is None:
        record = Membership.objects.filter(application=application).first()

    if record is None:
        from apps.membership_onboarding.services.public_config import (
            ensure_default_membership_type,
            get_active_membership_form,
        )
        form = application.form or get_active_membership_form()
        membership_type = application.membership_type or (form.membership_type if form else None) or ensure_default_membership_type()
        membership_id = allocate_membership_id()

        person = application.person
        if not person and application.user:
            person = getattr(application.user, "person", None)
        if not person:
            from apps.person.services import resolve_person_for_application
            person = resolve_person_for_application(field_values=application.field_values or {}, user=application.user)
            application.person = person
            application.save(update_fields=["person"])

        record = Membership.objects.create(
            membership_id=membership_id,
            person=person,
            membership_type=membership_type,
            application=application,
            form=form,
            status=Membership.Status.ACTIVE,
            start_date=now.date(),
            approved_at=now,
            approved_by=actor,
        )

        MembershipApplicationHistory.objects.create(
            application=application,
            action="application_approved",
            actor=actor,
            metadata={
                "auto_approved": True,
                "membership_id": membership_id,
            },
        )
    return application, record.membership_id


@transaction.atomic
def approve_application(application: MembershipApplication, actor):
    application = MembershipApplication.objects.select_for_update().get(pk=application.pk)
    if application.status == MembershipApplication.Status.APPROVED:
        if hasattr(application, "membership_record"):
            return application, None, False
    if application.status == MembershipApplication.Status.REJECTED:
        raise ServiceError("Cannot approve a rejected application.", {})

    now = timezone.now()
    application.status = MembershipApplication.Status.APPROVED
    application.approved_at = now
    application.approved_by = actor

    user, temp_password, is_new = provision_user_for_membership(application)
    application.user = user
    application.save()

    record = getattr(application, "membership_record", None)
    if record is None:
        membership_id = allocate_membership_id()
        Membership.objects.create(
            membership_id=membership_id,
            person=application.person,
            membership_type=application.membership_type,
            application=application,
            form=application.form,
            status=Membership.Status.ACTIVE,
            start_date=now.date(),
            approved_at=now,
            approved_by=actor,
        )
    else:
        membership_id = record.membership_id

    MembershipApplicationHistory.objects.create(
        application=application,
        action="application_approved",
        actor=actor,
        metadata={
            "user_created": is_new,
            "user_email": user.email if user else None,
            "membership_id": membership_id,
        },
    )
    return application, temp_password, is_new


@transaction.atomic
def reject_application(application: MembershipApplication, actor, reason: str) -> MembershipApplication:
    application = MembershipApplication.objects.select_for_update().get(pk=application.pk)
    if application.status == MembershipApplication.Status.REJECTED:
        return application
    if not (reason or "").strip():
        raise ServiceError("Rejection reason is required.", {"rejection_reason": ["Required."]})

    now = timezone.now()
    application.status = MembershipApplication.Status.REJECTED
    application.rejected_at = now
    application.rejected_by = actor
    application.rejection_reason = reason.strip()
    application.save()

    MembershipApplicationHistory.objects.create(
        application=application,
        action="application_rejected",
        actor=actor,
        metadata={"reason": reason.strip()},
    )
    return application


@transaction.atomic
def mark_under_review(application: MembershipApplication, actor) -> MembershipApplication:
    application = MembershipApplication.objects.select_for_update().get(pk=application.pk)
    application.status = MembershipApplication.Status.UNDER_REVIEW
    application.reviewed_at = timezone.now()
    application.reviewed_by = actor
    application.save()
    MembershipApplicationHistory.objects.create(
        application=application,
        action="under_review",
        actor=actor,
        metadata={},
    )
    return application
