from django.db import transaction
from django.utils import timezone

from apps.membership_onboarding.models import Membership, MembershipApplication, MembershipApplicationHistory
from apps.professional_onboarding.services.crud import ServiceError
@transaction.atomic
def approve_application(application: MembershipApplication, actor) -> MembershipApplication:
    application = MembershipApplication.objects.select_for_update().get(pk=application.pk)
    if application.status == MembershipApplication.Status.APPROVED:
        if hasattr(application, "membership_record"):
            return application
    if application.status == MembershipApplication.Status.REJECTED:
        raise ServiceError("Cannot approve a rejected application.", {})

    now = timezone.now()
    application.status = MembershipApplication.Status.APPROVED
    application.approved_at = now
    application.approved_by = actor
    application.save()

    if not hasattr(application, "membership_record"):
        Membership.objects.create(
            membership_id=application.reference_id,
            person=application.person,
            membership_type=application.membership_type,
            application=application,
            form=application.form,
            status=Membership.Status.ACTIVE,
            start_date=now.date(),
            approved_at=now,
            approved_by=actor,
        )

    MembershipApplicationHistory.objects.create(
        application=application,
        action="application_approved",
        actor=actor,
        metadata={},
    )
    return application


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
