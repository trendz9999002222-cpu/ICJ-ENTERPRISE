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
    active_forms = list(
        MembershipForm.objects.filter(is_active=True)
        .select_related("membership_type")
        .order_by("-version", "-updated_at")
    )
    if not active_forms:
        return None
    for f in active_forms:
        if f.steps.filter(is_active=True).exists():
            return f
    return active_forms[0]


def _ensure_membership_common_fields():
    from apps.core.models import AdditionalOnboardingFormfields, CommonField, FormFieldConfig

    membership_form, _ = AdditionalOnboardingFormfields.objects.get_or_create(
        form_code=AdditionalOnboardingFormfields.FormCode.MEMBERSHIP,
        defaults={
            "form_name": "Trustee Membership",
            "description": "Application flow for Trustee Membership.",
        },
    )

    # Clean up duplicate and legacy fields
    CommonField.objects.filter(field_key__in=["first_name", "last_name", "state_name", "city_name"]).delete()
    FormFieldConfig.objects.filter(common_field__field_key__in=["first_name", "last_name", "state_name", "city_name"]).delete()

    standard_fields = [
        {"field_key": "full_name", "name": "Full Name", "label": "Full Name", "field_type": "text", "placeholder": "Enter full legal name", "is_required": True, "section_name": "Personal Particulars", "display_order": 10},
        {"field_key": "email", "name": "Email Address", "label": "Email Address", "field_type": "email", "placeholder": "name@example.com", "is_required": True, "section_name": "Contact & Location", "display_order": 20},
        {"field_key": "mobile_number", "name": "Mobile / WhatsApp Number", "label": "Mobile / WhatsApp Number", "field_type": "phone", "placeholder": "98765 43210", "is_required": True, "section_name": "Contact & Location", "display_order": 30},
        {"field_key": "date_of_birth", "name": "Date of Birth", "label": "Date of Birth", "field_type": "date", "is_required": True, "section_name": "Personal Particulars", "display_order": 40},
        {
            "field_key": "gender",
            "name": "Gender",
            "label": "Gender",
            "field_type": "select",
            "is_required": False,
            "options": [
                {"label": "Male", "value": "Male"},
                {"label": "Female", "value": "Female"},
                {"label": "Other", "value": "Other"},
                {"label": "Prefer not to disclose", "value": "Prefer not to disclose"},
            ],
            "section_name": "Personal Particulars",
            "display_order": 50,
        },
        {"field_key": "country", "name": "Country", "label": "Country", "field_type": "country", "placeholder": "e.g. India", "is_required": True, "section_name": "Contact & Location", "display_order": 60},
        {"field_key": "state", "name": "State", "label": "State", "field_type": "state", "placeholder": "Select State", "is_required": False, "section_name": "Contact & Location", "display_order": 70},
        {"field_key": "district", "name": "District", "label": "District", "field_type": "city", "placeholder": "Select District", "is_required": False, "section_name": "Contact & Location", "display_order": 80},
        {"field_key": "address", "name": "Residential / Office Address", "label": "Residential / Office Address", "field_type": "textarea", "placeholder": "House/Chamber No., Street, Locality or Landmark", "is_required": False, "section_name": "Contact & Location", "display_order": 90},
        {"field_key": "pincode", "name": "Postal Code (PIN)", "label": "Postal Code (PIN)", "field_type": "pincode", "placeholder": "e.g. 110001", "is_required": False, "section_name": "Contact & Location", "display_order": 100},
    ]

    for item in standard_fields:
        cf, _ = CommonField.objects.get_or_create(
            field_key=item["field_key"],
            defaults={
                "name": item["name"],
                "label": item["label"],
                "field_type": item["field_type"],
                "placeholder": item.get("placeholder", ""),
                "options": item.get("options", []),
                "is_active": True,
            },
        )
        FormFieldConfig.objects.get_or_create(
            form=membership_form,
            common_field=cf,
            defaults={
                "section_name": item["section_name"],
                "display_order": item["display_order"],
                "is_required": item["is_required"],
                "is_visible": True,
            },
        )


def _prefetch_form_configuration(form: MembershipForm | None) -> dict:
    import uuid
    from apps.core.models import AdditionalOnboardingFormfields, CommonField, FormFieldConfig

    steps_list = []
    documents = []

    # Ensure standard common fields exist for membership onboarding and legacy fields removed
    try:
        _ensure_membership_common_fields()
    except Exception as e:
        import traceback
        traceback.print_exc()

    # 1. Fetch Dynamic Common Fields mapped in admin
    # The Admin screen at /admin/professional-onboarding/common-fields manages form_code=PROFESSIONAL
    prof_configs = list(
        FormFieldConfig.objects.filter(
            form__form_code=AdditionalOnboardingFormfields.FormCode.PROFESSIONAL,
            is_visible=True,
            common_field__is_active=True,
        )
        .exclude(common_field__field_key__in=["state_name", "city_name", "first_name", "last_name"])
        .select_related("common_field")
    )
    if not prof_configs:
        prof_configs = list(
            FormFieldConfig.objects.filter(
                form__form_code=AdditionalOnboardingFormfields.FormCode.MEMBERSHIP,
                is_visible=True,
                common_field__is_active=True,
            )
            .exclude(common_field__field_key__in=["state_name", "city_name", "first_name", "last_name"])
            .select_related("common_field")
        )

    # Sort so positive display_order comes first (10, 20, 30...), then 0/null display_order
    prof_configs.sort(
        key=lambda x: (
            999999 if (x.display_order is None or x.display_order == 0) else x.display_order,
            x.common_field.name if x.common_field else "",
        )
    )

    common_fields_data = []
    if prof_configs:
        for fc in prof_configs:
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
        active_cfs = CommonField.objects.filter(is_active=True).exclude(field_key__in=["state_name", "city_name", "first_name", "last_name"]).order_by("name")
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
            slug="common-fields",
            title="Personal Information",
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

        if not common_fields_data:
            for s in steps:
                if s.slug in ("declaration", "review"):
                    continue
                steps_list.append(s)
        else:
            common_keys = {c["field_key"] for c in common_fields_data} | {
                "full_name", "first_name", "last_name", "email", "email_address", "mobile", "mobile_number", "phone", "phone_number"
            }
            additional_fields = []
            for s in steps:
                if s.slug in ("declaration", "review", "personal", "contact", "personal_details", "personal-details", "common-details", "common-fields"):
                    continue
                active_fields = getattr(s, "active_fields", None)
                if active_fields is None:
                    active_fields = list(s.fields.filter(is_active=True))
                for f in active_fields:
                    if f.field_key in common_keys or f.field_key in ("declaration_accepted",):
                        continue
                    additional_fields.append(f)

            if additional_fields:
                additional_step = MembershipStep(
                    id=uuid.uuid4(),
                    slug="additional-fields",
                    title="Additional Fields",
                    subtitle="Additional details for membership application",
                    display_order=1,
                    is_required=False,
                    is_active=True,
                )
                additional_step.active_fields = additional_fields
                steps_list.append(additional_step)

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
