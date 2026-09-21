import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.professional_onboarding.models import VisualTheme

BASE = "/api/v1/admin/professional-onboarding"
STRONG = "AdminPass123!@"

THEME_PAYLOAD = {
    "primary_color": "#7C3AED",
    "secondary_color": "#5B21B6",
    "accent_color": "#8B5CF6",
    "background_color": "#FAF5FF",
    "text_color": "#1E1B4B",
    "border_color": "#DDD6FE",
    "icon_color": "#7C3AED",
}


@pytest.fixture
def admin_client(db):
    user = User.objects.create_user(
        email="theme-admin@example.com",
        username="theme-admin",
        password=STRONG,
        role=User.Role.ADMIN,
        is_staff=True,
        is_active=True,
        password_change_required=False,
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def hierarchy(db):
    from apps.professional_onboarding.models import Category, Group, Profession

    category = Category.objects.create(name="Legal", slug="legal-theme")
    group = Group.objects.create(category=category, name="Court", slug="court")
    profession = Profession.objects.create(group=group, name="Advocate", slug="advocate-theme")
    return category, group, profession


@pytest.mark.django_db
class TestVisualThemeAPI:
    def test_category_theme_upsert_and_reset(self, admin_client, hierarchy):
        category, _, _ = hierarchy
        r = admin_client.patch(f"{BASE}/categories/{category.id}/theme/", THEME_PAYLOAD, format="json")
        assert r.status_code == status.HTTP_200_OK
        assert r.data["data"]["primary_color"] == "#7C3AED"
        assert r.data["data"]["resolved"]["primary_color"] == "#7C3AED"
        assert VisualTheme.objects.filter(category=category).exists()

        r = admin_client.delete(f"{BASE}/categories/{category.id}/theme/")
        assert r.status_code == status.HTTP_200_OK
        assert not VisualTheme.objects.filter(category=category).exists()

    def test_group_inherits_category_theme(self, admin_client, hierarchy):
        category, group, _ = hierarchy
        admin_client.patch(f"{BASE}/categories/{category.id}/theme/", THEME_PAYLOAD, format="json")

        r = admin_client.get(f"{BASE}/groups/{group.id}/theme/")
        assert r.status_code == status.HTTP_200_OK
        assert r.data["data"]["use_parent_theme"] is True
        assert r.data["data"]["resolved"]["primary_color"] == "#7C3AED"

        custom = {**THEME_PAYLOAD, "primary_color": "#16A34A", "use_parent_theme": False}
        admin_client.patch(f"{BASE}/groups/{group.id}/theme/", custom, format="json")
        r = admin_client.get(f"{BASE}/groups/{group.id}/theme/")
        assert r.data["data"]["resolved"]["primary_color"] == "#16A34A"

    def test_profession_resolved_endpoint(self, admin_client, hierarchy):
        category, group, profession = hierarchy
        admin_client.patch(
            f"{BASE}/professions/{profession.id}/theme/",
            {"use_parent_theme": True},
            format="json",
        )
        r = admin_client.get(f"{BASE}/professions/{profession.id}/theme/resolved/")
        assert r.status_code == status.HTTP_200_OK
        assert "resolved" in r.data["data"]
