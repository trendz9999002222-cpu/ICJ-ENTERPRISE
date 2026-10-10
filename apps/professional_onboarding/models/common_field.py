import uuid

from django.core.validators import RegexValidator
from django.db import models


class CommonField(models.Model):
    """Centrally managed onboarding fields, reusable across professions (assignment in a later step)."""

    class FieldType(models.TextChoices):
        TEXT = "text", "Text"
        TEXTAREA = "textarea", "Textarea"
        NUMBER = "number", "Number"
        EMAIL = "email", "Email"
        PHONE = "phone", "Phone"
        DATE = "date", "Date"
        SELECT = "select", "Select"
        RADIO = "radio", "Radio"
        CHECKBOX = "checkbox", "Checkbox"
        FILE = "file", "File"
        COUNTRY = "country", "Country"
        STATE = "state", "State"
        CITY = "city", "District"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120, help_text="Human-readable name for admin.")
    field_key = models.CharField(
        max_length=64,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^[a-z][a-z0-9_]*$",
                message="field_key must start with a letter and use lowercase letters, digits, and underscores only.",
            ),
        ],
        help_text="Stable API key, e.g. full_name, email, mobile_number.",
    )
    field_type = models.CharField(
        max_length=16,
        choices=FieldType.choices,
        db_index=True,
    )
    label = models.CharField(max_length=200, help_text="Label shown on the onboarding form.")
    placeholder = models.CharField(max_length=255, blank=True)
    help_text = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")
        indexes = [
            models.Index(fields=["is_active", "display_order"]),
            models.Index(fields=["field_type", "is_active"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.field_key})"
