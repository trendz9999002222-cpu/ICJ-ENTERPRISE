from rest_framework import serializers

from apps.services.models import ServiceCategory, JusticeService


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = (
            "id",
            "name",
            "slug",
            "value",
            "is_active",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")


class JusticeServiceSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="category.name", read_only=True)
    
    class Meta:
        model = JusticeService
        fields = (
            "id",
            "slug",
            "title",
            "short_description",
            "category",
            "category_label",
            "icon_name",
            "who_it_is_for",
            "how_icj_helps",
            "available_assistance",
            "next_steps",
            "related_professionals",
            "is_featured",
            "is_active",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "category_label", "created_at", "updated_at")
