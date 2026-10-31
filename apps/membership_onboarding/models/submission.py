import os
import uuid

from django.conf import settings
from django.db import models

from .type_and_form import MembershipForm, MembershipType
# pyrefly: ignore [missing-import]
from apps.person.models import Person


def application_file_upload_to(instance: "MembershipApplicationDocument", filename: str) -> str:
    from django.utils import timezone

    ext = os.path.splitext(filename)[1].lower()[:12]
    safe = f"{uuid.uuid4().hex}{ext}"
    year = timezone.now().year
    ref = instance.application.reference_id if instance.application_id else "pending"
    return f"membership-onboarding/{year}/{ref}/{instance.document_key}/{safe}"


# Legacy migration reference
membership_file_upload_to = application_file_upload_to


class MembershipReferenceCounter(models.Model):
    year = models.PositiveIntegerField(unique=True)
    last_value = models.PositiveIntegerField(default=0)


class MembershipApplication(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending"
        UNDER_REVIEW = "under_review", "Under review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    class FeePaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PAID = "paid", "Paid"
        WAIVED = "waived", "Waived"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_id = models.CharField(max_length=32, unique=True, db_index=True)
    person = models.ForeignKey(
        Person,
        on_delete=models.PROTECT,
        related_name="membership_applications",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="membership_applications",
    )
    membership_type = models.ForeignKey(
        MembershipType,
        on_delete=models.PROTECT,
        related_name="applications",
        null=True,
        blank=True,
    )
    form = models.ForeignKey(
        MembershipForm,
        on_delete=models.PROTECT,
        related_name="applications",
        null=True,
        blank=True,
    )
    idempotency_key = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    field_values = models.JSONField(default=dict)
    declaration_accepted = models.BooleanField(default=False)
    declaration_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPROVED, db_index=True)
    fee_payment_status = models.CharField(
        max_length=20, choices=FeePaymentStatus.choices, default=FeePaymentStatus.UNPAID
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["user", "idempotency_key"],
                condition=models.Q(idempotency_key__isnull=False) & models.Q(user__isnull=False),
                name="membership_application_user_idempotency",
            ),
        ]


# Backward compatibility alias
MembershipSubmission = MembershipApplication


class MembershipSubmissionFile(models.Model):
    """Legacy file rows — prefer MembershipApplicationDocument."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        MembershipApplication,
        on_delete=models.CASCADE,
        related_name="legacy_files",
    )
    field_key = models.CharField(max_length=64, db_index=True)
    step = models.ForeignKey(
        "membership_onboarding.MembershipStep",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120, blank=True)
    size_bytes = models.PositiveBigIntegerField(default=0)
    file = models.FileField(upload_to=application_file_upload_to)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class MembershipApplicationDocument(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"
        EXPIRED = "expired", "Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(
        MembershipApplication,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    person = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True, blank=True, related_name="+")
    document_key = models.CharField(max_length=64, db_index=True)
    document_type = models.CharField(max_length=64, blank=True)
    document_number = models.CharField(max_length=120, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120, blank=True)
    size_bytes = models.PositiveBigIntegerField(default=0)
    file = models.FileField(upload_to=application_file_upload_to)
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    verification_date = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
