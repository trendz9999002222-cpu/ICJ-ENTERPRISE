from rest_framework import serializers

from apps.core.models import AdditionalOnboardingFormfields, FormFieldConfig
from .common_field import CommonFieldSerializer


class FormFieldConfigSerializer(serializers.ModelSerializer):
    common_field_details = CommonFieldSerializer(source="common_field", read_only=True)
    form = serializers.SlugRelatedField(
        slug_field="form_code",
        queryset=AdditionalOnboardingFormfields.objects.all(),
    )

    def to_internal_value(self, data):
        form_code = data.get("form")
        if form_code and isinstance(form_code, str):
            form_code_clean = form_code.strip()
            valid_codes = dict(AdditionalOnboardingFormfields.FormCode.choices)
            if form_code_clean in valid_codes:
                AdditionalOnboardingFormfields.objects.get_or_create(
                    form_code=form_code_clean,
                    defaults={
                        "form_name": valid_codes[form_code_clean],
                        "description": f"Onboarding flow for {valid_codes[form_code_clean]}."
                    }
                )
        return super().to_internal_value(data)
    
    class Meta:
        model = FormFieldConfig
        fields = (
            "id",
            "form",
            "common_field",
            "common_field_details",
            "section_name",
            "display_order",
            "is_visible",
            "is_required",
            "label_override",
            "placeholder_override",
            "help_text_override",
            "validation_overrides",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
