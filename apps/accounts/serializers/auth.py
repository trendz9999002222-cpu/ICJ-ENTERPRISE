from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    mobile = serializers.CharField(source="phone_number", read_only=True)
    roles = serializers.SerializerMethodField()
    professions = serializers.SerializerMethodField()
    membership = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "roles",
            "professions",
            "membership",
            "phone_number",
            "mobile",
            "password_change_required",
            "email_verified",
            "is_staff",
            "is_active",
        )
        read_only_fields = fields

    def get_roles(self, user) -> list[str]:
        return user.get_all_roles()

    def get_professions(self, user) -> list[dict]:
        res = []
        try:
            subs = user.professional_registration_submissions.all().select_related(
                "category", "group", "profession"
            ).prefetch_related("files")
            for s in subs:
                file_list = []
                for f in s.files.all():
                    file_list.append({
                        "id": str(f.id),
                        "document_key": f.document_key,
                        "original_name": f.original_name,
                        "size_bytes": f.size_bytes,
                        "url": f.file.url if f.file else "",
                    })
                prof_name = s.profession.name if s.profession else ""
                is_advocate = any(kw in prof_name.lower() for kw in ["advocate", "lawyer", "vakil", "legal"])
                res.append({
                    "registration_id": str(s.id),
                    "reference_id": s.reference_id,
                    "category_name": s.category.name if s.category else "",
                    "group_name": s.group.name if s.group else "",
                    "profession_name": prof_name,
                    "is_advocate": is_advocate,
                    "status": s.status,
                    "common_field_values": s.common_field_values or {},
                    "profession_field_values": s.profession_field_values or {},
                    "files": file_list,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                })
        except Exception:
            pass
        return res


    def get_membership(self, user) -> dict | None:
        try:
            app = user.membership_applications.filter(
                status="approved"
            ).select_related("membership_type").first()
            if app:
                return {
                    "application_id": str(app.id),
                    "reference_id": app.reference_id,
                    "membership_type": app.membership_type.name if app.membership_type else "Standard",
                    "status": app.status,
                }
        except Exception:
            pass
        return None


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    delivery_channel = serializers.CharField(required=False, allow_blank=True)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "phone_number")

