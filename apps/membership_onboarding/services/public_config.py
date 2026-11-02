from apps.membership_onboarding.models import (
    MembershipForm,
    MembershipType,
)

DEFAULT_TYPE_SLUG = "membership"


def ensure_default_membership_type() -> MembershipType:
    mtype, _ = MembershipType.objects.get_or_create(
        slug=DEFAULT_TYPE_SLUG,
        defaults={
            "name": "Membership",
            "description": "Default membership application",
            "is_active": True,
            "display_order": 0,
        },
    )
    return mtype


def get_active_membership_form() -> MembershipForm | None:
    return MembershipForm.objects.filter(is_active=True).order_by("-version", "-updated_at").first()


def _prefetch_form_configuration(form: MembershipForm | None) -> dict:
    return {
        "form": form,
        "steps": [],
        "documents": [],
    }


def build_active_configuration() -> dict:
    form = get_active_membership_form()
    return _prefetch_form_configuration(form)


def build_configuration_for_form(form: MembershipForm) -> dict:
    return _prefetch_form_configuration(form)


def get_active_form_for_type(membership_type: MembershipType) -> MembershipForm | None:
    return (
        MembershipForm.objects.filter(membership_type=membership_type, is_active=True)
        .order_by("-version")
        .first()
    )


def build_type_configuration(membership_type_id) -> dict:
    from django.shortcuts import get_object_or_404

    membership_type = get_object_or_404(MembershipType, pk=membership_type_id, is_active=True)
    form = get_active_form_for_type(membership_type)
    config = _prefetch_form_configuration(form)
    return {"membership_type": membership_type, **config}
