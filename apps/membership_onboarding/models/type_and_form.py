import uuid

from django.conf import settings
from django.db import models


class MembershipType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=80, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")

    def __str__(self) -> str:
        return self.name


class MembershipForm(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    membership_type = models.ForeignKey(
        MembershipType,
        on_delete=models.CASCADE,
        related_name="forms",
    )
    title = models.CharField(max_length=200, default="Membership Application Form")
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    class Meta:
        ordering = ("-version",)
        constraints = [
            models.UniqueConstraint(
                fields=["membership_type", "version"],
                name="membership_form_type_version_unique",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.membership_type.name} v{self.version}"
