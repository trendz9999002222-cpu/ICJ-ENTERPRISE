import uuid
from django.db import models
from django.utils import timezone


def application_document_upload_to(instance: "ApplicationDocument", filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "pdf"
    ref = instance.application.application_reference if instance.application else "doc"
    return f"applications/{ref}/{instance.document_key}_{uuid.uuid4().hex[:8]}.{ext}"


class ProfessionalApplication(models.Model):
    """
    Unified application model for all pathways:
    Legal Professional, Other Professional, and Volunteer.
    Persists structured core identity alongside schema-validated JSON attributes.
    """

    class Pathway(models.TextChoices):
        LEGAL_PROFESSIONAL = "legal_professional", "Legal Professional"
        OTHER_PROFESSIONAL = "other_professional", "Other Professional"
        VOLUNTEER = "volunteer", "Volunteer"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending Submission"
        UNDER_REVIEW = "under_review", "Under Review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        INFO_REQUESTED = "info_requested", "Additional Information Requested"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="professional_applications",
    )
    application_reference = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="Unique reference code, e.g. APP-2026-00042",
    )
    pathway = models.CharField(
        max_length=32,
        choices=Pathway.choices,
        db_index=True,
    )
    category = models.CharField(
        max_length=64,
        db_index=True,
        help_text="Category slug matching frontend JSON schema, e.g. 'advocate', 'ca', 'default'",
    )
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    # Validated category and profile attributes
    personal_data = models.JSONField(default=dict, blank=True)
    professional_data = models.JSONField(default=dict, blank=True)
    category_data = models.JSONField(default=dict, blank=True)

    # Reviewer tracking & notes
    rejection_reason = models.TextField(blank=True, default="")
    info_request_note = models.TextField(blank=True, default="")
    reviewed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_applications",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["pathway", "category", "status"]),
        ]

    def __str__(self) -> str:
        return f"{self.application_reference} ({self.get_pathway_display()} - {self.category})"


class ApplicationDocument(models.Model):
    """Supporting document uploaded with an application."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(
        ProfessionalApplication,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    document_key = models.CharField(max_length=100)
    document_title = models.CharField(max_length=200, blank=True, default="")
    file = models.FileField(upload_to=application_document_upload_to)
    file_name = models.CharField(max_length=255, blank=True, default="")
    file_size_bytes = models.BigIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("uploaded_at",)

    def __str__(self) -> str:
        return f"{self.document_key} for {self.application.application_reference}"


class ApplicationReviewHistory(models.Model):
    """Immutable audit trail of review actions on an application."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(
        ProfessionalApplication,
        on_delete=models.CASCADE,
        related_name="review_history",
    )
    action = models.CharField(max_length=50)
    actor = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self) -> str:
        return f"{self.action} on {self.application.application_reference} at {self.created_at}"

