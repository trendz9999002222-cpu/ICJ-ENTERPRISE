from rest_framework import serializers

from apps.professional_onboarding.models import ProfessionField


class ProfessionFieldSerializer(serializers.ModelSerializer):
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    options = serializers.SerializerMethodField(read_only=True)

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
            "options",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def get_options(self, obj):
        if obj.field_type not in ("select", "radio", "checkbox"):
            return []
        opts = getattr(obj, "active_options", None)
        if opts is None:
            opts = obj.options.all().order_by("display_order", "label")
        return [
            {
                "id": str(o.id),
                "value": o.value,
                "label": o.label,
                "display_order": o.display_order,
                "is_active": o.is_active,
            }
            for o in opts
        ]

