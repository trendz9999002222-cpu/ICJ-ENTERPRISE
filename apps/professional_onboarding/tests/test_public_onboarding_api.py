import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.professional_onboarding.models import Category, CommonField, Group, Profession

BASE = "/api/v1/professional-onboarding"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def catalog(db):
    category = Category.objects.create(name="Legal", slug="legal-public", is_active=True)
    group = Group.objects.create(category=category, name="Court", slug="court", is_active=True)
    profession = Profession.objects.create(group=group, name="Advocate", slug="advocate-public", is_active=True)
    CommonField.objects.create(
        name="Full Name",
        field_key="full_name",
        field_type="text",
        label="Full Name",
        is_required=True,
        is_active=True,
    )
    return category, group, profession


@pytest.mark.django_db
def test_public_categories_no_auth(api_client, catalog):
    r = api_client.get(f"{BASE}/categories/")
    assert r.status_code == status.HTTP_200_OK
    assert r.data["success"] is True
    assert len(r.data["data"]["results"]) >= 1


@pytest.mark.django_db
def test_public_configuration(api_client, catalog):
    _, group, profession = catalog
    r = api_client.get(f"{BASE}/professions/{profession.id}/configuration/")
    assert r.status_code == status.HTTP_200_OK
    assert "common_fields" in r.data["data"]
    r2 = api_client.get(f"{BASE}/groups/{group.id}/professions/")
    assert r2.status_code == status.HTTP_200_OK
