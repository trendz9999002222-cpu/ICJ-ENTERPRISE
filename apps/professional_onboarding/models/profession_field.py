import uuid

from django.core.validators import RegexValidator
from django.db import models

from apps.professional_onboarding.models.common_field import CommonField
from apps.professional_onboarding.models.profession import Profession

FIELD_KEY_VALIDATOR = RegexValidator(
    regex=r"^[a-z][a-z0-9_]*$",
    message="field_key must start with a letter and use lowercase letters, digits, and underscores only.",
)


class ProfessionField(models.Model):
    """Profession-specific onboarding fields (separate from the CommonField catalog)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profession = models.ForeignKey(
        Profession,
        on_delete=models.CASCADE,
        related_name="profession_fields",
    )
    name = models.CharField(max_length=120, help_text="Human-readable name for admin.")
    field_key = models.CharField(
        max_length=64,
        validators=[FIELD_KEY_VALIDATOR],
        help_text="Stable key within this profession, e.g. bar_council_number.",
    )
    field_type = models.CharField(
        max_length=16,
        choices=CommonField.FieldType.choices,
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
        constraints = [
            models.UniqueConstraint(
                fields=("profession", "field_key"),
                name="professional_onboarding_professionfield_unique_key_per_profession",
            ),
        ]
        indexes = [
            models.Index(fields=["profession", "is_active", "display_order"]),
            models.Index(fields=["profession", "field_key"]),
        ]

    def __str__(self) -> str:
        return f"{self.profession.name} — {self.name} ({self.field_key})"
