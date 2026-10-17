import secrets
import string
from typing import Tuple, TYPE_CHECKING

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction

from apps.professional_onboarding.services.crud import ServiceError

if TYPE_CHECKING:
    from apps.accounts.models import User
else:
    User = get_user_model()


def _professional_identity_from_submission(submission):
    common = submission.common_field_values or {}
    email = (
        common.get("email")
        or common.get("email_address")
        or (submission.user.email if submission.user else None)
    )
    if email:
        email = email.strip().lower()

    if not email:
        email = f"pro.{submission.reference_id.lower().replace('-', '')}@icj.internal"

    full_name = common.get("full_name") or common.get("name") or ""
    first_name = common.get("first_name") or ""
    last_name = common.get("last_name") or ""

    if full_name and not (first_name or last_name):
        parts = full_name.strip().split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

    mobile = common.get("mobile") or common.get("phone") or common.get("phone_number") or ""
    return email, first_name, last_name, mobile


def generate_temp_password(length: int = 12) -> str:
    """Generate a clean, strong temporary password with uppercase, lowercase, numbers, and special characters."""
    letters = string.ascii_letters
    digits = string.digits
    special = "@#$!"
    pwd = (
        secrets.choice(string.ascii_uppercase)
        + secrets.choice(string.ascii_lowercase)
        + secrets.choice(digits)
        + secrets.choice(special)
        + "".join(secrets.choice(letters + digits) for _ in range(max(4, length - 4)))
    )
    return pwd


@transaction.atomic
def provision_professional_user_at_registration(submission, new_password: str, confirm_password: str) -> User:
    """Create/link professional user when applicant submits registration (password chosen on form)."""
    if new_password != confirm_password:
        raise ServiceError(
            "Password confirmation does not match.",
            {"confirm_password": ["Passwords do not match."]},
        )

    email, first_name, last_name, mobile = _professional_identity_from_submission(submission)
    role = User.Role.PROFESSIONAL

    user = User.objects.filter(email__iexact=email).first()
    if not user and submission.user_id:
        user = submission.user

    if user:
        if not submission.user_id or submission.user_id != user.id:
            raise ServiceError(
                "An account with this email already exists. Please log in or use a different email.",
                {"email": ["Email already registered."]},
            )
        user.is_active = True
        user.role = role
        submission.user = user
        submission.save(update_fields=["user"])
        return user

    try:
        validate_password(new_password, user=user if user else None)
    except ValidationError as exc:
        raise ServiceError(
            "Password does not meet policy requirements.",
            {"new_password": list(exc.messages)},
        )

    if not user:
        if mobile:
            from apps.accounts.services.identity_checks import check_duplicate_phone
            perr = check_duplicate_phone(mobile, current_user=None, check_applications=False)
            if perr:
                raise ServiceError(perr, {"mobile": [perr], "phone_number": [perr]})

        username = email
        if User.objects.filter(username__iexact=username).exists():
            username = f"{email.split('@')[0]}_{submission.reference_id.lower().replace('-', '')}"

        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=mobile,
            role=role,
            is_active=True,
            email_verified=True,
            password_change_required=False,
            last_temp_password="",
        )
    else:
        user.is_active = True
        user.role = role
        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name
        if mobile and not user.phone_number:
            user.phone_number = mobile

    user.set_password(new_password)
    user.password_change_required = False
    user.last_temp_password = ""
    user.save()

    submission.user = user
    submission.save(update_fields=["user"])
    return user


@transaction.atomic
def provision_user_for_professional(submission) -> Tuple[User, str | None, bool]:
    """
    Activates professional user on admin approval.
    Applicants who registered with a password do not receive temporary credentials.
    Returns: (user, temp_password_or_none, is_new_user)
    """
    email, first_name, last_name, mobile = _professional_identity_from_submission(submission)
    role = User.Role.PROFESSIONAL

    user = submission.user
    if not user:
        user = User.objects.filter(email__iexact=email).first()

    if user:
        user.is_active = True
        user.role = role
        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name
        if mobile and not user.phone_number:
            user.phone_number = mobile
        user.save()
        submission.user = user
        submission.save(update_fields=["user"])
        if user.has_usable_password() and not user.password_change_required:
            return user, None, False

    temp_password = generate_temp_password()
    is_new = False

    if not user:
        is_new = True
        username = email
        if User.objects.filter(username__iexact=username).exists():
            username = f"{email.split('@')[0]}_{submission.reference_id.lower().replace('-', '')}"

        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=mobile,
            role=role,
            is_active=True,
            email_verified=True,
            password_change_required=True,
            last_temp_password=temp_password,
        )
        user.set_password(temp_password)
        user.save()
    else:
        user.set_password(temp_password)
        user.password_change_required = True
        user.last_temp_password = temp_password
        is_new = True
        user.save()

    submission.user = user
    submission.save(update_fields=["user"])

    return user, user.last_temp_password or temp_password, is_new


@transaction.atomic
def provision_user_for_membership(application) -> Tuple[User, None, bool]:
    """
    Links or creates a member user for a membership application.

    Members set their own password after payment (dashboard gate). No admin-shareable
    temporary passwords are generated for membership.
    Returns: (user, None, is_new_user)
    """
    person = application.person
    email = (person.email if person else None) or (application.user.email if application.user else None)
    if email:
        email = email.strip().lower()

    if not email:
        email = f"member.{application.reference_id.lower().replace('-', '')}@icj.internal"

    full_name = person.full_name if person else ""
    first_name = ""
    last_name = ""
    if full_name:
        parts = full_name.strip().split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

    mobile = person.mobile if person else ""
    role = User.Role.MEMBER
    is_new = False

    user = User.objects.filter(email__iexact=email).first()
    if not user and application.user:
        user = application.user

    if user and (not application.user_id or application.user_id != user.id):
        raise ServiceError(
            "An account with this email already exists. Please log in before applying.",
            {"email": ["Email already registered."]},
        )

    if not user:
        if mobile:
            from apps.accounts.services.identity_checks import check_duplicate_phone
            perr = check_duplicate_phone(mobile, current_user=None, check_applications=False)
            if perr:
                raise ServiceError(perr, {"mobile_number": [perr], "mobile": [perr]})

        is_new = True
        username = email
        if User.objects.filter(username__iexact=username).exists():
            username = f"{email.split('@')[0]}_{application.reference_id.lower().replace('-', '')}"

        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=mobile,
            role=role,
            is_active=True,
            email_verified=True,
            password_change_required=False,
            last_temp_password="",
        )
        user.set_unusable_password()
        user.save()
    else:
        user.is_active = True
        if not user.role or user.role not in (User.Role.PROFESSIONAL, User.Role.MEMBER, User.Role.ADMIN, User.Role.SUPER_ADMIN):
            user.role = role
        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name
        if mobile and not user.phone_number:
            user.phone_number = mobile
        
        if not user.has_usable_password():
            user.password_change_required = True
        user.save()

    application.user = user
    application.save(update_fields=["user"])

    if person and not person.user:
        person.user = user
        person.save(update_fields=["user"])

    return user, None, is_new


@transaction.atomic
def generate_and_set_user_temp_password(user: User) -> str:
    """
    Admin action to regenerate or generate a fresh temporary password for a user.
    """
    temp_pwd = generate_temp_password()
    user.set_password(temp_pwd)
    user.last_temp_password = temp_pwd
    user.password_change_required = True
    user.is_active = True
    user.save(update_fields=["password", "last_temp_password", "password_change_required", "is_active", "updated_at"])
    return temp_pwd
