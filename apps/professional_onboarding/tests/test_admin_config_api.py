import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
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

BASE = "/api/v1/admin/professional-onboarding"
STRONG = "AdminPass123!@"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email="admin@example.com",
        username="admin",
        password=STRONG,
        role=User.Role.ADMIN,
        is_staff=True,
        is_active=True,
        password_change_required=False,
    )


@pytest.fixture
def member_user(db):
    return User.objects.create_user(
        email="member@example.com",
        username="member",
        password=STRONG,
        role=User.Role.MEMBER,
        is_active=True,
        password_change_required=False,
    )


@pytest.fixture
def admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def category(db):
    return Category.objects.create(name="Legal", slug="legal", display_order=1)


@pytest.fixture
def group(category):
    return Group.objects.create(category=category, name="Advocacy", slug="advocacy", display_order=1)


@pytest.fixture
def profession(group):
    return Profession.objects.create(group=group, name="Advocate", slug="advocate", display_order=1)


@pytest.mark.django_db
class TestAuthorization:
    def test_unauthenticated_denied(self, api_client):
        r = api_client.get(f"{BASE}/categories/")
        assert r.status_code == status.HTTP_401_UNAUTHORIZED

    def test_non_admin_denied(self, api_client, member_user):
        api_client.force_authenticate(user=member_user)
        r = api_client.get(f"{BASE}/categories/")
        assert r.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestCategoryAPI:
    def test_create_list_search_pagination(self, admin_client):
        create = admin_client.post(
            f"{BASE}/categories/",
            {"name": "Healthcare", "slug": "healthcare", "display_order": 2},
            format="json",
        )
        assert create.status_code == status.HTTP_201_CREATED
        assert create.json()["success"] is True

        listing = admin_client.get(f"{BASE}/categories/?search=health&page_size=10")
        assert listing.status_code == status.HTTP_200_OK
        data = listing.json()["data"]
        assert data["count"] >= 1
        assert "results" in data

    def test_category_crud(self, admin_client, category):
        detail = admin_client.get(f"{BASE}/categories/{category.id}/")
        assert detail.status_code == status.HTTP_200_OK

        patch = admin_client.patch(
            f"{BASE}/categories/{category.id}/",
            {"description": "Updated"},
            format="json",
        )
        assert patch.status_code == status.HTTP_200_OK
        category.refresh_from_db()
        assert category.description == "Updated"


@pytest.mark.django_db
class TestHierarchyAPI:
    def test_nested_group_and_profession(self, admin_client, category):
        g = admin_client.post(
            f"{BASE}/categories/{category.id}/groups/",
            {"name": "ADR", "slug": "adr"},
            format="json",
        )
        assert g.status_code == status.HTTP_201_CREATED
        group_id = g.json()["data"]["id"]

        p = admin_client.post(
            f"{BASE}/groups/{group_id}/professions/",
            {"name": "Mediator", "slug": "mediator"},
            format="json",
        )
        assert p.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
class TestCommonFieldAndOptions:
    def test_common_field_option_for_select(self, admin_client):
        field = admin_client.post(
            f"{BASE}/common-fields/",
            {
                "name": "Gender",
                "field_key": "gender",
                "field_type": "select",
                "label": "Gender",
                "is_required": True,
            },
            format="json",
        )
        assert field.status_code == status.HTTP_201_CREATED
        field_id = field.json()["data"]["id"]

        opt = admin_client.post(
            f"{BASE}/common-fields/{field_id}/options/",
            {"value": "male", "label": "Male", "display_order": 1},
            format="json",
        )
        assert opt.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
class TestProfessionFieldAndDocuments:
    def test_profession_field_and_document_assignment(self, admin_client, profession):
        pf = admin_client.post(
            f"{BASE}/professions/{profession.id}/fields/",
            {
                "name": "Bar Number",
                "field_key": "bar_number",
                "field_type": "text",
                "label": "Bar Council Number",
            },
            format="json",
        )
        assert pf.status_code == status.HTTP_201_CREATED

        doc = admin_client.post(
            f"{BASE}/documents/",
            {
                "name": "Identity Proof",
                "document_key": "identity_proof",
                "allowed_file_types": ["pdf", "image/jpeg"],
                "max_file_size_mb": 5,
            },
            format="json",
        )
        assert doc.status_code == status.HTTP_201_CREATED
        doc_id = doc.json()["data"]["id"]

        link = admin_client.post(
            f"{BASE}/professions/{profession.id}/documents/",
            {"document": doc_id, "is_required": True, "instructions": "Upload clear scan."},
            format="json",
        )
        assert link.status_code == status.HTTP_201_CREATED

        dup = admin_client.post(
            f"{BASE}/professions/{profession.id}/documents/",
            {"document": doc_id, "is_required": False},
            format="json",
        )
        assert dup.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestFieldOptionValidation:
    def test_option_rejected_for_text_field(self, admin_client):
        field = CommonField.objects.create(
            name="Full Name",
            field_key="full_name",
            field_type="text",
            label="Full Name",
        )
        r = admin_client.post(
            f"{BASE}/common-fields/{field.id}/options/",
            {"value": "x", "label": "X"},
            format="json",
        )
        assert r.status_code == status.HTTP_400_BAD_REQUEST
