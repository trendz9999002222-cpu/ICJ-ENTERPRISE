from rest_framework import serializers

from apps.professional_onboarding.models import Category
from apps.professional_onboarding.serializers.theme_mixins import CategoryThemeListMixin


class CategorySerializer(CategoryThemeListMixin, serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "is_active",
            "display_order",
            "theme_primary_color",
            "theme_is_custom",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
