from datetime import date
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

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
        LEGAL_PROFESSIONAL = "legal_professional", "Legal Professional"
        OTHER_PROFESSIONAL = "other_professional", "Other Professional"
        VOLUNTEER = "volunteer", "Volunteer"
        MEMBER = "member", "Member"
        CLIENT = "client", "Client / Assistance Applicant"
        # Backward-compatibility alias for legacy data
        PROFESSIONAL = "professional", "Professional (Legacy)"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.MEMBER)
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True, default="")
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

    @property
    def is_legal_professional(self) -> bool:
        return self.role in {self.Role.LEGAL_PROFESSIONAL, self.Role.PROFESSIONAL}

    @property
    def is_other_professional(self) -> bool:
        return self.role == self.Role.OTHER_PROFESSIONAL

    @property
    def is_volunteer(self) -> bool:
        return self.role == self.Role.VOLUNTEER

    @property
    def is_approved_professional(self) -> bool:
        """Module access guard: strictly verifies approved status before granting access."""
        if self.is_admin_role:
            return True

        # Check unified applications
        try:
            if hasattr(self, "professional_applications") and self.professional_applications.filter(status="approved").exists():
                return True
        except Exception:
            pass

        # Check legacy submissions
        try:
            if hasattr(self, "professional_registration_submissions") and self.professional_registration_submissions.filter(status="approved").exists():
                return True
        except Exception:
            pass

        return False

    @property
    def calculated_age(self) -> int | None:
        if not self.date_of_birth:
            return None
        today = timezone.localdate()
        dob = self.date_of_birth
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    def get_all_roles(self) -> list[str]:
        """
        Returns all authorized platform roles for the user.
        """
        roles: set[str] = set()
        norm = normalize_platform_role(self.role)
        if norm:
            roles.add(norm)
        if self.is_admin_role:
            roles.add("admin")
            roles.add("super_admin")

        # Application approvals extend permitted roles
        try:
            if hasattr(self, "professional_applications"):
                for app in self.professional_applications.filter(status="approved"):
                    roles.add(app.pathway)
        except Exception:
            pass

        try:
            if self.professional_registration_submissions.filter(status="approved").exists():
                roles.add("legal_professional")
                roles.add("professional")
        except Exception:
            pass

        try:
            if self.membership_applications.filter(status="approved").exists():
                roles.add("member")
        except Exception:
            pass

        return normalize_platform_roles(sorted(roles))

    def get_profile_completion_status(self) -> dict:
        """
        Evaluates profile completion percentage and returns actionable missing items.
        """
        required_items = [
            ("first_name", "First Name", bool(self.first_name and self.first_name.strip()), "/dashboard/profile"),
            ("last_name", "Last Name", bool(self.last_name and self.last_name.strip()), "/dashboard/profile"),
            ("email", "Email Address", bool(self.email and self.email.strip()), "/dashboard/profile"),
            ("phone_number", "Mobile Number", bool(self.phone_number and self.phone_number.strip()), "/dashboard/profile"),
            ("date_of_birth", "Date of Birth", bool(self.date_of_birth), "/dashboard/profile"),
            ("address", "Postal Address", bool(self.address and self.address.strip()), "/dashboard/profile"),
            ("profile_picture", "Profile Picture", bool(self.profile_picture), "/dashboard/profile"),
        ]

        completed_count = sum(1 for _, _, done, _ in required_items if done)
        total_count = len(required_items)
        percentage = round((completed_count / total_count) * 100)
        missing_fields = [
            {"key": key, "label": label, "step_url": url}
            for key, label, done, url in required_items
            if not done
        ]

        active_application = None
        try:
            if hasattr(self, "professional_applications"):
                latest_app = self.professional_applications.order_by("-created_at").first()
                if latest_app:
                    active_application = {
                        "reference_id": latest_app.application_reference,
                        "pathway": latest_app.pathway,
                        "category": latest_app.category,
                        "status": latest_app.status,
                        "submitted_at": latest_app.created_at.isoformat(),
                    }
        except Exception:
            pass

        return {
            "completion_percentage": percentage,
            "is_complete": percentage == 100,
            "missing_fields": missing_fields,
            "active_application": active_application,
        }
