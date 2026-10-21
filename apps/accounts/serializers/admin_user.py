"""
Admin-facing user serializers.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.role_utils import normalize_platform_role, normalize_platform_roles

User = get_user_model()


def _compute_status(user) -> str:
    """Derive a display status from user fields."""
    if not user.is_active:
        return "inactive"
    return "active"


class AdminUserListSerializer(serializers.ModelSerializer):
    """Compact list serializer used in GET /admin/users/."""

    role = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    mobile = serializers.CharField(source="phone_number", read_only=True)
    is_verified = serializers.BooleanField(source="email_verified", read_only=True)
    temp_password = serializers.CharField(source="last_temp_password", read_only=True)
    password_change_required = serializers.BooleanField(read_only=True)
    category_name = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()
    profession_name = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
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
            "roles",
            "mobile",
            "profile_picture_url",
            "photo_url",
            "temp_password",
            "password_change_required",
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

    def get_role(self, user) -> str:
        return normalize_platform_role(user.role) or "member"

    def get_roles(self, user) -> list[str]:
        return normalize_platform_roles(user.get_all_roles())

    def get_full_name(self, user) -> str:
        return user.get_full_name() or user.username or user.email.split("@")[0]

    def get_status(self, user) -> str:
        return _compute_status(user)

    def get_profile_picture_url(self, user) -> str | None:
        request = self.context.get("request")
        if getattr(user, "profile_picture", None):
            try:
                if user.profile_picture:
                    url = user.profile_picture.url
                    return request.build_absolute_uri(url) if request else url
            except Exception:
                pass
        # Fallback to professional onboarding submission photo
        try:
            subs = user.professional_registration_submissions.all().prefetch_related("files")
            for s in subs:
                for f in s.files.all():
                    k = (f.document_key or "").lower().strip()
                    if (
                        k in ("photo", "profile_photo", "passport_photo", "avatar", "photograph", "profile_picture", "profile_image", "user_photo")
                        or (f.content_type and f.content_type.startswith("image/") and "photo" in k)
                    ):
                        try:
                            if f.file:
                                url = f.file.url
                                return request.build_absolute_uri(url) if request else url
                        except Exception:
                            pass
        except Exception:
            pass
        return None

    def get_photo_url(self, user) -> str | None:
        return self.get_profile_picture_url(user)

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

    def get_categories(self, user) -> list[dict]:
        subs = self._get_submissions(user)
        seen = {}
        from apps.professional_onboarding.models import Category
        for s in subs:
            cat_ids = s.selected_category_ids or ([str(s.category_id)] if s.category_id else [])
            for c in Category.objects.filter(pk__in=cat_ids):
                seen[str(c.id)] = {"id": str(c.id), "name": c.name}
        return list(seen.values())

    def get_groups(self, user) -> list[dict]:
        subs = self._get_submissions(user)
        seen = {}
        from apps.professional_onboarding.models import Group
        for s in subs:
            grp_ids = s.selected_group_ids or ([str(s.group_id)] if s.group_id else [])
            for g in Group.objects.filter(pk__in=grp_ids):
                seen[str(g.id)] = {"id": str(g.id), "name": g.name}
        return list(seen.values())

    def get_professions(self, user) -> list[dict]:
        subs = self._get_submissions(user)
        seen = {}
        from apps.professional_onboarding.models import Profession
        for s in subs:
            prof_ids = s.selected_profession_ids or ([str(s.profession_id)] if s.profession_id else [])
            for p in Profession.objects.filter(pk__in=prof_ids):
                seen[str(p.id)] = {"id": str(p.id), "name": p.name}
        return list(seen.values())

    def get_category_name(self, user) -> str | None:
        cats = self.get_categories(user)
        return ", ".join(c["name"] for c in cats) if cats else None

    def get_group_name(self, user) -> str | None:
        grps = self.get_groups(user)
        return ", ".join(g["name"] for g in grps) if grps else None

    def get_profession_name(self, user) -> str | None:
        profs = self.get_professions(user)
        return ", ".join(p["name"] for p in profs) if profs else None


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

    def validate_phone_number(self, value):
        if value:
            from apps.accounts.services.identity_checks import check_duplicate_phone
            user = self.instance
            err = check_duplicate_phone(value, current_user=user, check_applications=False)
            if err:
                raise serializers.ValidationError(err)
        return value
