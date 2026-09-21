from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Single user model for all ICJ roles (auth is common; access is role-based)."""

    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        ADMIN = "admin", "Admin"
        ADVOCATE = "advocate", "Advocate"
        CLIENT = "client", "Client"
        MEMBER = "member", "Member"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.MEMBER)
    phone_number = models.CharField(max_length=20, blank=True)
    password_change_required = models.BooleanField(default=False)
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
