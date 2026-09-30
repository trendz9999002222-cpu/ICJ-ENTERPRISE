import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.membership_onboarding.models import MembershipForm, MembershipStep, MembershipStepField, MembershipType


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def configured_type(db):
    mtype = MembershipType.objects.create(name="Test", slug="test-type", is_active=True)
    form = MembershipForm.objects.create(membership_type=mtype, title="Form", version=1, is_active=True)
    step = MembershipStep.objects.create(form=form, name="Personal", slug="personal", title="Personal", display_order=1)
    MembershipStepField.objects.create(
        step=step,
        name="Full Name",
        field_key="full_name",
        field_type=MembershipStepField.FieldType.TEXT,
        label="Full Name",
        is_required=True,
        display_order=1,
    )
    MembershipStepField.objects.create(
        step=step,
        name="Email",
        field_key="email",
        field_type=MembershipStepField.FieldType.EMAIL,
        label="Email",
        is_required=True,
        display_order=2,
    )
    return mtype


@pytest.mark.django_db
def test_public_types(api_client, configured_type):
    res = api_client.get("/api/v1/membership-onboarding/types/")
    assert res.status_code == status.HTTP_200_OK
    assert res.data["success"] is True


@pytest.mark.django_db
def test_public_configuration(api_client, configured_type):
    res = api_client.get(f"/api/v1/membership-onboarding/types/{configured_type.id}/configuration/")
    assert res.status_code == status.HTTP_200_OK
    assert len(res.data["data"]["steps"]) >= 1


@pytest.mark.django_db
def test_public_active_configuration(api_client, configured_type):
    res = api_client.get("/api/v1/membership-onboarding/configuration/")
    assert res.status_code == status.HTTP_200_OK
    assert len(res.data["data"]["steps"]) >= 1


@pytest.mark.django_db
def test_submit_without_type_id(api_client, configured_type):
    res = api_client.post(
        "/api/v1/membership-onboarding/register/",
        {
            "field_values": '{"full_name": "No Type", "email": "notype@example.com"}',
            "declaration_accepted": "true",
        },
        format="multipart",
    )
    assert res.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_submit_membership(api_client, configured_type):
    res = api_client.post(
        "/api/v1/membership-onboarding/register/",
        {
            "membership_type_id": str(configured_type.id),
            "field_values": '{"full_name": "Test User", "email": "test@example.com"}',
            "declaration_accepted": "true",
        },
        format="multipart",
    )
    assert res.status_code == status.HTTP_201_CREATED
    assert res.data["data"]["reference_id"].startswith("APP-")
