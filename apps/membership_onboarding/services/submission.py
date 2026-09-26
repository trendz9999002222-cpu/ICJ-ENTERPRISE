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
    MembershipDocument,
    MembershipReferenceCounter,
    MembershipStepField,
    MembershipType,
)
from apps.membership_onboarding.services.public_config import build_configuration_for_form, get_active_membership_form
from apps.person.services import resolve_person_for_application
from apps.professional_onboarding.services.crud import ServiceError
from apps.professional_onboarding.services.field_validation import validate_configured_field_value


def allocate_membership_reference_id() -> str:
    year = timezone.now().year
    with transaction.atomic():
        counter, _ = MembershipReferenceCounter.objects.select_for_update().get_or_create(
            year=year,
            defaults={"last_value": 0},
        )
        counter.last_value += 1
        counter.save(update_fields=["last_value"])
        return f"MEM-{year}-{counter.last_value:06d}"


def _normalize_field_type(field_type: str) -> str:
    if field_type in ("searchable_dropdown", "multi_select", "country", "state", "district", "city", "pincode"):
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
    ) -> MembershipApplication:
        if not declaration_accepted:
            raise ServiceError("Declaration must be accepted.", {"declaration_accepted": ["Required."]})

        idempotency_key = (idempotency_key or "").strip() or None
        if idempotency_key and user:
            existing = MembershipApplication.objects.filter(user=user, idempotency_key=idempotency_key).first()
            if existing:
                return existing

        form = get_active_membership_form()
        if not form:
            raise ServiceError("No active membership form.", {"form": ["Not configured."]})

        try:
            membership_type = MembershipType.objects.get(pk=membership_type_id, is_active=True)
        except MembershipType.DoesNotExist:
            membership_type = form.membership_type

        if str(membership_type.id) != str(form.membership_type_id):
            membership_type = form.membership_type

        config = build_configuration_for_form(form)

        errors: dict[str, list[str]] = {}
        field_meta: dict[str, MembershipStepField] = {}
        for step in config["steps"]:
            for field in getattr(step, "active_fields", step.fields.filter(is_active=True)):
                field_meta[field.field_key] = field

        doc_meta = {d.document_key: d for d in config["documents"]}

        for key in field_values:
            if key not in field_meta:
                errors.setdefault(key, []).append("Unknown field.")

        for key, field in field_meta.items():
            if field.field_type in (MembershipStepField.FieldType.FILE, MembershipStepField.FieldType.IMAGE):
                continue
            value = field_values.get(key)
            options = [
                {"value": o.value, "label": o.label}
                for o in field.options.filter(is_active=True).order_by("display_order", "label")
            ]
            if field.is_required and (value is None or (isinstance(value, str) and not value.strip())):
                errors.setdefault(key, []).append(f"{field.label} is required.")
            else:
                ftype = _normalize_field_type(field.field_type)
                msg = validate_configured_field_value(ftype, value, options)
                if msg:
                    errors.setdefault(key, []).append(msg)

        for doc_key, doc in doc_meta.items():
            if doc.is_required and doc_key not in uploaded_files:
                errors.setdefault(doc_key, []).append(f"{doc.name} is required.")

        for key, file in uploaded_files.items():
            if key not in doc_meta and key not in field_meta:
                errors.setdefault(key, []).append("Unknown upload.")
                continue
            if file.size <= 0:
                errors.setdefault(key, []).append("Empty file is not allowed.")

        if errors:
            raise ServiceError("Validation failed.", errors)

        with transaction.atomic():
            person = resolve_person_for_application(field_values=field_values, user=user)
            reference_id = allocate_membership_reference_id()
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
                status=MembershipApplication.Status.PENDING,
                submitted_at=now,
            )
            application.save()

            for doc_key, file in uploaded_files.items():
                doc_cfg = doc_meta.get(doc_key)
                MembershipApplicationDocument.objects.create(
                    application=application,
                    person=person,
                    document_key=doc_key,
                    document_type=doc_cfg.document_type if doc_cfg else "",
                    original_name=os.path.basename(file.name or "upload"),
                    content_type=file.content_type or "",
                    size_bytes=file.size,
                    file=file,
                )

            MembershipApplicationHistory.objects.create(
                application=application,
                action="application_submitted",
                actor=user if getattr(user, "is_authenticated", False) else None,
                metadata={"reference_id": reference_id},
            )

        return application


def parse_field_values_json(raw) -> dict[str, Any]:
    if raw is None or raw == "":
        return {}
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        return json.loads(raw)
    raise ValueError("Invalid field_values")
