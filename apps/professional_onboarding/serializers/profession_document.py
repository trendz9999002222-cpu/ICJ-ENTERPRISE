from rest_framework import serializers

from apps.professional_onboarding.models import ProfessionDocument


class ProfessionDocumentSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source="document.name", read_only=True)
    document_key = serializers.CharField(source="document.document_key", read_only=True)
    profession_name = serializers.CharField(source="profession.name", read_only=True)

    class Meta:
        model = ProfessionDocument
        fields = (
            "id",
            "profession",
            "profession_name",
            "document",
            "document_name",
            "document_key",
            "is_required",
            "is_active",
            "display_order",
            "instructions",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
