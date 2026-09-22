"""
Admin-facing user serializers.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


def _compute_status(user) -> str:
    """Derive a display status from user fields."""
    if not user.is_active:
        return "inactive"
    return "active"


class AdminUserListSerializer(serializers.ModelSerializer):
    """Compact list serializer used in GET /admin/users/."""

    full_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    mobile = serializers.CharField(source="phone_number", read_only=True)
    is_verified = serializers.BooleanField(source="email_verified", read_only=True)
    category_name = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()
    profession_name = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    professions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "mobile",
            "status",
            "is_verified",
            "category_name",
            "group_name",
            "profession_name",
            "categories",
            "groups",
            "professions",
            "date_joined",
            "last_login",
            "is_active",
        )

    def get_full_name(self, user) -> str:
        return user.get_full_name() or user.username or user.email.split("@")[0]

    def get_status(self, user) -> str:
        return _compute_status(user)

    def _get_submissions(self, user):
        if hasattr(user, "_cached_submissions"):
            return user._cached_submissions
        submissions = list(
            user.professional_registration_submissions.select_related(
                "category", "group", "profession"
            ).order_by("-created_at")
        )
        user._cached_submissions = submissions
        return submissions

    def get_category_name(self, user) -> str | None:
        subs = self._get_submissions(user)
        if subs and subs[0].category:
            return subs[0].category.name
        return None

    def get_group_name(self, user) -> str | None:
        subs = self._get_submissions(user)
        if subs and subs[0].group:
            return subs[0].group.name
        return None

    def get_profession_name(self, user) -> str | None:
        subs = self._get_submissions(user)
        if subs and subs[0].profession:
            return subs[0].profession.name
        return None

    def get_categories(self, user) -> list[dict]:
        subs = self._get_submissions(user)
        seen = {}
        for s in subs:
            if s.category_id and s.category:
                seen[str(s.category.id)] = {"id": str(s.category.id), "name": s.category.name}
        return list(seen.values())

    def get_groups(self, user) -> list[dict]:
        subs = self._get_submissions(user)
        seen = {}
        for s in subs:
            if s.group_id and s.group:
                seen[str(s.group.id)] = {"id": str(s.group.id), "name": s.group.name}
        return list(seen.values())

    def get_professions(self, user) -> list[dict]:
        subs = self._get_submissions(user)
        seen = {}
        for s in subs:
            if s.profession_id and s.profession:
                seen[str(s.profession.id)] = {"id": str(s.profession.id), "name": s.profession.name}
        return list(seen.values())


class AdminUserDetailSerializer(AdminUserListSerializer):
    """Full detail serializer for GET /admin/users/:id/."""

    class Meta(AdminUserListSerializer.Meta):
        fields = AdminUserListSerializer.Meta.fields + (
            "password_change_required",
            "is_staff",
            "is_superuser",
        )


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Partial update — admin can change role, phone, name."""

    class Meta:
        model = User
        fields = ("first_name", "last_name", "phone_number", "role")
