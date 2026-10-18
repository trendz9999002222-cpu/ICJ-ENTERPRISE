import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils import timezone


class Donation(models.Model):
    class Status(models.TextChoices):
        INITIATED = "INITIATED", "Initiated"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        REFUNDED = "REFUNDED", "Refunded"

    class FundCategory(models.TextChoices):
        LEGAL_AID = "LEGAL_AID", "Citizen Legal Aid & Court Representation Fund"
        CYBER_CRIME = "CYBER_CRIME", "Cyber Crime Victims & Awareness Fund"
        PRO_BONO = "PRO_BONO", "Pro Bono Litigant Assistance Fund"
        CORPUS_FUND = "CORPUS_FUND", "Trust Permanent Corpus Fund"
        GENERAL = "GENERAL", "General Trust Operations & Public Welfare"

    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trust_donations",
        help_text="Authenticated user who made the donation (any role)",
    )

    # Donor details
    donor_name = models.CharField(max_length=200)
    donor_email = models.EmailField(max_length=254)
    donor_phone = models.CharField(max_length=30, blank=True)
    donor_pan = models.CharField(max_length=20, blank=True, db_index=True, help_text="PAN for 80G Tax Exemption")
    donor_address = models.TextField(blank=True)
    donor_state = models.CharField(max_length=100, blank=True)
    donor_pincode = models.CharField(max_length=20, blank=True)

    # Financial details
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Amount in INR")
    currency = models.CharField(max_length=10, default="INR")
    fund_category = models.CharField(
        max_length=50,
        choices=FundCategory.choices,
        default=FundCategory.GENERAL,
        db_index=True,
    )
    is_anonymous = models.BooleanField(default=False)
    notes = models.TextField(blank=True, help_text="Dedication, message or purpose notes")

    # Gateway details
    gateway = models.CharField(max_length=50, default="easebuzz")
    easebuzz_txnid = models.CharField(max_length=120, unique=True, db_index=True)
    easebuzz_access_key = models.CharField(max_length=150, blank=True)
    easebuzz_payment_id = models.CharField(max_length=120, blank=True, db_index=True)
    easebuzz_hash = models.CharField(max_length=255, blank=True)
    payment_mode = models.CharField(max_length=50, blank=True, default="ONLINE")
    bank_ref_num = models.CharField(max_length=120, blank=True)
    raw_response = models.JSONField(default=dict, blank=True)

    # Status & Audit
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.INITIATED,
        db_index=True,
    )
    receipt_number = models.CharField(
        max_length=80,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text="Unique verifiable Trust receipt number",
    )
    is_80g_eligible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Trust Donation"
        verbose_name_plural = "Trust Donations"
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        receipt = self.receipt_number or self.easebuzz_txnid
        return f"Donation {receipt} - ₹{self.amount} ({self.status})"
