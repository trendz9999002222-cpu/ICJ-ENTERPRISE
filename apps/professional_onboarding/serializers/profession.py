from rest_framework import serializers

from apps.professional_onboarding.models import Profession
from apps.professional_onboarding.serializers.theme_mixins import ProfessionThemeListMixin


class ProfessionSerializer(ProfessionThemeListMixin, serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True)
    category_id = serializers.UUIDField(source="group.category_id", read_only=True)

    class Meta:
        model = Profession
        fields = (
            "id",
            "group",
            "group_name",
            "category_id",
            "name",
            "slug",
            "description",
            "is_active",
            "display_order",
            "theme_primary_color",
            "theme_is_custom",
            "theme_use_parent_theme",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
