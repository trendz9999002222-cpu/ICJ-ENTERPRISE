from __future__ import annotations

from typing import Any, Literal

from apps.professional_onboarding.models import Category, Group, Profession, VisualTheme

ResolvedSource = Literal["default", "category", "group", "profession", "custom"]

DEFAULT_THEME_COLORS: dict[str, str] = {
    "primary_color": "#2563EB",
    "secondary_color": "#1E40AF",
    "accent_color": "#3B82F6",
    "background_color": "#F8FAFC",
    "text_color": "#0F172A",
    "border_color": "#E2E8F0",
    "icon_color": "#2563EB",
}


def default_theme_colors() -> dict[str, str]:
    return dict(DEFAULT_THEME_COLORS)


def theme_record_to_colors(theme: VisualTheme) -> dict[str, str]:
    return {
        "primary_color": theme.primary_color,
        "secondary_color": theme.secondary_color,
        "accent_color": theme.accent_color,
        "background_color": theme.background_color,
        "text_color": theme.text_color,
        "border_color": theme.border_color or DEFAULT_THEME_COLORS["border_color"],
        "icon_color": theme.icon_color or theme.primary_color,
    }


def resolve_category_theme(category: Category) -> tuple[dict[str, str], ResolvedSource]:
    theme = getattr(category, "visual_theme", None)
    if theme and not theme.use_parent_theme:
        return theme_record_to_colors(theme), "custom"
    return default_theme_colors(), "default"


def resolve_group_theme(group: Group) -> tuple[dict[str, str], ResolvedSource]:
    theme = getattr(group, "visual_theme", None)
    if theme:
        if theme.use_parent_theme:
            colors, source = resolve_category_theme(group.category)
            return colors, "category" if source != "default" else "category"
        return theme_record_to_colors(theme), "custom"
    return resolve_category_theme(group.category)


def resolve_profession_theme(profession: Profession) -> tuple[dict[str, str], ResolvedSource]:
    theme = getattr(profession, "visual_theme", None)
    if theme:
        if theme.use_parent_theme:
            colors, _ = resolve_group_theme(profession.group)
            return colors, "group"
        return theme_record_to_colors(theme), "custom"
    return resolve_group_theme(profession.group)


def build_theme_api_payload(
    *,
    owner_kind: Literal["category", "group", "profession"],
    owner: Category | Group | Profession,
) -> dict[str, Any]:
    if owner_kind == "category":
        resolved, resolved_source = resolve_category_theme(owner)
        theme = getattr(owner, "visual_theme", None)
    elif owner_kind == "group":
        resolved, resolved_source = resolve_group_theme(owner)
        theme = getattr(owner, "visual_theme", None)
    else:
        resolved, resolved_source = resolve_profession_theme(owner)
        theme = getattr(owner, "visual_theme", None)

    is_configured = theme is not None
    if theme:
        owned_colors = theme_record_to_colors(theme)
        use_parent = bool(theme.use_parent_theme)
    else:
        owned_colors = default_theme_colors()
        use_parent = owner_kind != "category"

    return {
        "is_configured": is_configured,
        "use_parent_theme": use_parent if owner_kind != "category" else False,
        "primary_color": owned_colors["primary_color"],
        "secondary_color": owned_colors["secondary_color"],
        "accent_color": owned_colors["accent_color"],
        "background_color": owned_colors["background_color"],
        "text_color": owned_colors["text_color"],
        "border_color": owned_colors["border_color"],
        "icon_color": owned_colors["icon_color"],
        "resolved": resolved,
        "resolved_source": resolved_source,
    }


def upsert_visual_theme(
    *,
    owner_kind: Literal["category", "group", "profession"],
    owner: Category | Group | Profession,
    data: dict[str, Any],
) -> VisualTheme:
    lookup: dict[str, Category | Group | Profession]
    if owner_kind == "category":
        lookup = {"category": owner}
        data = {**data, "use_parent_theme": False}
    elif owner_kind == "group":
        lookup = {"group": owner}
    else:
        lookup = {"profession": owner}

    theme = VisualTheme.objects.filter(**lookup).first()
    if not theme:
        theme = VisualTheme(**lookup)

    for field in (
        "use_parent_theme",
        "primary_color",
        "secondary_color",
        "accent_color",
        "background_color",
        "text_color",
        "border_color",
        "icon_color",
    ):
        if field in data:
            setattr(theme, field, data[field])

    if not theme.border_color:
        theme.border_color = ""
    if not theme.icon_color:
        theme.icon_color = ""

    from apps.professional_onboarding.services.crud import save_instance

    return save_instance(theme)
