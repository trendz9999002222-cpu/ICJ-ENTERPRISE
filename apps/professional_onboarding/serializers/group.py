from rest_framework import serializers

from apps.professional_onboarding.models import Group
from apps.professional_onboarding.serializers.theme_mixins import GroupThemeListMixin


class GroupSerializer(GroupThemeListMixin, serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Group
        fields = (
            "id",
            "category",
            "category_name",
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
