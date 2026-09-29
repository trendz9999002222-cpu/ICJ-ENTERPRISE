from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Single user model for all ICJ roles (auth is common; access is role-based)."""

    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        ADMIN = "admin", "Admin"
        ADVOCATE = "advocate", "Advocate"
        PROFESSIONAL = "professional", "Professional"
        CLIENT = "client", "Client"
        MEMBER = "member", "Member"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.MEMBER)
    phone_number = models.CharField(max_length=20, blank=True)
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
        Compute all active roles a user possesses across memberships and professional registrations.
        """
        roles = set()
        if self.role:
            # Map legacy 'client' to 'professional'
            norm_role = "professional" if self.role == "client" else self.role
            roles.add(norm_role)

        if self.is_admin_role:
            roles.add("admin")

        # Check for approved professional registrations
        try:
            pro_subs = self.professional_registration_submissions.filter(status="approved").select_related("profession")
            for sub in pro_subs:
                prof_name = sub.profession.name.lower() if sub.profession else ""
                if "advocate" in prof_name or "lawyer" in prof_name or "vakil" in prof_name:
                    roles.add("advocate")
                else:
                    roles.add("professional")
        except Exception:
            pass

        # Check for approved membership applications
        try:
            if self.membership_applications.filter(status="approved").exists():
                roles.add("member")
        except Exception:
            pass

        return sorted(list(roles))
