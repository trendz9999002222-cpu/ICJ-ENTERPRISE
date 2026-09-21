from rest_framework import serializers

from apps.professional_onboarding.models import FieldOption


class FieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOption
        fields = (
            "id",
            "common_field",
            "profession_field",
            "value",
            "label",
            "display_order",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        common = attrs.get("common_field", getattr(self.instance, "common_field", None))
        profession = attrs.get("profession_field", getattr(self.instance, "profession_field", None))
        if bool(common) == bool(profession):
            raise serializers.ValidationError(
                "Provide exactly one of common_field or profession_field."
            )
        return attrs
