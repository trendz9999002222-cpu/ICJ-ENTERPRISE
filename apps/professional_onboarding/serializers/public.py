from rest_framework import serializers

from apps.professional_onboarding.models import (
    Category,
    CommonField,
    Document,
    FieldOption,
    Group,
    Profession,
    ProfessionDocument,
    ProfessionField,
)
from apps.professional_onboarding.services.theme import (
    resolve_category_theme,
    resolve_group_theme,
    resolve_profession_theme,
)


def _theme_payload(colors: dict) -> dict:
    return {
        "color": colors["primary_color"],
        "bg": colors["background_color"],
        "border": colors["border_color"],
    }


class PublicCategorySerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="name")
    theme = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "title", "description", "slug", "display_order", "theme")

    def get_theme(self, obj) -> dict:
        colors, _ = resolve_category_theme(obj)
        return _theme_payload(colors)


class PublicGroupSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="name")
    theme = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ("id", "title", "description", "slug", "display_order", "theme")

    def get_theme(self, obj) -> dict:
        colors, _ = resolve_group_theme(obj)
        return _theme_payload(colors)


class PublicProfessionSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="name")
    theme = serializers.SerializerMethodField()

    class Meta:
        model = Profession
        fields = ("id", "title", "description", "slug", "display_order", "theme")

    def get_theme(self, obj) -> dict:
        colors, _ = resolve_profession_theme(obj)
        return _theme_payload(colors)


class PublicFieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOption
        fields = ("value", "label", "display_order")


class PublicCommonFieldSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    field_key = serializers.CharField(source="common_field.field_key")
    field_type = serializers.CharField(source="common_field.field_type")
    label = serializers.SerializerMethodField()
    placeholder = serializers.SerializerMethodField()
    help_text = serializers.SerializerMethodField()

    class Meta:
        from apps.core.models import FormFieldConfig
        model = FormFieldConfig
        fields = (
            "id",
            "field_key",
            "field_type",
            "label",
            "placeholder",
            "help_text",
            "is_required",
            "display_order",
            "options",
        )

    def get_label(self, obj):
        return obj.label_override or obj.common_field.label

    def get_placeholder(self, obj):
        return obj.placeholder_override or obj.common_field.placeholder

    def get_help_text(self, obj):
        return obj.help_text_override or obj.common_field.help_text

    def get_options(self, obj):
        if obj.common_field.field_type not in ("select", "radio", "checkbox"):
            return []
        # Return JSON options directly from the new common_field structure
        return obj.common_field.options


class PublicProfessionFieldSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionField
        fields = (
            "id",
            "field_key",
            "field_type",
            "label",
            "placeholder",
            "help_text",
            "is_required",
            "display_order",
            "options",
        )

    def get_options(self, obj):
        if obj.field_type not in ("select", "radio", "checkbox"):
            return []
        opts = getattr(obj, "active_options", None)
        if opts is None:
            opts = FieldOption.objects.filter(profession_field=obj, is_active=True).order_by("display_order", "label")
        return PublicFieldOptionSerializer(opts, many=True).data


class PublicProfessionDocumentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="document.name")
    document_key = serializers.CharField(source="document.document_key")
    allowed_file_types = serializers.ListField(source="document.allowed_file_types")
    max_file_size_mb = serializers.IntegerField(source="document.max_file_size_mb")
    instructions = serializers.CharField(allow_blank=True)

    class Meta:
        model = ProfessionDocument
        fields = (
            "id",
            "name",
            "document_key",
            "is_required",
            "display_order",
            "instructions",
            "allowed_file_types",
            "max_file_size_mb",
        )
