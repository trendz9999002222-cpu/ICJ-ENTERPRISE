from django.db.models import Prefetch
from django.shortcuts import get_object_or_404

from apps.membership_onboarding.models import (
    MembershipDocument,
    MembershipFieldOption,
    MembershipForm,
    MembershipStep,
    MembershipStepField,
    MembershipType,
)


def get_active_form_for_type(membership_type: MembershipType) -> MembershipForm | None:
    return (
        MembershipForm.objects.filter(membership_type=membership_type, is_active=True)
        .order_by("-version")
        .first()
    )


def build_type_configuration(membership_type_id) -> dict:
    membership_type = get_object_or_404(MembershipType, pk=membership_type_id, is_active=True)
    form = get_active_form_for_type(membership_type)
    if not form:
        return {"membership_type": membership_type, "form": None, "steps": [], "documents": []}

    option_prefetch = Prefetch(
        "options",
        queryset=MembershipFieldOption.objects.filter(is_active=True).order_by("display_order", "label"),
        to_attr="active_options",
    )
    field_prefetch = Prefetch(
        "fields",
        queryset=MembershipStepField.objects.filter(is_active=True)
        .prefetch_related(option_prefetch)
        .order_by("display_order", "name"),
        to_attr="active_fields",
    )
    steps = (
        MembershipStep.objects.filter(form=form, is_active=True)
        .prefetch_related(field_prefetch)
        .order_by("display_order", "name")
    )
    documents = (
        MembershipDocument.objects.filter(form=form, is_active=True).order_by("display_order", "name")
    )
    return {
        "membership_type": membership_type,
        "form": form,
        "steps": list(steps),
        "documents": list(documents),
    }
