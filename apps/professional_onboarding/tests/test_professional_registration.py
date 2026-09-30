import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient

from apps.professional_onboarding.models import (
    Category,
    CommonField,
    Group,
    Profession,
    ProfessionalRegistrationSubmission,
)

BASE = "/api/v1/professional-onboarding"


@pytest.fixture
def catalog(db):
    category = Category.objects.create(name="Legal", slug="legal-reg", is_active=True)
    group = Group.objects.create(category=category, name="Advocates", slug="advocates-reg", is_active=True)
    profession = Profession.objects.create(
        group=group, name="Advocate", slug="advocate-reg", is_active=True
    )
    CommonField.objects.create(
        name="Full Name",
        field_key="full_name",
        field_type="text",
        label="Full Name",
        is_required=True,
        is_active=True,
    )
    CommonField.objects.create(
        name="Email",
        field_key="email",
        field_type="email",
        label="Email",
        is_required=True,
        is_active=True,
    )
    return category, group, profession


def _submit_payload(category, group, profession):
    return {
        "category_ids": f'["{category.id}"]',
        "group_ids": f'["{group.id}"]',
        "profession_ids": f'["{profession.id}"]',
        "common_field_values": '{"full_name": "Jane Doe", "email": "jane.doe@example.com"}',
        "profession_field_values": "{}",
        "new_password": "SecurePass123!@#",
        "confirm_password": "SecurePass123!@#",
    }


@pytest.mark.django_db
def test_single_submission_creates_one_row(catalog):
    category, group, profession = catalog
    client = APIClient()
    r = client.post(f"{BASE}/register/", _submit_payload(category, group, profession))
    assert r.status_code == status.HTTP_201_CREATED
    assert r.data["success"] is True
    ref = r.data["data"]["reference_id"]
    assert ref.startswith("PRO-")
    assert ProfessionalRegistrationSubmission.objects.count() == 1
    row = ProfessionalRegistrationSubmission.objects.get()
    assert row.reference_id == ref
    assert row.selected_profession_ids == [str(profession.id)]


@pytest.mark.django_db
def test_idempotency_key_prevents_duplicate(catalog):
    from apps.accounts.models import User

    category, group, profession = catalog
    user = User.objects.create_user(username="u1", email="u1@test.com", password="pass12345!")
    client = APIClient()
    client.force_authenticate(user=user)
    payload = _submit_payload(category, group, profession)
    headers = {"HTTP_IDEMPOTENCY_KEY": "test-key-1"}
    r1 = client.post(f"{BASE}/register/", payload, **headers)
    r2 = client.post(f"{BASE}/register/", payload, **headers)
    assert r1.status_code == status.HTTP_201_CREATED
    assert r2.status_code == status.HTTP_201_CREATED
    assert r1.data["data"]["reference_id"] == r2.data["data"]["reference_id"]
    assert ProfessionalRegistrationSubmission.objects.count() == 1
