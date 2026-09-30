import uuid

from django.conf import settings
from django.db import models


class MembershipFeeSettings(models.Model):
    """Singleton-style row: admin-editable membership fee (INR)."""

    amount_paise = models.PositiveIntegerField(default=49900, help_text="Fee in paise (100 paise = ₹1).")
    currency = models.CharField(max_length=3, default="INR")
    is_payment_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    class Meta:
        verbose_name = "Membership fee settings"
        verbose_name_plural = "Membership fee settings"

    @property
    def amount_inr(self) -> str:
        return f"{self.amount_paise / 100:.2f}"


class MembershipPayment(models.Model):
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    amount_paise = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="INR")
    razorpay_order_id = models.CharField(max_length=64, unique=True, db_index=True)
    razorpay_payment_id = models.CharField(max_length=64, blank=True, db_index=True)
    razorpay_signature = models.CharField(max_length=128, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.CREATED, db_index=True)
    application = models.OneToOneField(
        "membership_onboarding.MembershipApplication",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payment",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
