from django.db.models import Prefetch

from apps.membership_onboarding.models import (
    MembershipDocument,
    MembershipFieldOption,
    MembershipForm,
    MembershipStep,
    MembershipStepField,
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
    return (
        MembershipForm.objects.filter(is_active=True)
        .select_related("membership_type")
        .order_by("-version", "-updated_at")
        .first()
    )


def _prefetch_form_configuration(form: MembershipForm | None) -> dict:
    steps_list = []
    documents = []

    if form:
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
        steps_list = list(steps)
        documents = list(MembershipDocument.objects.filter(form=form, is_active=True).order_by("display_order", "name"))

    from apps.professional_onboarding.models import CommonField
    import uuid

    common_fields = CommonField.objects.filter(is_active=True).prefetch_related("options").order_by("display_order", "label")
    if common_fields.exists():
        common_step = MembershipStep(
            id=uuid.uuid4(),
            slug="common-details",
            title="Professional Details",
            subtitle="Common details required for onboarding",
            display_order=-1,
            is_required=True,
            is_active=True,
        )
        mock_fields = []
        for cf in common_fields:
            mf = MembershipStepField(
                id=cf.id,
                field_key=cf.field_key,
                field_type=cf.field_type,
                label=cf.label,
                placeholder=cf.placeholder,
                help_text=cf.help_text,
                description=cf.description,
                is_required=cf.is_required,
                display_order=cf.display_order,
                is_active=True,
            )
            mock_options = []
            for o in cf.options.filter(is_active=True).order_by("display_order", "label"):
                mock_options.append(MembershipFieldOption(
                    id=o.id,
                    value=o.value,
                    label=o.label,
                    display_order=o.display_order,
                    is_active=True,
                ))
            mf.active_options = mock_options
            mock_fields.append(mf)
        common_step.active_fields = mock_fields
        steps_list.insert(0, common_step)

    return {
        "form": form,
        "steps": steps_list,
        "documents": documents,
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
