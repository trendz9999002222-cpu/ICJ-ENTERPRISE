from rest_framework import serializers

from apps.core.models import CommonField


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
            "default_value",
            "validation_rules",
            "options",
            "is_system_field",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "is_system_field", "created_at", "updated_at")
