from rest_framework import serializers

from apps.professional_onboarding.models import VisualTheme
from apps.professional_onboarding.services.theme import default_theme_colors

HEX_RE = r"^#[0-9A-Fa-f]{6}$"


class VisualThemeWriteSerializer(serializers.Serializer):
    use_parent_theme = serializers.BooleanField(required=False, default=False)
    primary_color = serializers.RegexField(HEX_RE, required=False)
    secondary_color = serializers.RegexField(HEX_RE, required=False)
    accent_color = serializers.RegexField(HEX_RE, required=False)
    background_color = serializers.RegexField(HEX_RE, required=False)
    text_color = serializers.RegexField(HEX_RE, required=False)
    border_color = serializers.RegexField(HEX_RE, required=False, allow_blank=True)
    icon_color = serializers.RegexField(HEX_RE, required=False, allow_blank=True)

    def validate(self, attrs):
        defaults = default_theme_colors()
        for key, value in defaults.items():
            if key not in attrs or attrs.get(key) in (None, ""):
                if key in ("border_color", "icon_color"):
                    attrs[key] = value if key == "border_color" else defaults["icon_color"]
                else:
                    attrs[key] = value
        return attrs


class VisualThemeModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisualTheme
        fields = (
            "id",
            "use_parent_theme",
            "primary_color",
            "secondary_color",
            "accent_color",
            "background_color",
            "text_color",
            "border_color",
            "icon_color",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
