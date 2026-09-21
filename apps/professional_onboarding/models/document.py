import uuid

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.db import models

DOCUMENT_KEY_VALIDATOR = RegexValidator(
    regex=r"^[a-z][a-z0-9_]*$",
    message="document_key must start with a letter and use lowercase letters, digits, and underscores only.",
)


class Document(models.Model):
    """Central catalog of uploadable document types (reused across professions via ProfessionDocument)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    document_key = models.CharField(
        max_length=64,
        unique=True,
        validators=[DOCUMENT_KEY_VALIDATOR],
        help_text="Stable API key, e.g. identity_proof, bar_council_certificate.",
    )
    description = models.TextField(blank=True)
    allowed_file_types = models.JSONField(
        default=list,
        help_text='JSON list of allowed extensions or MIME types, e.g. ["pdf", "image/jpeg"].',
    )
    max_file_size_mb = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(50)],
        help_text="Maximum upload size in megabytes (1–50).",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")
        indexes = [
            models.Index(fields=["is_active", "display_order"]),
            models.Index(fields=["document_key"]),
        ]

    def clean(self) -> None:
        if not isinstance(self.allowed_file_types, list):
            raise ValidationError({"allowed_file_types": "Must be a JSON array."})
        if not self.allowed_file_types:
            raise ValidationError({"allowed_file_types": "At least one file type must be configured."})
        for item in self.allowed_file_types:
            if not isinstance(item, str) or not item.strip():
                raise ValidationError(
                    {"allowed_file_types": "Each entry must be a non-empty string (extension or MIME type)."}
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.name} ({self.document_key})"
