from __future__ import annotations

from django.db.models import Prefetch

from apps.professional_onboarding.models import (
    CommonField,
    FieldOption,
    Profession,
    ProfessionDocument,
    ProfessionField,
)
from apps.professional_onboarding.services.theme import resolve_profession_theme

from apps.core.models import AdditionalOnboardingFormfields, FormFieldConfig

def build_profession_configuration(profession: Profession) -> dict:
    profession = (
        Profession.objects.select_related(
            "group",
            "group__category",
            "group__visual_theme",
            "group__category__visual_theme",
            "visual_theme",
        )
        .get(pk=profession.pk)
    )

    common_fields = (
        FormFieldConfig.objects.filter(
            form__form_code=AdditionalOnboardingFormfields.FormCode.PROFESSIONAL,
            is_visible=True,
            common_field__is_active=True,
        )
        .select_related("common_field")
        .order_by("display_order", "common_field__name")
    )
    if not common_fields.exists():
        from apps.professional_onboarding.models import CommonField as LegacyCommonField
        from apps.core.models import CommonField as CoreCommonField
        legacy_cfs = list(LegacyCommonField.objects.filter(is_active=True).order_by("display_order", "name"))
        if legacy_cfs:
            form_obj, _ = AdditionalOnboardingFormfields.objects.get_or_create(
                form_code=AdditionalOnboardingFormfields.FormCode.PROFESSIONAL,
                defaults={"form_name": "Professional Onboarding"}
            )
            for lcf in legacy_cfs:
                core_cf, _ = CoreCommonField.objects.get_or_create(
                    field_key=lcf.field_key,
                    defaults={
                        "name": lcf.name,
                        "label": lcf.label,
                        "field_type": lcf.field_type,
                        "placeholder": lcf.placeholder or "",
                        "help_text": lcf.help_text or "",
                        "is_active": True,
                    }
                )
                FormFieldConfig.objects.get_or_create(
                    form=form_obj,
                    common_field=core_cf,
                    defaults={
                        "is_visible": True,
                        "is_required": lcf.is_required,
                        "display_order": lcf.display_order,
                    }
                )
            common_fields = FormFieldConfig.objects.filter(
                form=form_obj,
                is_visible=True,
                common_field__is_active=True,
            ).select_related("common_field").order_by("display_order", "common_field__name")

    profession_fields = (
        ProfessionField.objects.filter(profession=profession, is_active=True)
        .prefetch_related(
            Prefetch(
                "options",
                queryset=FieldOption.objects.filter(is_active=True).order_by("display_order", "label"),
                to_attr="active_options",
            )
        )
        .order_by("display_order", "name")
    )

    documents = (
        ProfessionDocument.objects.filter(profession=profession, is_active=True)
        .select_related("document")
        .order_by("display_order", "document__name")
    )

    colors, resolved_source = resolve_profession_theme(profession)

    return {
        "profession": {
            "id": str(profession.id),
            "name": profession.name,
            "description": profession.description,
        },
        "group": {
            "id": str(profession.group_id),
            "name": profession.group.name,
        },
        "category": {
            "id": str(profession.group.category_id),
            "name": profession.group.category.name,
        },
        "theme": {
            "resolved": colors,
            "resolved_source": resolved_source,
        },
        "common_fields": common_fields,
        "profession_fields": profession_fields,
        "documents": documents,
    }
