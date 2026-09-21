from rest_framework import serializers

from apps.professional_onboarding.models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = (
            "id",
            "name",
            "document_key",
            "description",
            "allowed_file_types",
            "max_file_size_mb",
            "is_active",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
