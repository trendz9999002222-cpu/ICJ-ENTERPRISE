import json
from rest_framework import serializers

from apps.accounts.models import (
    ProfessionalApplication,
    ApplicationDocument,
    ApplicationReviewHistory,
)


class ApplicationDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationDocument
        fields = [
            "id",
            "document_key",
            "document_title",
            "file_name",
            "file_size_bytes",
            "file_url",
            "uploaded_at",
        ]

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class ApplicationReviewHistorySerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationReviewHistory
        fields = ["id", "action", "actor_name", "note", "created_at"]

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.email
        return "System / Reviewer"


class ProfessionalApplicationDetailSerializer(serializers.ModelSerializer):
    documents = ApplicationDocumentSerializer(many=True, read_only=True)
    review_history = ApplicationReviewHistorySerializer(many=True, read_only=True)
    applicant_email = serializers.EmailField(source="user.email", read_only=True)
    applicant_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = ProfessionalApplication
        fields = [
            "id",
            "application_reference",
            "pathway",
            "category",
            "status",
            "personal_data",
            "professional_data",
            "category_data",
            "rejection_reason",
            "info_request_note",
            "applicant_name",
            "applicant_email",
            "documents",
            "review_history",
            "created_at",
            "updated_at",
        ]


class ProfessionalApplicationSubmitSerializer(serializers.Serializer):
    pathway = serializers.ChoiceField(choices=ProfessionalApplication.Pathway.choices)
    category = serializers.CharField(max_length=64)
    personal_data = serializers.JSONField(required=False, default=dict)
    professional_data = serializers.JSONField(required=False, default=dict)
    category_data = serializers.JSONField(required=False, default=dict)
    declaration_accepted = serializers.BooleanField(required=False, default=True)

    def validate_json_field(self, value, field_name):
        if isinstance(value, dict):
            return value
        if not value:
            return {}
        if isinstance(value, str):
            try:
                return json.loads(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"Invalid JSON string provided for {field_name}.")
        return value

    def validate(self, attrs):
        attrs["personal_data"] = self.validate_json_field(attrs.get("personal_data"), "personal_data")
        attrs["professional_data"] = self.validate_json_field(attrs.get("professional_data"), "professional_data")
        attrs["category_data"] = self.validate_json_field(attrs.get("category_data"), "category_data")
        return attrs
