from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.accounts.role_utils import normalize_platform_role, normalize_platform_roles


def user_profile_picture_upload_to(instance: "User", filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        ext = "jpg"
    return f"users/{instance.pk or 'new'}/profile.{ext}"


class User(AbstractUser):
    """Single user model for all ICJ roles (auth is common; access is role-based)."""

    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        ADMIN = "admin", "Admin"
        PROFESSIONAL = "professional", "Professional"
        MEMBER = "member", "Member"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.MEMBER)
    phone_number = models.CharField(max_length=20, blank=True)
    profile_picture = models.FileField(
        upload_to=user_profile_picture_upload_to,
        blank=True,
        null=True,
    )
    password_change_required = models.BooleanField(default=False)
    last_temp_password = models.CharField(max_length=128, blank=True, default="")
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]

    def __str__(self) -> str:
        return self.email

    @property
    def is_admin_role(self) -> bool:
        return self.role in {self.Role.ADMIN, self.Role.SUPER_ADMIN}

    def get_all_roles(self) -> list[str]:
        """
        Platform roles only: admin, professional, member.
        """
        roles: set[str] = set()
        norm = normalize_platform_role(self.role)
        if norm:
            roles.add(norm)
        if self.is_admin_role:
            roles.add("admin")

        try:
            if self.professional_registration_submissions.filter(status="approved").exists():
                roles.add("professional")
        except Exception:
            pass

        try:
            if self.membership_applications.filter(status="approved").exists():
                roles.add("member")
        except Exception:
            pass

        return normalize_platform_roles(sorted(roles))
