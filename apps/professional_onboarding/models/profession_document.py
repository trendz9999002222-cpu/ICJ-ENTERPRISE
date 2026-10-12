import uuid

from django.db import models

from .document import Document
from .profession import Profession


class ProfessionDocument(models.Model):
    """Links a catalog Document to a Profession with requirement and display settings."""

    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profession = models.ForeignKey(
        Profession,
        on_delete=models.CASCADE,
        related_name="profession_documents",
    )
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="profession_assignments",
    )
    is_required = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    instructions = models.TextField(
        blank=True,
        help_text="Guidance shown to the professional, e.g. upload a clear scanned copy.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "document__name")
        constraints = [
            models.UniqueConstraint(
                fields=("profession", "document"),
                name="professional_onboarding_professiondocument_unique_per_profession",
            ),
        ]
        indexes = [
            models.Index(fields=["profession", "is_active", "display_order"]),
            models.Index(fields=["profession", "document"]),
        ]

    def __str__(self) -> str:
        req = "required" if self.is_required else "optional"
        return f"{self.profession.name} — {self.document.name} ({req})"
