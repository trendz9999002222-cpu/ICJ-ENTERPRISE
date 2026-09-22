import json

from rest_framework import serializers

from apps.professional_onboarding.models import (
    Category,
    Group,
    Profession,
    ProfessionalRegistrationSubmission,
    ProfessionalRegistrationSubmissionFile,
)


def _applicant_from_common(values: dict) -> tuple[str, str]:
    name = (
        values.get("full_name")
        or values.get("name")
        or values.get("applicant_name")
        or ""
    )
    email = values.get("email") or values.get("email_address") or ""
    return str(name), str(email)


def _extract_from_prof_values(prof_values: dict, keys: tuple) -> str:
    if not prof_values or not isinstance(prof_values, dict):
        return ""
    # Check direct top-level keys
    for k in keys:
        if k in prof_values and prof_values[k]:
            return str(prof_values[k])
    # Check nested values (e.g. UUID -> dict)
    for v in prof_values.values():
        if isinstance(v, dict):
            for k in keys:
                if k in v and v[k]:
                    return str(v[k])
        elif isinstance(v, str) and (v.startswith("{") or v.startswith("[")):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, dict):
                    for k in keys:
                        if k in parsed and parsed[k]:
                            return str(parsed[k])
            except Exception:
                pass
    return ""


class ProfessionalRegistrationSubmissionFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalRegistrationSubmissionFile
        fields = (
            "id",
            "document_key",
            "original_name",
            "content_type",
            "size_bytes",
            "uploaded_at",
            "file_url",
        )

    def get_file_url(self, obj) -> str | None:
        if not obj.file:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


class ProfessionalRegistrationSubmissionListSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    mobile = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    enrollment_number = serializers.SerializerMethodField()
    regulatory_body = serializers.SerializerMethodField()
    experience = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    professions = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalRegistrationSubmission
        fields = (
            "id",
            "reference_id",
            "applicant_name",
            "email",
            "mobile",
            "photo_url",
            "enrollment_number",
            "regulatory_body",
            "experience",
            "city",
            "state",
            "categories",
            "groups",
            "professions",
            "category_id",
            "group_id",
            "profession_id",
            "status",
            "created_at",
        )

    def get_applicant_name(self, obj) -> str:
        name, _ = _applicant_from_common(obj.common_field_values or {})
        return name or "—"

    def get_email(self, obj) -> str:
        _, email = _applicant_from_common(obj.common_field_values or {})
        return email or "—"

    def get_mobile(self, obj) -> str:
        common = obj.common_field_values or {}
        return str(common.get("mobile_number") or common.get("mobile") or common.get("phone") or "—")

    def get_photo_url(self, obj) -> str | None:
        request = self.context.get("request")
        files = obj.files.all() if hasattr(obj, "files") else []
        for f in files:
            if f.document_key in ("photo", "profile_photo", "passport_photo", "avatar") and f.file:
                url = f.file.url
                if request:
                    return request.build_absolute_uri(url)
                return url
        return None

    def get_enrollment_number(self, obj) -> str:
        num = _extract_from_prof_values(obj.profession_field_values or {}, ("enrollment_number", "bar_number", "reg_number", "membership_number"))
        return num or obj.reference_id

    def get_regulatory_body(self, obj) -> str:
        body = _extract_from_prof_values(obj.profession_field_values or {}, ("bar_council", "state_bar_council", "regulatory_body", "institute"))
        return body or "—"

    def get_experience(self, obj) -> str:
        exp = _extract_from_prof_values(obj.profession_field_values or {}, ("experience", "experience_years", "years_of_experience"))
        return exp or "—"

    def get_city(self, obj) -> str:
        common = obj.common_field_values or {}
        prof = obj.profession_field_values or {}
        c = common.get("city") or _extract_from_prof_values(prof, ("practice_city", "city"))
        return str(c or "—")

    def get_state(self, obj) -> str:
        common = obj.common_field_values or {}
        prof = obj.profession_field_values or {}
        s = common.get("state") or _extract_from_prof_values(prof, ("state", "practice_state"))
        return str(s or "—")

    def _titles_for_ids(self, model, ids: list) -> list[str]:
        if not ids:
            return []
        names = model.objects.filter(pk__in=ids).values_list("name", flat=True)
        return list(names)

    def get_categories(self, obj) -> list[str]:
        if obj.category:
            return [obj.category.name]
        return self._titles_for_ids(Category, obj.selected_category_ids or [])

    def get_groups(self, obj) -> list[str]:
        if obj.group:
            return [obj.group.name]
        return self._titles_for_ids(Group, obj.selected_group_ids or [])

    def get_professions(self, obj) -> list[str]:
        if obj.profession:
            return [obj.profession.name]
        return self._titles_for_ids(Profession, obj.selected_profession_ids or [])


class ProfessionalRegistrationSubmissionDetailSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    mobile = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    enrollment_number = serializers.SerializerMethodField()
    regulatory_body = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    professions = serializers.SerializerMethodField()
    files = ProfessionalRegistrationSubmissionFileSerializer(many=True, read_only=True)
    submitted_by = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalRegistrationSubmission
        fields = (
            "id",
            "reference_id",
            "status",
            "submitted_by",
            "applicant_name",
            "email",
            "mobile",
            "photo_url",
            "enrollment_number",
            "regulatory_body",
            "categories",
            "groups",
            "professions",
            "category_id",
            "group_id",
            "profession_id",
            "selected_category_ids",
            "selected_group_ids",
            "selected_profession_ids",
            "common_field_values",
            "profession_field_values",
            "files",
            "created_at",
            "updated_at",
        )

    def get_applicant_name(self, obj) -> str:
        name, _ = _applicant_from_common(obj.common_field_values or {})
        return name or "—"

    def get_email(self, obj) -> str:
        _, email = _applicant_from_common(obj.common_field_values or {})
        return email or "—"

    def get_mobile(self, obj) -> str:
        common = obj.common_field_values or {}
        return str(common.get("mobile_number") or common.get("mobile") or common.get("phone") or "—")

    def get_photo_url(self, obj) -> str | None:
        request = self.context.get("request")
        files = obj.files.all() if hasattr(obj, "files") else []
        for f in files:
            if f.document_key in ("photo", "profile_photo", "passport_photo", "avatar") and f.file:
                url = f.file.url
                if request:
                    return request.build_absolute_uri(url)
                return url
        return None

    def get_enrollment_number(self, obj) -> str:
        num = _extract_from_prof_values(obj.profession_field_values or {}, ("enrollment_number", "bar_number", "reg_number", "membership_number"))
        return num or obj.reference_id

    def get_regulatory_body(self, obj) -> str:
        body = _extract_from_prof_values(obj.profession_field_values or {}, ("bar_council", "state_bar_council", "regulatory_body", "institute"))
        return body or "—"

    def get_submitted_by(self, obj) -> str | None:
        if obj.user_id and obj.user:
            return obj.user.email
        return None

    def _titles_map(self, model, ids: list) -> list[dict]:
        if not ids:
            return []
        rows = model.objects.filter(pk__in=ids).values("id", "name")
        return [{"id": str(r["id"]), "name": r["name"]} for r in rows]

    def get_categories(self, obj) -> list[dict]:
        if obj.category:
            return [{"id": str(obj.category.id), "name": obj.category.name}]
        return self._titles_map(Category, obj.selected_category_ids or [])

    def get_groups(self, obj) -> list[dict]:
        if obj.group:
            return [{"id": str(obj.group.id), "name": obj.group.name}]
        return self._titles_map(Group, obj.selected_group_ids or [])

    def get_professions(self, obj) -> list[dict]:
        if obj.profession:
            return [{"id": str(obj.profession.id), "name": obj.profession.name}]
        return self._titles_map(Profession, obj.selected_profession_ids or [])
