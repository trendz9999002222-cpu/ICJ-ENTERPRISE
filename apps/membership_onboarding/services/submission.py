import json
import os
from typing import Any

from django.core.files.uploadedfile import UploadedFile
from django.db import transaction
from django.utils import timezone

from apps.membership_onboarding.models import (
    MembershipApplication,
    MembershipApplicationDocument,
    MembershipApplicationHistory,
    MembershipReferenceCounter,
    MembershipType,
)
from apps.membership_onboarding.services.public_config import build_configuration_for_form, get_active_membership_form
from apps.accounts.services.user_provisioning import provision_user_for_membership
from apps.membership_onboarding.models import MembershipPayment
from apps.membership_onboarding.services.fee_settings import payment_required_for_submission
from apps.person.services import resolve_person_for_application
from apps.professional_onboarding.services.crud import ServiceError
from apps.professional_onboarding.services.field_validation import validate_configured_field_value


def _allocate_prefixed_reference(prefix: str) -> str:
    year = timezone.now().year
    with transaction.atomic():
        counter, _ = MembershipReferenceCounter.objects.select_for_update().get_or_create(
            year=year,
            defaults={"last_value": 0},
        )
        counter.last_value += 1
        counter.save(update_fields=["last_value"])
        return f"{prefix}-{year}-{counter.last_value:06d}"


def allocate_application_reference_id() -> str:
    """Public application reference at submit (before admin approval)."""
    return _allocate_prefixed_reference("APP")


def allocate_membership_id() -> str:
    """Official membership ID issued when admin approves the application."""
    return _allocate_prefixed_reference("MEM")


def _normalize_field_type(field_type: str) -> str:
    if field_type in ("country", "state", "district", "city", "pincode"):
        return "text"
    if field_type in ("searchable_dropdown", "multi_select"):
        return "select" if field_type != "multi_select" else "checkbox"
    if field_type == "image":
        return "file"
    return field_type


class MembershipApplicationService:
    @staticmethod
    def submit(
        *,
        membership_type_id: str,
        field_values: dict[str, Any],
        uploaded_files: dict[str, UploadedFile],
        declaration_accepted: bool,
        user=None,
        idempotency_key: str | None = None,
        membership_payment_id: str | None = None,
    ) -> tuple[MembershipApplication, str | None, bool]:
        if not declaration_accepted:
            raise ServiceError("Declaration must be accepted.", {"declaration_accepted": ["Required."]})

        payment: MembershipPayment | None = None
        if membership_payment_id:
            payment = MembershipPayment.objects.filter(pk=membership_payment_id).first()
            if not payment or payment.status != MembershipPayment.Status.PAID:
                raise ServiceError("Valid payment is required.", {"payment_id": ["Payment not verified."]})
            if payment.application_id:
                raise ServiceError("Payment already used.", {"payment_id": ["This payment is linked to another application."]})
        elif payment_required_for_submission():
            raise ServiceError("Membership fee payment is required.", {"payment_id": ["Complete payment before submitting."]})

        idempotency_key = (idempotency_key or "").strip() or None
        if idempotency_key and user:
            existing = MembershipApplication.objects.filter(user=user, idempotency_key=idempotency_key).first()
            if existing:
                return existing, None, False

        form = get_active_membership_form()
        
        try:
            membership_type = MembershipType.objects.get(pk=membership_type_id, is_active=True)
        except MembershipType.DoesNotExist:
            membership_type = form.membership_type if form else None
            if not membership_type:
                from apps.membership_onboarding.services.public_config import ensure_default_membership_type
                membership_type = ensure_default_membership_type()

        if form and str(membership_type.id) != str(form.membership_type_id):
            membership_type = form.membership_type

        full_name = (field_values.get("full_name") or field_values.get("name") or "").strip()
        if not full_name and (field_values.get("first_name") or field_values.get("last_name")):
            full_name = f"{field_values.get('first_name', '')} {field_values.get('last_name', '')}".strip()
        field_values["full_name"] = full_name

        email_val = (field_values.get("email") or field_values.get("email_address") or "").strip().lower()
        mobile_val = (field_values.get("mobile_number") or field_values.get("mobile") or field_values.get("phone_number") or "").strip()

        errors: dict[str, list[str]] = {}
        if not full_name:
            errors.setdefault("full_name", []).append("Full name is required.")
        if not email_val:
            errors.setdefault("email", []).append("Email address is required.")
        if not mobile_val:
            errors.setdefault("mobile_number", []).append("Mobile number is required.")

        for key, file in uploaded_files.items():
            if file.size <= 0:
                errors.setdefault(key, []).append("Empty file is not allowed.")

        # Check duplicate email and mobile number across users and applications
        from apps.accounts.services.identity_checks import check_duplicate_email, check_duplicate_phone

        email_val = (
            field_values.get("email")
            or field_values.get("email_address")
            or field_values.get("email_id")
            or ""
        )
        if email_val:
            email_err = check_duplicate_email(email_val, current_user=user, check_applications=True)
            if email_err:
                errors.setdefault("email", []).append(email_err)
                errors.setdefault("email_address", []).append(email_err)

        phone_val = (
            field_values.get("mobile_number")
            or field_values.get("mobile")
            or field_values.get("phone_number")
            or field_values.get("phone")
            or ""
        )
        if phone_val:
            phone_err = check_duplicate_phone(phone_val, current_user=user, check_applications=True)
            if phone_err:
                errors.setdefault("mobile_number", []).append(phone_err)
                errors.setdefault("mobile", []).append(phone_err)

        if errors:
            raise ServiceError("Validation failed.", errors)

        with transaction.atomic():
            person = resolve_person_for_application(field_values=field_values, user=user)
            reference_id = allocate_application_reference_id()
            now = timezone.now()
            application = MembershipApplication(
                reference_id=reference_id,
                person=person,
                user=user if getattr(user, "is_authenticated", False) else None,
                membership_type=membership_type,
                form=form,
                idempotency_key=idempotency_key,
                field_values=field_values,
                declaration_accepted=True,
                declaration_date=now,
                status=MembershipApplication.Status.APPROVED,
                approved_at=now,
                submitted_at=now,
            )
            application.save()

            for doc_key, file in uploaded_files.items():
                MembershipApplicationDocument.objects.create(
                    application=application,
                    person=person,
                    document_key=doc_key,
                    document_type="",
                    original_name=os.path.basename(file.name or "upload"),
                    content_type=file.content_type or "",
                    size_bytes=file.size,
                    file=file,
                )

            # Members are approved by default: allocate official Membership ID and create active Membership
            from apps.membership_onboarding.models import Membership
            effective_form = form or get_active_membership_form()
            membership_id = allocate_membership_id()
            Membership.objects.create(
                membership_id=membership_id,
                person=person,
                membership_type=membership_type,
                application=application,
                form=effective_form,
                status=Membership.Status.ACTIVE,
                start_date=now.date(),
                approved_at=now,
            )

            MembershipApplicationHistory.objects.create(
                application=application,
                action="application_submitted_and_approved",
                actor=user if getattr(user, "is_authenticated", False) else None,
                metadata={
                    "reference_id": reference_id,
                    "membership_id": membership_id,
                    "auto_approved": True,
                },
            )

            if payment:
                payment.application = application
                payment.save(update_fields=["application"])
                application.fee_payment_status = MembershipApplication.FeePaymentStatus.PAID
                application.save(update_fields=["fee_payment_status"])

        user_obj, _, is_new = provision_user_for_membership(application)
        application.user = user_obj
        application.save(update_fields=["user"])

        return application, None, is_new


def parse_field_values_json(raw) -> dict[str, Any]:
    if raw is None or raw == "":
        return {}
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        return json.loads(raw)
    raise ValueError("Invalid field_values")
