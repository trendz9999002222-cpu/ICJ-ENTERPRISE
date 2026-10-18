import re
from typing import Optional

from django.contrib.auth import get_user_model
from django.db.models import Q

from apps.person.models import Person


def clean_phone_digits(phone: str | None) -> str:
    if not phone:
        return ""
    return re.sub(r"\D", "", str(phone))


def get_phone_variants(phone: str | None) -> list[str]:
    """
    Returns possible representation variants of a phone number.
    e.g. for '9995286582' or '+919995286582':
    includes raw stripped, digits, last 10 digits, +91<last10>, 91<last10>, 0<last10>.
    """
    if not phone:
        return []
    raw = str(phone).strip()
    digits = clean_phone_digits(raw)
    variants = {raw, digits}
    if len(digits) >= 10:
        last10 = digits[-10:]
        variants.add(last10)
        variants.add(f"+91{last10}")
        variants.add(f"91{last10}")
        variants.add(f"0{last10}")
        variants.add(f"+91 {last10}")
    return [v for v in variants if v]


def build_phone_query(phone: str | None, field_name: str = "phone_number") -> Q:
    variants = get_phone_variants(phone)
    if not variants:
        return Q(pk__in=[])
    digits = clean_phone_digits(phone)
    q = Q(**{f"{field_name}__in": variants})
    if len(digits) >= 10:
        last10 = digits[-10:]
        q |= Q(**{f"{field_name}__endswith": last10})
    return q


def check_duplicate_email(email: str | None, current_user=None, check_applications: bool = True) -> str | None:
    """
    Validates whether an email is already registered with a User or an active application.
    Returns an error message string if duplicate, otherwise None.
    """
    if not email:
        return None
    email_clean = str(email).strip().lower()
    if not email_clean:
        return None

    User = get_user_model()

    # 1. Check User model
    if current_user and getattr(current_user, "is_authenticated", False):
        if User.objects.filter(email__iexact=email_clean).exclude(pk=current_user.pk).exists():
            return "This email is already registered with another account."
    else:
        if User.objects.filter(email__iexact=email_clean).exists():
            return "This email is already registered. Please log in to continue or use a different email."

    # 1b. Check Person model (if person is linked to an account)
    person_user_qs = Person.objects.filter(email__iexact=email_clean, user__isnull=False)
    if current_user and getattr(current_user, "is_authenticated", False):
        person_user_qs = person_user_qs.exclude(user=current_user)
    if person_user_qs.exists():
        return "This email is already registered with an existing account."

    if not check_applications:
        return None

    # 2. Check active MembershipApplication
    from apps.membership_onboarding.models import MembershipApplication

    active_statuses = [
        MembershipApplication.Status.PENDING,
        MembershipApplication.Status.UNDER_REVIEW,
        MembershipApplication.Status.APPROVED,
    ]

    mem_qs = MembershipApplication.objects.filter(status__in=active_statuses)
    if current_user and getattr(current_user, "is_authenticated", False):
        if mem_qs.filter(user=current_user).exists():
            return "You already have an active or submitted membership application."
        if mem_qs.filter(person__email__iexact=email_clean).exclude(user=current_user).exists():
            return "A membership application with this email already exists."
    else:
        app_match = mem_qs.filter(
            Q(person__email__iexact=email_clean)
            | Q(field_values__email__iexact=email_clean)
            | Q(field_values__email_address__iexact=email_clean)
            | Q(field_values__email_id__iexact=email_clean)
        ).exists()
        if app_match:
            return "A membership application with this email already exists."

    # 3. Check active ProfessionalRegistrationSubmission
    from apps.professional_onboarding.models import ProfessionalRegistrationSubmission

    pro_statuses = [
        ProfessionalRegistrationSubmission.Status.PENDING,
        ProfessionalRegistrationSubmission.Status.APPROVED,
    ]
    pro_qs = ProfessionalRegistrationSubmission.objects.filter(status__in=pro_statuses)
    if current_user and getattr(current_user, "is_authenticated", False):
        if pro_qs.filter(user=current_user).exists():
            return "You already have an active or submitted professional registration."
        if pro_qs.filter(common_field_values__email__iexact=email_clean).exclude(user=current_user).exists():
            return "A professional registration with this email already exists."
    else:
        if pro_qs.filter(
            Q(common_field_values__email__iexact=email_clean)
            | Q(common_field_values__email_address__iexact=email_clean)
        ).exists():
            return "A professional registration with this email already exists."

    return None


def check_duplicate_phone(phone: str | None, current_user=None, check_applications: bool = True) -> str | None:
    """
    Validates whether a mobile/phone number is already registered with a User or an active application.
    Returns an error message string if duplicate, otherwise None.
    """
    if not phone:
        return None
    digits = clean_phone_digits(phone)
    if not digits or len(digits) < 7:
        return None

    User = get_user_model()
    variants = get_phone_variants(phone)
    last10 = digits[-10:] if len(digits) >= 10 else digits

    # 1. Check User model
    q_user = build_phone_query(phone, "phone_number")
    user_qs = User.objects.exclude(phone_number="").filter(q_user)
    if current_user and getattr(current_user, "is_authenticated", False):
        user_qs = user_qs.exclude(pk=current_user.pk)
    if user_qs.exists():
        return "This mobile number is already registered. Please use a different mobile number."

    # 2. Check Person model (if person is linked to another user)
    q_person = build_phone_query(phone, "mobile")
    person_qs = Person.objects.exclude(mobile="").filter(q_person)
    if current_user and getattr(current_user, "is_authenticated", False):
        person_qs = person_qs.exclude(user=current_user)
    if person_qs.filter(user__isnull=False).exists():
        return "This mobile number is already registered with another user."

    if not check_applications:
        return None

    # 3. Check active MembershipApplication
    from apps.membership_onboarding.models import MembershipApplication

    active_statuses = [
        MembershipApplication.Status.PENDING,
        MembershipApplication.Status.UNDER_REVIEW,
        MembershipApplication.Status.APPROVED,
    ]
    mem_qs = MembershipApplication.objects.filter(status__in=active_statuses)
    if current_user and getattr(current_user, "is_authenticated", False):
        mem_qs = mem_qs.exclude(user=current_user)

    q_mem = build_phone_query(phone, "person__mobile")
    if mem_qs.filter(q_mem).exists():
        return "This mobile number is already registered with an existing membership application."

    for app in mem_qs.only("id", "field_values"):
        fv = app.field_values or {}
        val = fv.get("mobile_number") or fv.get("mobile") or fv.get("phone") or fv.get("phone_number") or ""
        d = clean_phone_digits(val)
        if d and (d in variants or (len(d) >= 10 and d[-10:] == last10)):
            return "This mobile number is already registered with an existing membership application."

    # 4. Check active ProfessionalRegistrationSubmission
    from apps.professional_onboarding.models import ProfessionalRegistrationSubmission

    pro_statuses = [
        ProfessionalRegistrationSubmission.Status.PENDING,
        ProfessionalRegistrationSubmission.Status.APPROVED,
    ]
    pro_qs = ProfessionalRegistrationSubmission.objects.filter(status__in=pro_statuses)
    if current_user and getattr(current_user, "is_authenticated", False):
        pro_qs = pro_qs.exclude(user=current_user)

    for sub in pro_qs.only("id", "common_field_values"):
        cfv = sub.common_field_values or {}
        val = cfv.get("mobile") or cfv.get("phone") or cfv.get("mobile_number") or cfv.get("phone_number") or ""
        d = clean_phone_digits(val)
        if d and (d in variants or (len(d) >= 10 and d[-10:] == last10)):
            return "This mobile number is already registered with an existing professional registration."

    return None
