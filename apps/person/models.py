import uuid

from django.conf import settings
from django.db import models


class Person(models.Model):
    """Central person profile — one person, many roles (membership, professional, etc.)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="person_profile",
    )
    full_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(max_length=254, blank=True, db_index=True)
    mobile = models.CharField(max_length=32, blank=True, db_index=True)
    date_of_birth = models.DateField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["mobile"]),
        ]

    def __str__(self) -> str:
        return self.full_name or self.email or str(self.id)
