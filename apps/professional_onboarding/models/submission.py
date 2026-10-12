import os
import uuid

from django.conf import settings
from django.db import models

from .category import Category
from .group import Group
from .profession import Profession


def submission_file_upload_to(instance: "ProfessionalRegistrationSubmissionFile", filename: str) -> str:
    from django.utils import timezone

    ext = os.path.splitext(filename)[1].lower()[:12]
    safe = f"{uuid.uuid4().hex}{ext}"
    year = timezone.now().year
    ref = instance.submission.reference_id if instance.submission_id else "pending"
    return f"professional-onboarding/{year}/{ref}/{instance.document_key}/{safe}"


class ProfessionalRegistrationSubmission(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        UNDER_REVIEW = "under_review", "Under review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_id = models.CharField(max_length=32, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="professional_registration_submissions",
    )
    idempotency_key = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="registration_submissions")
    group = models.ForeignKey(Group, on_delete=models.PROTECT, related_name="registration_submissions")
    profession = models.ForeignKey(Profession, on_delete=models.PROTECT, related_name="registration_submissions")
    common_field_values = models.JSONField(default=dict)
    profession_field_values = models.JSONField(default=dict)
    selected_category_ids = models.JSONField(default=list)
    selected_group_ids = models.JSONField(default=list)
    selected_profession_ids = models.JSONField(default=list)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["user", "created_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "idempotency_key"],
                condition=models.Q(idempotency_key__isnull=False) & models.Q(user__isnull=False),
                name="professional_onboarding_submission_user_idempotency",
            ),
        ]


class ProfessionalRegistrationSubmissionFile(models.Model):
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        ProfessionalRegistrationSubmission,
        on_delete=models.CASCADE,
        related_name="files",
    )
    document_key = models.CharField(max_length=64, db_index=True)
    profession_document_id = models.UUIDField(null=True, blank=True)
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120, blank=True)
    size_bytes = models.PositiveBigIntegerField(default=0)
    file = models.FileField(upload_to=submission_file_upload_to)
    uploaded_at = models.DateTimeField(auto_now_add=True)
