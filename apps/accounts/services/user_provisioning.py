import secrets
import string
from typing import Tuple

from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


def generate_temp_password(length: int = 10) -> str:
    """Generate a clean, strong temporary password."""
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
def provision_user_for_professional(submission) -> Tuple[User, str, bool]:
    """
    Creates or activates a User for an approved professional registration submission.
    Returns: (user, temp_password, is_new_user)
    """
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

    # Detect role: if profession name/slug contains 'advocate' or 'lawyer' -> ADVOCATE, else CLIENT / MEMBER
    prof_name = (
        getattr(submission.profession, "name", "").lower()
        if hasattr(submission, "profession") and submission.profession
        else ""
    )
    if "advocate" in prof_name or "lawyer" in prof_name or "vakil" in prof_name:
        role = User.Role.ADVOCATE
    else:
        role = User.Role.PROFESSIONAL

    temp_password = generate_temp_password()
    is_new = False

    user = User.objects.filter(email__iexact=email).first()
    if not user and submission.user:
        user = submission.user

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
        # User exists: ensure active, update role if needed
        user.is_active = True
        user.role = role
        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name
        if mobile and not user.phone_number:
            user.phone_number = mobile
        # If user never had a password or needs temp password, set it
        if not user.has_usable_password() or not user.last_temp_password:
            user.set_password(temp_password)
            user.password_change_required = True
            user.last_temp_password = temp_password
            is_new = True
        user.save()

    submission.user = user
    submission.save(update_fields=["user"])

    return user, user.last_temp_password or temp_password, is_new


@transaction.atomic
def provision_user_for_membership(application) -> Tuple[User, str, bool]:
    """
    Creates or activates a User for an approved membership application.
    Returns: (user, temp_password, is_new_user)
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
    temp_password = generate_temp_password()
    is_new = False

    user = User.objects.filter(email__iexact=email).first()
    if not user and application.user:
        user = application.user

    if not user:
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
            password_change_required=True,
            last_temp_password=temp_password,
        )
        user.set_password(temp_password)
        user.save()
    else:
        user.is_active = True
        if not user.role or user.role == User.Role.CLIENT:
            user.role = role
        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name
        if mobile and not user.phone_number:
            user.phone_number = mobile
        if not user.has_usable_password() or not user.last_temp_password:
            user.set_password(temp_password)
            user.password_change_required = True
            user.last_temp_password = temp_password
            is_new = True
        user.save()

    application.user = user
    application.save(update_fields=["user"])

    if person and not person.user:
        person.user = user
        person.save(update_fields=["user"])

    return user, user.last_temp_password or temp_password, is_new


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
