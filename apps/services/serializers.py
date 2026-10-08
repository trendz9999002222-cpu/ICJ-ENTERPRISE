from rest_framework import serializers

from apps.services.models import ServiceCategory, JusticeService, AssistanceRequest, LegalCase


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


class AssistanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistanceRequest
        fields = '__all__'
        read_only_fields = ('id', 'reference_id', 'created_at', 'updated_at', 'status')


class LegalCaseSerializer(serializers.ModelSerializer):
    assistance_request_details = AssistanceRequestSerializer(source='assistance_request', read_only=True)
    professional_name = serializers.CharField(source='professional.get_full_name', read_only=True)
    professional_group_name = serializers.CharField(source='professional_group.name', read_only=True)

    class Meta:
        model = LegalCase
        fields = '__all__'
        read_only_fields = ('id', 'case_id', 'created_at', 'updated_at')
