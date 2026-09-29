from __future__ import annotations

import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.accounts.emails.password_reset import send_password_reset_email
from apps.accounts.models import PasswordResetToken

User = get_user_model()

GENERIC_LOGIN_ERROR = "Invalid email or password."
FORGOT_PASSWORD_MESSAGE = (
    "If an account exists for this email, a password reset link has been sent."
)


class AuthServiceError(Exception):
    def __init__(self, message: str, errors: dict | None = None, code: str = "error"):
        self.message = message
        self.errors = errors or {}
        self.code = code
        super().__init__(message)


def _hash_reset_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def authenticate_user(email: str, password: str, request=None) -> User:
    email = User.objects.normalize_email(email.strip().lower())
    if not email or not password:
        raise AuthServiceError(GENERIC_LOGIN_ERROR, {"credentials": [GENERIC_LOGIN_ERROR]}, code="invalid_credentials")

    user = authenticate(request=request, email=email, password=password)
    if user is None:
        raise AuthServiceError(GENERIC_LOGIN_ERROR, {"credentials": [GENERIC_LOGIN_ERROR]}, code="invalid_credentials")

    if not user.is_active:
        raise AuthServiceError(
            GENERIC_LOGIN_ERROR,
            {"credentials": [GENERIC_LOGIN_ERROR]},
            code="invalid_credentials",
        )

    return user


@transaction.atomic
def change_password(user: User, current_password: str, new_password: str, confirm_password: str) -> User:
    if new_password != confirm_password:
        raise AuthServiceError(
            "Password confirmation does not match.",
            {"confirm_password": ["Passwords do not match."]},
        )

    if not user.check_password(current_password):
        raise AuthServiceError(
            "Current password is incorrect.",
            {"current_password": ["Current password is incorrect."]},
        )

    if current_password == new_password:
        raise AuthServiceError(
            "New password must differ from current password.",
            {"new_password": ["Choose a different password."]},
        )

    try:
        validate_password(new_password, user=user)
    except ValidationError as exc:
        raise AuthServiceError(
            "Password does not meet policy requirements.",
            {"new_password": list(exc.messages)},
        )

    user.set_password(new_password)
    user.password_change_required = False
    user.last_temp_password = ""
    user.save(update_fields=["password", "password_change_required", "last_temp_password", "updated_at"])
    return user


def request_password_reset(email: str, request=None) -> str:
    """
    Always returns the generic message (no email enumeration).
    Sends email only when an active user exists.
    """
    normalized = User.objects.normalize_email(email.strip().lower())
    user = User.objects.filter(email__iexact=normalized, is_active=True).first()

    if user:
        raw_token = secrets.token_urlsafe(48)
        token_hash = _hash_reset_token(raw_token)
        expires_at = timezone.now() + timedelta(seconds=settings.PASSWORD_RESET_TIMEOUT_SECONDS)

        PasswordResetToken.objects.filter(user=user, used_at__isnull=True).update(
            used_at=timezone.now()
        )

        PasswordResetToken.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=expires_at,
            request_ip=request.META.get("REMOTE_ADDR") if request else None,
        )

        base = settings.FRONTEND_PASSWORD_RESET_URL.rstrip("/")
        reset_link = f"{base}?token={raw_token}"
        send_password_reset_email(to_email=user.email, reset_link=reset_link)

    return FORGOT_PASSWORD_MESSAGE


@transaction.atomic
def reset_password_with_token(raw_token: str, new_password: str, confirm_password: str) -> User:
    if new_password != confirm_password:
        raise AuthServiceError(
            "Password confirmation does not match.",
            {"confirm_password": ["Passwords do not match."]},
        )

    if not raw_token or not raw_token.strip():
        raise AuthServiceError("Invalid or expired reset token.", {"token": ["Invalid token."]})

    token_hash = _hash_reset_token(raw_token.strip())
    record = (
        PasswordResetToken.objects.select_related("user")
        .filter(token_hash=token_hash, used_at__isnull=True)
        .order_by("-created_at")
        .first()
    )

    if record is None or not record.is_valid():
        raise AuthServiceError("Invalid or expired reset token.", {"token": ["Invalid or expired token."]})

    user = record.user
    if not user.is_active:
        raise AuthServiceError("Invalid or expired reset token.", {"token": ["Invalid or expired token."]})

    try:
        validate_password(new_password, user=user)
    except ValidationError as exc:
        raise AuthServiceError(
            "Password does not meet policy requirements.",
            {"new_password": list(exc.messages)},
        )

    user.set_password(new_password)
    user.password_change_required = False
    user.save(update_fields=["password", "password_change_required", "updated_at"])

    record.used_at = timezone.now()
    record.save(update_fields=["used_at"])

    PasswordResetToken.objects.filter(user=user, used_at__isnull=True).exclude(pk=record.pk).update(
        used_at=timezone.now()
    )

    return user


def create_default_admin_from_env() -> tuple[User | None, str]:
    email = settings.DEFAULT_ADMIN_EMAIL.strip().lower()
    username = settings.DEFAULT_ADMIN_USERNAME.strip()
    password = settings.DEFAULT_ADMIN_PASSWORD

    if not email or not username or not password:
        raise AuthServiceError(
            "DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_USERNAME, and DEFAULT_ADMIN_PASSWORD must be set.",
        )

    existing = User.objects.filter(email=email).first()
    if existing:
        if existing.is_admin_role and existing.is_staff:
            return existing, "Default admin already exists."
        raise AuthServiceError("A user with DEFAULT_ADMIN_EMAIL already exists with a different role.")

    user = User.objects.create_user(
        email=email,
        username=username,
        password=password,
        role=User.Role.ADMIN,
        is_staff=True,
        is_active=True,
        is_superuser=False,
        password_change_required=True,
        email_verified=True,
    )
    return user, "Default admin created successfully."
