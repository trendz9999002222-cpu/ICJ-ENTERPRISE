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
    import uuid
    from apps.core.models import AdditionalOnboardingFormfields, CommonField, FormFieldConfig

    steps_list = []
    documents = []

    # 1. Fetch Dynamic Common Fields mapped to MEMBERSHIP in core
    form_configs = list(
        FormFieldConfig.objects.filter(
            form__form_code=AdditionalOnboardingFormfields.FormCode.MEMBERSHIP,
            is_visible=True,
            common_field__is_active=True,
        )
        .select_related("common_field")
        .order_by("display_order", "common_field__name")
    )

    common_fields_data = []
    if form_configs:
        for fc in form_configs:
            cf = fc.common_field
            common_fields_data.append({
                "id": cf.id,
                "field_key": cf.field_key,
                "field_type": cf.field_type,
                "label": fc.label_override or cf.label,
                "placeholder": fc.placeholder_override or cf.placeholder,
                "help_text": fc.help_text_override or cf.help_text,
                "description": cf.description,
                "is_required": fc.is_required,
                "display_order": fc.display_order,
                "options": cf.options,
                "validation_config": fc.validation_overrides or cf.validation_rules or {},
            })
    else:
        # Fallback to all active core CommonFields directly
        active_cfs = CommonField.objects.filter(is_active=True).order_by("name")
        for i, cf in enumerate(active_cfs):
            common_fields_data.append({
                "id": cf.id,
                "field_key": cf.field_key,
                "field_type": cf.field_type,
                "label": cf.label,
                "placeholder": cf.placeholder,
                "help_text": cf.help_text,
                "description": cf.description,
                "is_required": cf.is_system_field,
                "display_order": (i + 1) * 10,
                "options": cf.options,
                "validation_config": cf.validation_rules or {},
            })

    if common_fields_data:
        common_step = MembershipStep(
            id=uuid.uuid4(),
            slug="personal-details",
            title="Personal Details",
            subtitle="Personal details required for membership",
            display_order=0,
            is_required=True,
            is_active=True,
        )
        mock_fields = []
        for cdata in common_fields_data:
            mf = MembershipStepField(
                id=cdata["id"],
                field_key=cdata["field_key"],
                field_type=cdata["field_type"],
                label=cdata["label"],
                placeholder=cdata["placeholder"],
                help_text=cdata["help_text"],
                description=cdata["description"],
                is_required=cdata["is_required"],
                display_order=cdata["display_order"],
                is_active=True,
                validation_config=cdata["validation_config"],
            )
            mock_options = []
            for o in (cdata.get("options") or []):
                if isinstance(o, dict):
                    mock_options.append(MembershipFieldOption(
                        id=uuid.uuid4(),
                        value=o.get("value", o.get("label", "")),
                        label=o.get("label", o.get("value", "")),
                        display_order=o.get("display_order", 0),
                        is_active=True,
                    ))
                elif isinstance(o, str):
                    mock_options.append(MembershipFieldOption(
                        id=uuid.uuid4(),
                        value=o,
                        label=o,
                        display_order=0,
                        is_active=True,
                    ))
            mf.active_options = mock_options
            mock_fields.append(mf)
        common_step.active_fields = mock_fields
        steps_list.append(common_step)

    # 2. Fetch Additional Fields from the Membership Form (if any configured)
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
        for s in steps:
            # Ignore legacy hardcoded duplicate steps (from old seed scripts)
            if s.slug in ("personal_details", "personal-details", "common-details", "professional_details"):
                continue
            active_fields = getattr(s, "active_fields", None)
            if active_fields is None:
                active_fields = list(s.fields.filter(is_active=True))
            if active_fields:
                s.active_fields = active_fields
                steps_list.append(s)

        documents = list(MembershipDocument.objects.filter(form=form, is_active=True).order_by("display_order", "name"))

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
