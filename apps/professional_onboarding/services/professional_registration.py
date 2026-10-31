import json
import mimetypes
import os
from typing import Any

from django.core.files.uploadedfile import UploadedFile
from django.db import transaction
from django.utils import timezone

from apps.professional_onboarding.models import (
    Category,
    Group,
    Profession,
    ProfessionDocument,
    ProfessionalRegistrationReferenceCounter,
    ProfessionalRegistrationSubmission,
    ProfessionalRegistrationSubmissionFile,
)
from apps.accounts.services.user_provisioning import provision_professional_user_at_registration
from apps.professional_onboarding.services.crud import ServiceError
from apps.professional_onboarding.services.field_validation import validate_configured_field_value
from apps.professional_onboarding.services.public_config import build_profession_configuration


def allocate_reference_id() -> str:
    year = timezone.now().year
    with transaction.atomic():
        counter, _ = ProfessionalRegistrationReferenceCounter.objects.select_for_update().get_or_create(
            year=year,
            defaults={"last_value": 0},
        )
        counter.last_value += 1
        counter.save(update_fields=["last_value"])
        return f"PRO-{year}-{counter.last_value:06d}"


def _parse_uuid_list(values: list[str] | None) -> list[str]:
    if not values:
        return []
    out: list[str] = []
    seen: set[str] = set()
    for raw in values:
        key = str(raw).strip()
        if key and key not in seen:
            seen.add(key)
            out.append(key)
    return out


def _profession_field_map(
    profession_ids: list[str],
    profession_field_values: dict[str, Any],
) -> dict[str, dict[str, Any]]:
    if not profession_ids:
        return {}

    if len(profession_ids) == 1:
        pid = profession_ids[0]
        nested = profession_field_values.get(pid)
        if isinstance(nested, dict):
            return {pid: nested}
        if profession_field_values and not any(isinstance(v, dict) for v in profession_field_values.values()):
            return {pid: profession_field_values}
        return {pid: {}}

    result: dict[str, dict[str, Any]] = {}
    for pid in profession_ids:
        block = profession_field_values.get(pid)
        result[pid] = block if isinstance(block, dict) else {}
    return result


def _validate_hierarchy(
    category_ids: list[str],
    group_ids: list[str],
    profession_ids: list[str],
) -> list[Profession]:
    if not category_ids:
        raise ServiceError("Select at least one category.", {"category_ids": ["Required."]})
    if not group_ids:
        raise ServiceError("Select at least one group.", {"group_ids": ["Required."]})
    if not profession_ids:
        raise ServiceError("Select at least one profession.", {"profession_ids": ["Required."]})

    category_set = set(category_ids)
    group_set = set(group_ids)

    active_categories = set(
        str(pk)
        for pk in Category.objects.filter(pk__in=category_ids, is_active=True).values_list("pk", flat=True)
    )
    if active_categories != category_set:
        raise ServiceError(
            "One or more selected categories are invalid.",
            {"category_ids": ["Invalid or inactive category."]},
        )

    groups = list(
        Group.objects.filter(pk__in=group_ids, is_active=True).select_related("category")
    )
    if len(groups) != len(group_set):
        raise ServiceError(
            "One or more selected groups are invalid.",
            {"group_ids": ["Invalid or inactive group."]},
        )
    for group in groups:
        if str(group.category_id) not in category_set:
            raise ServiceError(
                "Selected group does not belong to a selected category.",
                {"group_ids": [f"Group {group.name} is not under the selected categories."]},
            )

    professions: list[Profession] = []
    for profession_id in profession_ids:
        try:
            profession = Profession.objects.select_related("group", "group__category").get(
                pk=profession_id,
                is_active=True,
                group__is_active=True,
                group__category__is_active=True,
            )
        except Profession.DoesNotExist:
            raise ServiceError(
                "One or more selected professions are invalid.",
                {"profession_ids": ["Invalid or inactive profession."]},
            )
        if str(profession.group_id) not in group_set:
            raise ServiceError(
                "Selected profession does not match selected groups.",
                {"profession_ids": [f"{profession.name} is not under a selected group."]},
            )
        if str(profession.group.category_id) not in category_set:
            raise ServiceError(
                "Selected profession does not match selected categories.",
                {"profession_ids": [f"{profession.name} is not under a selected category."]},
            )
        professions.append(profession)

    return professions


def _file_allowed(file: UploadedFile, allowed_types: list[str]) -> bool:
    if not file or file.size <= 0:
        return False
    name = (file.name or "").lower()
    ext = os.path.splitext(name)[1].lstrip(".")
    content_type = (file.content_type or "").lower()
    for allowed in allowed_types:
        token = allowed.lower().strip().lstrip(".")
        if not token:
            continue
        if "/" in token and content_type == token:
            return True
        if ext == token:
            return True
        guessed, _ = mimetypes.guess_type(f"file.{token}")
        if guessed and content_type == guessed.lower():
            return True
    return False


class ProfessionalRegistrationSubmissionService:
    @staticmethod
    def submit(
        *,
        category_ids: list[str] | None = None,
        group_ids: list[str] | None = None,
        profession_ids: list[str] | None = None,
        category_id=None,
        group_id=None,
        profession_id=None,
        common_field_values: dict[str, Any],
        profession_field_values: dict[str, Any],
        uploaded_files: dict[str, UploadedFile],
        user=None,
        idempotency_key: str | None = None,
        new_password: str | None = None,
        confirm_password: str | None = None,
    ) -> ProfessionalRegistrationSubmission:
        category_ids = _parse_uuid_list(category_ids or ([str(category_id)] if category_id else []))
        group_ids = _parse_uuid_list(group_ids or ([str(group_id)] if group_id else []))
        profession_ids = _parse_uuid_list(profession_ids or ([str(profession_id)] if profession_id else []))

        idempotency_key = (idempotency_key or "").strip() or None
        if idempotency_key and user:
            existing = ProfessionalRegistrationSubmission.objects.filter(
                user=user,
                idempotency_key=idempotency_key,
            ).first()
            if existing:
                return existing

        professions = _validate_hierarchy(category_ids, group_ids, profession_ids)
        values_by_profession = _profession_field_map(profession_ids, profession_field_values)

        from apps.professional_onboarding.serializers.public import (
            PublicCommonFieldSerializer,
            PublicProfessionDocumentSerializer,
            PublicProfessionFieldSerializer,
        )

        errors: dict[str, list[str]] = {}
        documents_meta: dict[str, dict] = {}
        common_fields_union: dict[str, dict] = {}
        for profession in professions:
            config = build_profession_configuration(profession)
            pid = str(profession.id)
            pvalues = values_by_profession.get(pid, {})

            common_fields = {
                f["field_key"]: f
                for f in PublicCommonFieldSerializer(config["common_fields"], many=True).data
            }
            for key, meta in common_fields.items():
                common_fields_union.setdefault(key, meta)

            profession_fields = {
                f["field_key"]: f
                for f in PublicProfessionFieldSerializer(config["profession_fields"], many=True).data
            }
            for key, meta in profession_fields.items():
                if meta["is_required"] and not pvalues.get(key):
                    errors.setdefault(f"profession_field_values.{pid}.{key}", []).append(
                        f"{meta['label']} is required."
                    )
                else:
                    msg = validate_configured_field_value(
                        meta["field_type"], pvalues.get(key), meta.get("options")
                    )
                    if msg:
                        errors.setdefault(f"profession_field_values.{pid}.{key}", []).append(msg)

            for key in pvalues:
                if key not in profession_fields:
                    errors.setdefault(f"profession_field_values.{pid}.{key}", []).append(
                        "Unknown profession field."
                    )

            for doc in PublicProfessionDocumentSerializer(config["documents"], many=True).data:
                doc_key = doc["document_key"]
                existing = documents_meta.get(doc_key)
                if not existing:
                    documents_meta[doc_key] = doc
                elif doc.get("is_required"):
                    documents_meta[doc_key] = {**existing, "is_required": True}

        authenticated = bool(user and getattr(user, "is_authenticated", False))

        # If user is authenticated (e.g. member registering a profession from dashboard),
        # auto-populate missing common fields from their existing user and membership profile
        if authenticated:
            member_app = getattr(user, "membership_applications", None)
            member_fields = {}
            if member_app:
                first_app = member_app.order_by("-created_at").first()
                if first_app and isinstance(first_app.field_values, dict):
                    member_fields = first_app.field_values

            person = getattr(user, "person_profile", None)
            if not person and member_app:
                first_app = member_app.order_by("-created_at").first()
                if first_app:
                    person = getattr(first_app, "person", None)

            if not common_field_values.get("full_name") and not common_field_values.get("name"):
                name = (
                    f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
                    or getattr(person, "full_name", "")
                    or member_fields.get("full_name")
                    or member_fields.get("name")
                    or getattr(user, "username", "")
                )
                if name:
                    common_field_values["full_name"] = name

            if not common_field_values.get("email") and not common_field_values.get("email_address"):
                email = getattr(user, "email", "") or getattr(person, "email", "") or member_fields.get("email") or member_fields.get("email_address")
                if email:
                    common_field_values["email"] = email

            if not common_field_values.get("mobile_number") and not common_field_values.get("mobile") and not common_field_values.get("phone_number"):
                phone = (
                    getattr(user, "phone_number", "")
                    or getattr(person, "mobile", "")
                    or member_fields.get("mobile_number")
                    or member_fields.get("mobile")
                    or member_fields.get("phone_number")
                    or member_fields.get("phone")
                )
                if phone:
                    common_field_values["mobile_number"] = phone

            if "country" in common_fields_union and not common_field_values.get("country"):
                common_field_values["country"] = member_fields.get("country") or "India"
            if "state" in common_fields_union and not common_field_values.get("state"):
                state_val = member_fields.get("state") or getattr(user, "state", "") or "Delhi"
                if state_val:
                    common_field_values["state"] = state_val
            if "district" in common_fields_union and not common_field_values.get("district") and not common_field_values.get("city"):
                dist_val = member_fields.get("district") or member_fields.get("city") or getattr(user, "district", "") or "New Delhi"
                if dist_val:
                    common_field_values["district"] = dist_val

        # Map common field aliases
        if "district" in common_fields_union and not common_field_values.get("district") and common_field_values.get("city"):
            common_field_values["district"] = common_field_values["city"]
        if "city" in common_fields_union and not common_field_values.get("city") and common_field_values.get("district"):
            common_field_values["city"] = common_field_values["district"]
        if "full_name" in common_fields_union and not common_field_values.get("full_name") and common_field_values.get("name"):
            common_field_values["full_name"] = common_field_values["name"]
        if "first_name" in common_fields_union and not common_field_values.get("first_name") and common_field_values.get("full_name"):
            common_field_values["first_name"] = str(common_field_values["full_name"]).strip().split(" ")[0]
        if "last_name" in common_fields_union and not common_field_values.get("last_name") and common_field_values.get("full_name"):
            parts = str(common_field_values["full_name"]).strip().split(" ", 1)
            common_field_values["last_name"] = parts[1] if len(parts) > 1 else "."
        if "mobile_number" in common_fields_union and not common_field_values.get("mobile_number"):
            common_field_values["mobile_number"] = common_field_values.get("mobile") or common_field_values.get("phone") or common_field_values.get("phone_number")

        for key in list(common_field_values.keys()):
            if key not in common_fields_union:
                # Tolerate extra/alias common fields gracefully without blocking registration
                continue

        for key, meta in common_fields_union.items():
            value = common_field_values.get(key)
            if meta["is_required"] and not value:
                if not authenticated:
                    errors.setdefault(key, []).append(f"{meta['label']} is required.")
            elif value:
                msg = validate_configured_field_value(meta["field_type"], value, meta.get("options"), common_field_values.get("country"))
                if msg and not authenticated:
                    errors.setdefault(key, []).append(msg)

        for doc_key, meta in documents_meta.items():
            if meta["is_required"] and doc_key not in uploaded_files:
                errors.setdefault(doc_key, []).append(f"{meta['name']} is required.")

        for doc_key, file in uploaded_files.items():
            meta = documents_meta.get(doc_key)
            if not meta:
                continue
            if file.size <= 0:
                errors.setdefault(doc_key, []).append("Empty file is not allowed.")
                continue
            max_mb = meta.get("max_file_size_mb") or 5
            if file.size > max_mb * 1024 * 1024:
                errors.setdefault(doc_key, []).append(f"File must be under {max_mb} MB.")
            allowed = meta.get("allowed_file_types") or []
            if allowed and not _file_allowed(file, allowed):
                errors.setdefault(doc_key, []).append("File type is not allowed.")

        if not authenticated:
            if not (new_password or "").strip():
                errors.setdefault("new_password", []).append("Password is required.")
            if not (confirm_password or "").strip():
                errors.setdefault("confirm_password", []).append("Please confirm your password.")

        # Check duplicate email and phone across users and registrations
        from apps.accounts.services.identity_checks import build_phone_query, check_duplicate_email, check_duplicate_phone
        from django.contrib.auth import get_user_model
        UserModel = get_user_model()

        pro_email = (
            common_field_values.get("email")
            or common_field_values.get("email_address")
            or common_field_values.get("email_id")
            or ""
        )
        pro_phone = (
            common_field_values.get("mobile")
            or common_field_values.get("phone")
            or common_field_values.get("mobile_number")
            or common_field_values.get("phone_number")
            or ""
        )

        if not authenticated:
            if pro_email:
                email_err = check_duplicate_email(pro_email, current_user=None, check_applications=True)
                if email_err:
                    errors.setdefault("email", []).append(email_err)
                    errors.setdefault("email_address", []).append(email_err)

            if pro_phone:
                phone_err = check_duplicate_phone(pro_phone, current_user=None, check_applications=True)
                if phone_err:
                    errors.setdefault("mobile", []).append(phone_err)
                    errors.setdefault("mobile_number", []).append(phone_err)
        else:
            # For authenticated users, verify email/phone are not registered to a DIFFERENT user account
            if pro_email:
                if UserModel.objects.filter(email__iexact=pro_email.strip().lower()).exclude(pk=user.pk).exists():
                    errors.setdefault("email", []).append("This email is already registered to another account.")
            if pro_phone:
                q_user = build_phone_query(pro_phone, "phone_number")
                if UserModel.objects.exclude(phone_number="").filter(q_user).exclude(pk=user.pk).exists():
                    errors.setdefault("mobile", []).append("This mobile number is already registered to another account.")

        if errors:
            raise ServiceError("Validation failed.", errors)

        with transaction.atomic():
            reference_id = allocate_reference_id()
            primary = professions[0]
            submission = ProfessionalRegistrationSubmission(
                reference_id=reference_id,
                user=user if getattr(user, "is_authenticated", False) else None,
                idempotency_key=idempotency_key,
                category_id=primary.group.category_id,
                group_id=primary.group_id,
                profession_id=primary.id,
                selected_category_ids=category_ids,
                selected_group_ids=group_ids,
                selected_profession_ids=profession_ids,
                common_field_values=common_field_values,
                profession_field_values=values_by_profession,
            )
            submission.save()

            saved_keys: set[str] = set()
            for doc_key, file in uploaded_files.items():
                if doc_key in saved_keys:
                    continue
                meta = documents_meta.get(doc_key)
                if not meta:
                    continue
                prof_doc = None
                for profession in professions:
                    prof_doc = ProfessionDocument.objects.filter(
                        profession=profession,
                        document__document_key=doc_key,
                        is_active=True,
                    ).first()
                    if prof_doc:
                        break
                ProfessionalRegistrationSubmissionFile.objects.create(
                    submission=submission,
                    document_key=doc_key,
                    profession_document_id=prof_doc.id if prof_doc else None,
                    original_name=os.path.basename(file.name or "upload"),
                    content_type=file.content_type or "",
                    size_bytes=file.size,
                    file=file,
                )
                saved_keys.add(doc_key)

            if authenticated and user:
                submission.user = user
                submission.save(update_fields=["user"])
                if not user.profile_picture:
                    for f in submission.files.all():
                        if f.document_key in ("photo", "profile_photo", "passport_photo", "avatar") and f.file:
                            user.profile_picture = f.file
                            user.save(update_fields=["profile_picture"])
                            break
            else:
                provision_professional_user_at_registration(
                    submission,
                    (new_password or "").strip(),
                    (confirm_password or "").strip(),
                )

        # Send welcome email after transaction (outside atomic block to avoid blocking)
        try:
            from apps.professional_onboarding.emails.welcome import send_professional_welcome_email
            applicant_email = (
                common_field_values.get("email")
                or common_field_values.get("email_address")
                or ""
            )
            applicant_name = (
                common_field_values.get("full_name")
                or common_field_values.get("name")
                or common_field_values.get("first_name")
                or ""
            )
            if applicant_email:
                send_professional_welcome_email(
                    to_email=applicant_email,
                    applicant_name=applicant_name,
                    reference_id=submission.reference_id,
                )
        except Exception:
            pass  # Email failure must never block registration

        return submission


def create_submission(**kwargs) -> ProfessionalRegistrationSubmission:
    """Backward-compatible entry point."""
    return ProfessionalRegistrationSubmissionService.submit(**kwargs)


def parse_id_list_from_request(data, plural_key: str, singular_key: str) -> list[str] | None:
    raw = data.get(plural_key)
    if raw is None or raw == "":
        return None
    if isinstance(raw, list):
        return [str(x) for x in raw]
    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [str(x) for x in parsed]
        except json.JSONDecodeError:
            pass
        return [raw]
    return [str(raw)]
