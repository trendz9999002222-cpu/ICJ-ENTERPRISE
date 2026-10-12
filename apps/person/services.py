from __future__ import annotations

from typing import Any

from django.db import transaction

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractBaseUser as User
else:
    from django.contrib.auth import get_user_model
    User = get_user_model()
from .models import Person


def _pick(values: dict[str, Any], *keys: str) -> str:
    for key in keys:
        val = values.get(key)
        if val is not None and str(val).strip():
            return str(val).strip()
    return ""


@transaction.atomic
def resolve_person_for_application(
    *,
    field_values: dict[str, Any],
    user: User | None = None,
) -> Person:
    email = _pick(field_values, "email", "email_id", "email_address").lower()
    mobile = _pick(field_values, "mobile", "phone", "mobile_number", "primary_mobile")
    full_name = _pick(field_values, "full_name", "name", "legal_name")

    if user and user.is_authenticated:
        try:
            person = Person.objects.filter(user=user).first()
            if person:
                if full_name and not person.full_name:
                    person.full_name = full_name
                if email and not person.email:
                    person.email = email
                if mobile and not person.mobile:
                    person.mobile = mobile
                person.save()
                return person
        except Person.DoesNotExist:
            pass

    person = None
    if email:
        person = Person.objects.filter(email__iexact=email).first()
    if not person and mobile:
        person = Person.objects.filter(mobile=mobile).first()

    if person and person.user_id and (not user or not user.is_authenticated or person.user_id != user.id):
        person = None

    if person:
        if full_name and not person.full_name:
            person.full_name = full_name
        if email and not person.email:
            person.email = email
        if mobile and not person.mobile:
            person.mobile = mobile
        if user and not person.user_id:
            person.user = user
        person.save()
        return person

    return Person.objects.create(
        user=user if user and user.is_authenticated else None,
        full_name=full_name,
        email=email,
        mobile=mobile,
    )
