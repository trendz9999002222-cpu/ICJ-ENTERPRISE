from rest_framework import serializers

from apps.professional_onboarding.models import ProfessionField


class ProfessionFieldSerializer(serializers.ModelSerializer):
    profession_name = serializers.CharField(source="profession.name", read_only=True)

    class Meta:
        model = ProfessionField
        fields = (
            "id",
            "profession",
            "profession_name",
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
