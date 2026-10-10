from rest_framework import serializers

from apps.core.models.additional_onboarding_formfields import AdditionalOnboardingFormfields
from apps.core.models.form_field_config import FormFieldConfig
from apps.core.serializers.common_field import CommonFieldSerializer


class FormFieldConfigSerializer(serializers.ModelSerializer):
    common_field_details = CommonFieldSerializer(source="common_field", read_only=True)
    form = serializers.SlugRelatedField(
        slug_field="form_code",
        queryset=AdditionalOnboardingFormfields.objects.all(),
    )
    
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
