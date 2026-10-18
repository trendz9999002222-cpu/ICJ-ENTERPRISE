import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone


class LeadCommercialSettings(models.Model):
    """
    Singleton configuration for Lead Marketplace commercial and compliance parameters.
    Default compliance requirement: paid lead unlocking is DISABLED until legal approval.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paid_unlock_enabled = models.BooleanField(
        default=False,
        help_text="Compliance flag: Must remain False until formal legal & Bar Council clearance.",
    )
    default_lead_price_paise = models.PositiveIntegerField(
        default=100000,
        help_text="Default lead price in integer paise (100000 paise = ₹1,000).",
    )
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("18.00"),
        help_text="Applicable GST or tax percentage.",
    )
    reservation_timeout_minutes = models.PositiveIntegerField(
        default=10,
        help_text="Hold duration for exclusive checkout reservation.",
    )
    allow_wallet_payment = models.BooleanField(default=True)
    allow_lead_credit_payment = models.BooleanField(default=True)
    allow_direct_payment = models.BooleanField(default=True)
    compliance_notice = models.TextField(
        default=(
            "Commercial lead acquisition is currently disabled pending regulatory compliance review. "
            "Leads may be reviewed in preview mode or allocated via approved non-commercial assignment."
        )
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="commercial_settings_updates",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Lead Commercial Settings"
        verbose_name_plural = "Lead Commercial Settings"

    @classmethod
    def get_settings(cls) -> "LeadCommercialSettings":
        obj, _ = cls.objects.get_or_create(
            defaults={
                "paid_unlock_enabled": False,
                "default_lead_price_paise": 100000,
                "tax_percentage": Decimal("18.00"),
                "reservation_timeout_minutes": 10,
            }
        )
        return obj

    def __str__(self):
        status_text = "ENABLED" if self.paid_unlock_enabled else "DISABLED"
        return f"Commercial Settings (Paid Unlocking: {status_text}, Default: ₹{self.default_lead_price_paise / 100:.2f})"


class LeadPricingRule(models.Model):
    """
    Pricing rules and overrides by category, urgency, or custom promotion.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=200, blank=True, help_text="Specific legal category or blank for all")
    urgency = models.CharField(max_length=50, blank=True, help_text="Urgency level or blank for all")
    base_price_paise = models.PositiveIntegerField(default=100000)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("18.00"))
    is_active = models.BooleanField(default=True, db_index=True)
    effective_from = models.DateTimeField(default=timezone.now)
    effective_to = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.name} - ₹{self.base_price_paise / 100:.2f}"


class Lead(models.Model):
    """
    Lead record representing an anonymized legal assistance inquiry published to the marketplace.
    """
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING_REVIEW = "pending_review", "Pending Review"
        PUBLISHED = "published", "Published"
        RESERVED = "reserved", "Reserved (Checkout in progress)"
        ACCEPTED = "accepted", "Accepted (Exclusive)"
        UNAVAILABLE = "unavailable", "Unavailable"
        REJECTED = "rejected", "Rejected"
        CLOSED = "closed", "Closed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead_id = models.CharField(max_length=60, unique=True, db_index=True)
    assistance_request = models.OneToOneField(
        "services.AssistanceRequest",
        on_delete=models.CASCADE,
        related_name="marketplace_lead",
        null=True,
        blank=True,
    )
    legal_case = models.OneToOneField(
        "services.LegalCase",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="marketplace_lead",
    )
    category = models.CharField(max_length=200, db_index=True)
    urgency = models.CharField(max_length=50, default="Medium", db_index=True)
    state_name = models.CharField(max_length=100, db_index=True)
    city_name = models.CharField(max_length=100, db_index=True)
    anonymized_summary = models.TextField(help_text="Safe, anonymized matter description for public marketplace.")
    full_description = models.TextField(blank=True, help_text="Confidential full details (unlocked only upon acceptance).")
    
    # Financial fields (integer paise)
    price_paise = models.PositiveIntegerField(default=100000, help_text="Price in integer paise at publication")
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("18.00"))
    tokens_required = models.PositiveIntegerField(default=1, help_text="Tokens required to accept this lead")

    # Assignment & Handover tracking (Preserved across professional reassignments)
    assigned_professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_marketplace_leads",
    )
    case_stage = models.CharField(max_length=100, default="New", help_text="Ongoing stage of the matter")
    case_notes = models.TextField(blank=True, help_text="Cumulative case progress notes and work history")
    reassignment_notes = models.TextField(blank=True, help_text="Handover notes preserved across reassignments")
    client_documents = models.JSONField(default=list, blank=True, help_text="Document links or metadata for this lead")
    
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING_REVIEW, db_index=True)
    client_consent_given = models.BooleanField(default=True)
    is_exclusive = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["category", "state_name"]),
        ]

    def __str__(self):
        return f"{self.lead_id} ({self.category} - {self.status})"

    @property
    def price_inr(self) -> float:
        return round(self.price_paise / 100, 2)

    @property
    def acceptance(self):
        return self.acceptances.filter(status=LeadAcceptance.Status.ACTIVE).first()


class LeadPublication(models.Model):
    """
    Audit record of lead publication/unpublication by administrators.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="publications")
    published_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="published_leads")
    published_at = models.DateTimeField(default=timezone.now)
    unpublished_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("-published_at",)


class LeadReservation(models.Model):
    """
    Short-lived reservation lock during professional checkout.
    Ensures only one professional can attempt checkout on an exclusive lead at a time.
    """
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        CONSUMED = "consumed", "Consumed (Accepted)"
        RELEASED = "released", "Released (Cancelled/Failed)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="reservations")
    professional = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lead_reservations")
    idempotency_key = models.CharField(max_length=120, unique=True, db_index=True)
    reserved_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True)

    class Meta:
        ordering = ("-reserved_at",)
        indexes = [
            models.Index(fields=["lead", "status", "expires_at"]),
        ]

    def is_valid(self) -> bool:
        return self.status == self.Status.ACTIVE and timezone.now() < self.expires_at


class LeadAcceptance(models.Model):
    """
    Permanent, auditable record of lead acceptance by an eligible professional.
    """
    class PaymentMethod(models.TextChoices):
        WALLET = "wallet", "ICJ Wallet"
        LEAD_CREDIT = "lead_credit", "Lead Credit Subscription"
        DIRECT_PAYMENT = "direct_payment", "Direct Gateway Payment"
        NON_COMMERCIAL = "non_commercial", "Approved Non-Commercial Allocation"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        RELEASED = "released", "Released"
        REFUNDED = "refunded", "Refunded"
        REASSIGNED = "reassigned", "Reassigned"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="acceptances")
    professional = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="accepted_leads")
    accepted_at = models.DateTimeField(default=timezone.now, db_index=True)
    payment_method = models.CharField(max_length=30, choices=PaymentMethod.choices)
    price_paid_paise = models.PositiveIntegerField(default=0)
    tokens_spent = models.PositiveIntegerField(default=1, help_text="Number of tokens spent for this lead")
    receipt_reference = models.CharField(max_length=100, unique=True, db_index=True)
    client_contact_unlocked = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("-accepted_at",)


class LeadActivity(models.Model):
    """
    Audit log of all actions on a specific lead.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="activities")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=60, db_index=True)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)


class ProfessionalWallet(models.Model):
    """
    Token and payment wallet account for an eligible verified professional.
    Professional accepts leads exclusively using tokens.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    professional = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="icj_wallet")
    currency = models.CharField(max_length=10, default="INR")
    token_balance = models.PositiveIntegerField(default=0, help_text="Available lead tokens")
    total_tokens_purchased = models.PositiveIntegerField(default=0)
    total_tokens_spent = models.PositiveIntegerField(default=0)
    balance_paise = models.PositiveIntegerField(default=0, help_text="Available balance in integer paise")
    reserved_paise = models.PositiveIntegerField(default=0, help_text="Held/reserved balance during checkout")
    total_added_paise = models.PositiveIntegerField(default=0)
    total_spent_paise = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet ({self.professional.email}) - Tokens: {self.token_balance}, Balance: ₹{self.balance_paise / 100:.2f}"

    @property
    def available_paise(self) -> int:
        return max(0, self.balance_paise - self.reserved_paise)

    @property
    def available_inr(self) -> float:
        return round(self.available_paise / 100, 2)


class WalletTransaction(models.Model):
    """
    Append-only immutable transaction ledger for professional wallets.
    """
    class TxType(models.TextChoices):
        CREDIT = "credit", "Credit (Top-up)"
        DEBIT = "debit", "Debit (Lead Acceptance)"
        REFUND = "refund", "Refund"
        ADJUSTMENT = "adjustment", "Admin Adjustment"
        HOLD = "hold", "Checkout Hold"
        HOLD_RELEASE = "hold_release", "Hold Release"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(ProfessionalWallet, on_delete=models.PROTECT, related_name="transactions")
    reference = models.CharField(max_length=80, unique=True, db_index=True)
    tx_type = models.CharField(max_length=20, choices=TxType.choices, db_index=True)
    amount_paise = models.PositiveIntegerField(default=0, help_text="Always positive integer paise")
    balance_after_paise = models.PositiveIntegerField(default=0)
    tokens_delta = models.IntegerField(default=0, help_text="Positive for tokens credited, negative for spent")
    token_balance_after = models.PositiveIntegerField(default=0)
    description = models.CharField(max_length=255)
    idempotency_key = models.CharField(max_length=120, blank=True, null=True, unique=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)


class LeadCreditPlan(models.Model):
    """
    Configurable prepaid plans for purchasing lead credits.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.SlugField(max_length=100, unique=True)
    price_paise = models.PositiveIntegerField(help_text="Price in integer paise")
    credits_granted = models.PositiveIntegerField(default=1)
    validity_days = models.PositiveIntegerField(default=365, help_text="0 for unlimited validity")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "price_paise")

    def __str__(self):
        return f"{self.name} ({self.credits_granted} credits - ₹{self.price_paise / 100:.2f})"


class ProfessionalPlanPurchase(models.Model):
    """
    Lead credit plan instance purchased by a professional.
    """
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        EXHAUSTED = "exhausted", "Exhausted"
        EXPIRED = "expired", "Expired"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    professional = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="plan_purchases")
    plan = models.ForeignKey(LeadCreditPlan, on_delete=models.PROTECT, related_name="purchases")
    total_credits = models.PositiveIntegerField()
    remaining_credits = models.PositiveIntegerField()
    price_paid_paise = models.PositiveIntegerField()
    valid_until = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)


class LeadCreditLedger(models.Model):
    """
    Audit ledger tracking each consumption or grant of lead credits.
    """
    class EntryType(models.TextChoices):
        CREDIT_GRANTED = "granted", "Credits Granted"
        CREDIT_CONSUMED = "consumed", "Credit Consumed"
        CREDIT_RESTORED = "restored", "Credit Restored"
        CREDIT_EXPIRED = "expired", "Credit Expired"
        ADJUSTMENT = "adjustment", "Admin Adjustment"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    purchase = models.ForeignKey(ProfessionalPlanPurchase, on_delete=models.CASCADE, related_name="ledger_entries")
    professional = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="credit_ledger_entries")
    entry_type = models.CharField(max_length=20, choices=EntryType.choices)
    credits_delta = models.IntegerField(help_text="Positive for grant/restore, negative for consumption")
    balance_after = models.PositiveIntegerField()
    lead_acceptance = models.ForeignKey(LeadAcceptance, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)


class PaymentOrder(models.Model):
    """
    Represents an internal and gateway payment order (Razorpay / Mock).
    """
    class OrderType(models.TextChoices):
        WALLET_TOPUP = "wallet_topup", "Wallet Top-up"
        LEAD_ACCEPTANCE = "lead_acceptance", "Direct Lead Acceptance"
        PLAN_PURCHASE = "plan_purchase", "Lead Credit Plan Purchase"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending Checkout"
        SUCCESS = "success", "Payment Verified"
        FAILED = "failed", "Payment Failed"
        EXPIRED = "expired", "Order Expired"
        REFUNDED = "refunded", "Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_id = models.CharField(max_length=80, unique=True, db_index=True)
    gateway_order_id = models.CharField(max_length=100, unique=True, db_index=True)
    professional = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="payment_orders")
    order_type = models.CharField(max_length=30, choices=OrderType.choices)
    amount_paise = models.PositiveIntegerField()
    currency = models.CharField(max_length=10, default="INR")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True)
    plan = models.ForeignKey(LeadCreditPlan, on_delete=models.SET_NULL, null=True, blank=True)
    idempotency_key = models.CharField(max_length=120, blank=True, null=True, unique=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)


class PaymentTransaction(models.Model):
    """
    Verification record for received gateway transaction.
    """
    class Status(models.TextChoices):
        CAPTURED = "captured", "Captured"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(PaymentOrder, on_delete=models.PROTECT, related_name="transactions")
    gateway_payment_id = models.CharField(max_length=100, unique=True, db_index=True)
    gateway_signature = models.CharField(max_length=255, blank=True)
    amount_paise = models.PositiveIntegerField()
    payment_method = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CAPTURED)
    raw_payload = models.JSONField(default=dict, blank=True)
    verified_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)


class RefundRequest(models.Model):
    """
    Audit record for refund requests on lead acceptances or failed orders.
    """
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        PROCESSED = "processed", "Processed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead_acceptance = models.ForeignKey(LeadAcceptance, on_delete=models.SET_NULL, null=True, blank=True, related_name="refund_requests")
    payment_order = models.ForeignKey(PaymentOrder, on_delete=models.SET_NULL, null=True, blank=True)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="refund_requests")
    amount_paise = models.PositiveIntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_refunds")
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)


class LeadAuditLog(models.Model):
    """
    System-wide tamper-evident audit log for lead marketplace operations.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_type = models.CharField(max_length=50, db_index=True)
    entity_id = models.CharField(max_length=100, db_index=True)
    action = models.CharField(max_length=60, db_index=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)
