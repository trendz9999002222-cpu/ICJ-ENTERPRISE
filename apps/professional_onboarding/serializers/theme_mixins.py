from rest_framework import serializers

from apps.professional_onboarding.services.theme import (
    resolve_category_theme,
    resolve_group_theme,
    resolve_profession_theme,
)


class CategoryThemeListMixin(serializers.Serializer):
    theme_primary_color = serializers.SerializerMethodField()
    theme_is_custom = serializers.SerializerMethodField()

    def get_theme_primary_color(self, obj) -> str:
        colors, _ = resolve_category_theme(obj)
        return colors["primary_color"]

    def get_theme_is_custom(self, obj) -> bool:
        theme = getattr(obj, "visual_theme", None)
        return theme is not None and not theme.use_parent_theme


class GroupThemeListMixin(serializers.Serializer):
    theme_primary_color = serializers.SerializerMethodField()
    theme_is_custom = serializers.SerializerMethodField()
    theme_use_parent_theme = serializers.SerializerMethodField()

    def get_theme_primary_color(self, obj) -> str:
        colors, _ = resolve_group_theme(obj)
        return colors["primary_color"]

    def get_theme_is_custom(self, obj) -> bool:
        theme = getattr(obj, "visual_theme", None)
        return theme is not None and not theme.use_parent_theme

    def get_theme_use_parent_theme(self, obj) -> bool:
        theme = getattr(obj, "visual_theme", None)
        if theme:
            return theme.use_parent_theme
        return True


class ProfessionThemeListMixin(serializers.Serializer):
    theme_primary_color = serializers.SerializerMethodField()
    theme_is_custom = serializers.SerializerMethodField()
    theme_use_parent_theme = serializers.SerializerMethodField()

    def get_theme_primary_color(self, obj) -> str:
        colors, _ = resolve_profession_theme(obj)
        return colors["primary_color"]

    def get_theme_is_custom(self, obj) -> bool:
        theme = getattr(obj, "visual_theme", None)
        return theme is not None and not theme.use_parent_theme

    def get_theme_use_parent_theme(self, obj) -> bool:
        theme = getattr(obj, "visual_theme", None)
        if theme:
            return theme.use_parent_theme
        return True
