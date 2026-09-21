import hashlib
import secrets
from datetime import timedelta

import pytest
from django.core import mail
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PasswordResetToken, User

STRONG = "AdminPass123!@"
NEW_STRONG = "NewAdminPass456!@"


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
    )


@pytest.fixture
def inactive_user(db):
    return User.objects.create_user(
        email="inactive@example.com",
        username="inactive",
        password=STRONG,
        role=User.Role.ADMIN,
        is_active=False,
    )


@pytest.mark.django_db
class TestLogin:
    def test_valid_credentials(self, api_client, admin_user):
        r = api_client.post("/api/v1/auth/login/", {"email": admin_user.email, "password": STRONG}, format="json")
        assert r.status_code == status.HTTP_200_OK
        body = r.json()
        assert body["success"] is True
        assert "access" in body and "refresh" in body
        assert body["user"]["role"] == User.Role.ADMIN

    def test_invalid_password(self, api_client, admin_user):
        r = api_client.post("/api/v1/auth/login/", {"email": admin_user.email, "password": "wrong"}, format="json")
        assert r.status_code == status.HTTP_401_UNAUTHORIZED
        assert "exist" not in r.json()["message"].lower()

    def test_invalid_email(self, api_client):
        r = api_client.post("/api/v1/auth/login/", {"email": "nope@example.com", "password": STRONG}, format="json")
        assert r.status_code == status.HTTP_401_UNAUTHORIZED

    def test_inactive_user(self, api_client, inactive_user):
        r = api_client.post(
            "/api/v1/auth/login/",
            {"email": inactive_user.email, "password": STRONG},
            format="json",
        )
        assert r.status_code == status.HTTP_401_UNAUTHORIZED

    def test_missing_fields(self, api_client):
        r = api_client.post("/api/v1/auth/login/", {}, format="json")
        assert r.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogout:
    def test_authenticated_logout_blacklists_refresh(self, api_client, admin_user):
        login = api_client.post("/api/v1/auth/login/", {"email": admin_user.email, "password": STRONG}, format="json")
        refresh = login.json()["refresh"]
        access = login.json()["access"]
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        out = api_client.post("/api/v1/auth/logout/", {"refresh": refresh}, format="json")
        assert out.status_code == status.HTTP_200_OK
        refresh_resp = api_client.post("/api/v1/auth/refresh/", {"refresh": refresh}, format="json")
        assert refresh_resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_requires_auth(self, api_client):
        r = api_client.post("/api/v1/auth/logout/", {"refresh": "invalid"}, format="json")
        assert r.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestForgotPassword:
    def test_generic_response_unknown_email(self, api_client):
        r = api_client.post("/api/v1/auth/forgot-password/", {"email": "unknown@example.com"}, format="json")
        assert r.status_code == status.HTTP_200_OK
        assert "account exists" in r.json()["message"].lower()

    def test_known_email_same_message_and_sends_mail(self, api_client, admin_user):
        mail.outbox = []
        r = api_client.post("/api/v1/auth/forgot-password/", {"email": admin_user.email}, format="json")
        assert r.status_code == status.HTTP_200_OK
        assert "account exists" in r.json()["message"].lower()
        assert len(mail.outbox) == 1
        assert PasswordResetToken.objects.filter(user=admin_user, used_at__isnull=True).exists()


@pytest.mark.django_db
class TestResetPassword:
    def _create_raw_token(self, user):
        raw = secrets.token_urlsafe(48)
        PasswordResetToken.objects.create(
            user=user,
            token_hash=hashlib.sha256(raw.encode()).hexdigest(),
            expires_at=timezone.now() + timedelta(hours=1),
        )
        return raw

    def test_valid_token_changes_password(self, api_client, admin_user):
        raw = self._create_raw_token(admin_user)
        old_hash = admin_user.password
        r = api_client.post(
            "/api/v1/auth/reset-password/",
            {"token": raw, "new_password": NEW_STRONG, "confirm_password": NEW_STRONG},
            format="json",
        )
        assert r.status_code == status.HTTP_200_OK
        admin_user.refresh_from_db()
        assert admin_user.password != old_hash
        assert admin_user.check_password(NEW_STRONG)

    def test_expired_token(self, api_client, admin_user):
        raw = secrets.token_urlsafe(48)
        PasswordResetToken.objects.create(
            user=admin_user,
            token_hash=hashlib.sha256(raw.encode()).hexdigest(),
            expires_at=timezone.now() - timedelta(minutes=1),
        )
        r = api_client.post(
            "/api/v1/auth/reset-password/",
            {"token": raw, "new_password": NEW_STRONG, "confirm_password": NEW_STRONG},
            format="json",
        )
        assert r.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_token(self, api_client):
        r = api_client.post(
            "/api/v1/auth/reset-password/",
            {"token": "bad", "new_password": NEW_STRONG, "confirm_password": NEW_STRONG},
            format="json",
        )
        assert r.status_code == status.HTTP_400_BAD_REQUEST

    def test_token_single_use(self, api_client, admin_user):
        raw = self._create_raw_token(admin_user)
        first = api_client.post(
            "/api/v1/auth/reset-password/",
            {"token": raw, "new_password": NEW_STRONG, "confirm_password": NEW_STRONG},
            format="json",
        )
        assert first.status_code == status.HTTP_200_OK
        second = api_client.post(
            "/api/v1/auth/reset-password/",
            {"token": raw, "new_password": "AnotherPass789!@", "confirm_password": "AnotherPass789!@"},
            format="json",
        )
        assert second.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_validation(self, api_client, admin_user):
        raw = self._create_raw_token(admin_user)
        r = api_client.post(
            "/api/v1/auth/reset-password/",
            {"token": raw, "new_password": "short", "confirm_password": "short"},
            format="json",
        )
        assert r.status_code == status.HTTP_400_BAD_REQUEST

    def test_mismatch_confirm(self, api_client, admin_user):
        raw = self._create_raw_token(admin_user)
        r = api_client.post(
            "/api/v1/auth/reset-password/",
            {"token": raw, "new_password": NEW_STRONG, "confirm_password": "OtherPass789!@"},
            format="json",
        )
        assert r.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestChangePassword:
    def test_change_password_success(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        r = api_client.post(
            "/api/v1/auth/change-password/",
            {
                "current_password": STRONG,
                "new_password": NEW_STRONG,
                "confirm_password": NEW_STRONG,
            },
            format="json",
        )
        assert r.status_code == status.HTTP_200_OK
        admin_user.refresh_from_db()
        assert admin_user.check_password(NEW_STRONG)
