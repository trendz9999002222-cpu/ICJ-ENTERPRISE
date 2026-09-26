from rest_framework import serializers

from apps.membership_onboarding.models import (
    MembershipDocument,
    MembershipFieldOption,
    MembershipForm,
    MembershipStep,
    MembershipStepField,
    MembershipType,
)


class PublicMembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = ("id", "name", "slug", "description", "display_order")


class PublicMembershipFieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipFieldOption
        fields = ("id", "value", "label", "display_order", "is_active")


class PublicMembershipStepFieldSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    required = serializers.BooleanField(source="is_required")

    class Meta:
        model = MembershipStepField
        fields = (
            "id",
            "field_key",
            "field_type",
            "label",
            "placeholder",
            "help_text",
            "description",
            "default_value",
            "validation_config",
            "required",
            "display_order",
            "options",
        )

    def get_options(self, obj):
        if obj.field_type not in ("select", "searchable_dropdown", "radio", "checkbox", "multi_select"):
            return []
        opts = getattr(obj, "active_options", None)
        if opts is None:
            opts = obj.options.filter(is_active=True).order_by("display_order", "label")
        return PublicMembershipFieldOptionSerializer(opts, many=True).data


class PublicMembershipStepSerializer(serializers.ModelSerializer):
    step_fields = serializers.SerializerMethodField()

    class Meta:
        model = MembershipStep
        fields = ("id", "slug", "title", "subtitle", "description", "display_order", "is_required", "step_fields")

    def get_step_fields(self, obj):
        fields = getattr(obj, "active_fields", None)
        if fields is None:
            fields = obj.fields.filter(is_active=True).order_by("display_order", "name")
        return PublicMembershipStepFieldSerializer(fields, many=True).data


class PublicMembershipDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipDocument
        fields = (
            "id",
            "name",
            "document_key",
            "document_type",
            "is_required",
            "allowed_extensions",
            "max_file_size_mb",
            "display_order",
            "instructions",
        )


class PublicMembershipFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipForm
        fields = ("id", "title", "version", "is_active")


class PublicMembershipConfigurationSerializer(serializers.Serializer):
    membership_type = PublicMembershipTypeSerializer()
    form = PublicMembershipFormSerializer(allow_null=True)
    steps = PublicMembershipStepSerializer(many=True)
    documents = PublicMembershipDocumentSerializer(many=True)
