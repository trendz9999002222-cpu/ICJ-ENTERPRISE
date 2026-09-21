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


class ProfessionalRegistrationSubmissionListSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
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
            "categories",
            "groups",
            "professions",
            "status",
            "created_at",
        )

    def get_applicant_name(self, obj) -> str:
        name, _ = _applicant_from_common(obj.common_field_values or {})
        return name or "—"

    def get_email(self, obj) -> str:
        _, email = _applicant_from_common(obj.common_field_values or {})
        return email or "—"

    def _titles_for_ids(self, model, ids: list) -> list[str]:
        if not ids:
            return []
        names = model.objects.filter(pk__in=ids).values_list("name", flat=True)
        return list(names)

    def get_categories(self, obj) -> list[str]:
        return self._titles_for_ids(Category, obj.selected_category_ids or [])

    def get_groups(self, obj) -> list[str]:
        return self._titles_for_ids(Group, obj.selected_group_ids or [])

    def get_professions(self, obj) -> list[str]:
        return self._titles_for_ids(Profession, obj.selected_profession_ids or [])


class ProfessionalRegistrationSubmissionFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalRegistrationSubmissionFile
        fields = (
            "id",
            "document_key",
            "original_name",
            "content_type",
            "size_bytes",
            "uploaded_at",
        )


class ProfessionalRegistrationSubmissionDetailSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
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
            "categories",
            "groups",
            "professions",
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
        return self._titles_map(Category, obj.selected_category_ids or [])

    def get_groups(self, obj) -> list[dict]:
        return self._titles_map(Group, obj.selected_group_ids or [])

    def get_professions(self, obj) -> list[dict]:
        return self._titles_map(Profession, obj.selected_profession_ids or [])
