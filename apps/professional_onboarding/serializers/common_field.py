from rest_framework import serializers

from apps.professional_onboarding.models import CommonField


class CommonFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonField
        fields = (
            "id",
            "name",
            "field_key",
            "field_type",
            "label",
            "placeholder",
            "help_text",
            "description",
            "is_required",
            "is_active",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
