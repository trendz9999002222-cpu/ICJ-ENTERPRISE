import uuid
from typing import TYPE_CHECKING, Any

from django.db import models
from django.utils.text import slugify


class ServiceCategory(models.Model):
    """
    Categories for justice services.
    Examples: Specialized Law, Citizen Assistance, Dispute Resolution, etc.
    """

    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    value = models.CharField(
        max_length=60,
        unique=True,
        help_text="Machine-readable key, e.g. 'specialized_law', 'assistance'.",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")
        indexes = [
            models.Index(fields=["is_active", "display_order"]),
        ]
        verbose_name_plural = "service categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = str(slugify(self.name))  # type: ignore
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return str(self.name)


class JusticeService(models.Model):
    """
    Individual justice service offered by ICJ.
    All list fields (who_it_is_for, how_icj_helps, etc.) are stored as JSON arrays.
    """

    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    title = models.CharField(max_length=200)
    short_description = models.TextField()
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.PROTECT,
        related_name="services",
    )
    icon_name = models.CharField(
        max_length=60,
        blank=True,
        help_text="MUI icon name, e.g. 'HomeWork', 'Security'.",
    )
    who_it_is_for = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of strings describing target audience.",
    )
    how_icj_helps = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of strings describing how ICJ assists.",
    )
    available_assistance = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of assistance types offered.",
    )
    next_steps = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of procedural next steps.",
    )
    related_professionals = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of related professional types.",
    )
    is_featured = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "title")
        indexes = [
            models.Index(fields=["is_active", "display_order"]),
            models.Index(fields=["is_active", "is_featured"]),
            models.Index(fields=["category", "is_active"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = str(slugify(self.title))  # type: ignore
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return str(self.title)


class AssistanceRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        CLOSED = 'closed', 'Closed'
        CASE_CREATED = 'case_created', 'Case Created'
        
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_id = models.CharField(max_length=50, unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    mobile = models.CharField(max_length=20)
    preferred_contact = models.CharField(max_length=20)
    state_name = models.CharField(max_length=100, db_index=True)
    city_name = models.CharField(max_length=100, db_index=True)
    category = models.CharField(max_length=200, db_index=True)
    urgency = models.CharField(max_length=20, db_index=True)
    date_of_birth = models.DateField(null=True, blank=True)
    calculated_age = models.PositiveIntegerField(null=True, blank=True)
    address = models.TextField(blank=True, default='')
    help_type = models.CharField(max_length=100, blank=True, default='')
    problem_description = models.TextField()
    additional_fields = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["category", "state_name"]),
        ]
        
    def __str__(self) -> str:
        return f"{self.reference_id} - {self.full_name}"


def case_document_upload_to(instance: "CaseDocument", filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "pdf"
    ref = instance.assistance_request.reference_id if instance.assistance_request else "case"
    return f"case_documents/{ref}/{uuid.uuid4().hex[:8]}.{ext}"


class CaseDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assistance_request = models.ForeignKey(
        AssistanceRequest, on_delete=models.CASCADE, related_name="case_documents"
    )
    document_title = models.CharField(max_length=200, blank=True, default="")
    file = models.FileField(upload_to=case_document_upload_to)
    file_name = models.CharField(max_length=255, blank=True, default="")
    file_size_bytes = models.BigIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("uploaded_at",)

    def __str__(self) -> str:
        return f"{self.file_name} ({self.assistance_request.reference_id})"


class CaseOtpVerification(models.Model):
    """Secure expiring OTP tracking record for 2-factor case status lookup."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=100, unique=True, db_index=True)
    case_reference = models.CharField(max_length=50, db_index=True)
    contact = models.CharField(max_length=120)
    otp_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    attempts = models.PositiveIntegerField(default=0)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["session_id", "verified"]),
            models.Index(fields=["case_reference", "contact"]),
        ]

    def __str__(self) -> str:
        status_text = "Verified" if self.verified else "Pending"
        return f"OTP for {self.case_reference} ({status_text})"


class AssistanceFormField(models.Model):
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    field_key = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    field_type = models.CharField(max_length=50)
    placeholder = models.CharField(max_length=255, blank=True, default="")
    help_text = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    required = models.BooleanField(default=False)
    options = models.JSONField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('display_order', 'created_at')

    def __str__(self) -> str:
        return f"{self.label} ({self.field_key})"


class AssistanceDocument(models.Model):
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    document_key = models.CharField(max_length=64, unique=True)
    description = models.TextField(blank=True)
    allowed_file_types = models.JSONField(default=list, help_text='JSON list of allowed extensions e.g. ["pdf", "docx", "jpg", "png"]')
    max_file_size_mb = models.PositiveIntegerField(default=5)
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")

    def __str__(self) -> str:
        return f"{self.name} ({self.document_key})"


class LegalCase(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        ASSIGNED = 'assigned', 'Assigned to Professional'
        IN_PROGRESS = 'in_progress', 'In Progress'
        CLOSED = 'closed', 'Closed'
        
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case_id = models.CharField(max_length=50, unique=True, db_index=True)
    assistance_request = models.OneToOneField(AssistanceRequest, on_delete=models.PROTECT, related_name='legal_case')
    professional = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_cases')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN, db_index=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    client_fee_agreed = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    platform_charge_pct = models.DecimalField(max_digits=5, decimal_places=2, default=20.00)
    payment_status = models.CharField(max_length=30, default="pending")
    group_type = models.CharField(max_length=100, blank=True)
    professional_group = models.ForeignKey('professional_onboarding.Group', on_delete=models.SET_NULL, null=True, blank=True, related_name='legal_cases')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ('-created_at',)
        
    def __str__(self) -> str:
        return str(self.case_id)


class CaseAssignmentHistory(models.Model):
    """Audit trail of advocate/professional assignment and reassignments."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    legal_case = models.ForeignKey(
        LegalCase, on_delete=models.CASCADE, related_name="assignment_history"
    )
    previous_professional = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="previous_case_assignments"
    )
    new_professional = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="new_case_assignments"
    )
    reassigned_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="case_reassignments_made"
    )
    reason = models.TextField(help_text="Mandatory business reason for reassignment")
    notify_client = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        prev = self.previous_professional.get_full_name() if self.previous_professional else "Unassigned"
        new = self.new_professional.get_full_name() or self.new_professional.email
        return f"{self.legal_case.case_id}: {prev} -> {new}"


class CaseInstallmentSchedule(models.Model):
    """Agreed milestone installments for legal matters."""
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    legal_case = models.ForeignKey(
        LegalCase, on_delete=models.CASCADE, related_name="installments"
    )
    installment_number = models.PositiveIntegerField()
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("installment_number",)
        unique_together = ("legal_case", "installment_number")

    def __str__(self) -> str:
        return f"{self.legal_case.case_id} Installment #{self.installment_number}: ₹{self.amount} ({self.status})"


class ProfessionalWallet(models.Model):
    objects = models.Manager()

    if TYPE_CHECKING:
        transactions: models.Manager
        user: Any
        balance_paise: Any

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='professional_wallet')
    balance_paise = models.BigIntegerField(default=0)
    lead_credits = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def available_inr(self) -> float:
        return round(self.balance_paise / 100.0, 2)  # type: ignore

    @property
    def reserved_inr(self) -> float:
        return 0.0

    @property
    def reserved_paise(self) -> int:
        return 0

    @property
    def total_added_paise(self) -> int:
        return (
            self.transactions.filter(tx_type='credit').aggregate(total=models.Sum('amount_paise'))['total'] or 0
        )

    @property
    def total_added_inr(self) -> float:
        return round(self.total_added_paise / 100.0, 2)

    @property
    def total_spent_paise(self) -> int:
        return (
            self.transactions.filter(tx_type='debit').aggregate(total=models.Sum('amount_paise'))['total'] or 0
        )

    @property
    def total_spent_inr(self) -> float:
        return round(self.total_spent_paise / 100.0, 2)

    def __str__(self) -> str:
        return f"Wallet ({self.user.email}) - ₹{self.available_inr}"


class WalletTransaction(models.Model):
    class TxType(models.TextChoices):
        CREDIT = 'credit', 'Credit / Top-up'
        DEBIT = 'debit', 'Debit / Purchase'
        REFUND = 'refund', 'Refund'
        ADJUSTMENT = 'adjustment', 'Adjustment'
        HOLD = 'hold', 'Hold'
        HOLD_RELEASE = 'hold_release', 'Hold Release'

    objects = models.Manager()

    if TYPE_CHECKING:
        amount_paise: Any
        balance_after_paise: Any

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(ProfessionalWallet, on_delete=models.CASCADE, related_name='transactions')
    reference = models.CharField(max_length=100, blank=True, db_index=True)
    tx_type = models.CharField(max_length=30, choices=TxType.choices, default=TxType.CREDIT)
    amount_paise = models.BigIntegerField()
    balance_after_paise = models.BigIntegerField()
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    @property
    def amount_inr(self) -> float:
        return round(self.amount_paise / 100.0, 2)  # type: ignore

    @property
    def balance_after_inr(self) -> float:
        return round(self.balance_after_paise / 100.0, 2)  # type: ignore

    def __str__(self) -> str:
        return f"{str(self.tx_type).upper()} ₹{self.amount_inr} - {self.reference}"


class LeadCreditPlan(models.Model):
    objects = models.Manager()

    if TYPE_CHECKING:
        price_paise: Any

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    price_paise = models.BigIntegerField()
    credits_granted = models.PositiveIntegerField()
    validity_days = models.PositiveIntegerField(default=365)
    description = models.TextField(blank=True)
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('display_order', 'price_paise')

    @property
    def price_inr(self) -> float:
        return round(self.price_paise / 100.0, 2)  # type: ignore

    def __str__(self) -> str:
        return f"{self.name} - {self.credits_granted} Credits (₹{self.price_inr})"


class ProfessionalPayment(models.Model):
    class Purpose(models.TextChoices):
        WALLET_TOPUP = 'wallet_topup', 'Wallet Top-up'
        LEAD_CREDIT_PLAN = 'lead_credit_plan', 'Lead Credit Plan'
        LEAD_DIRECT_UNLOCK = 'lead_direct_unlock', 'Lead Direct Unlock'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    objects = models.Manager()

    if TYPE_CHECKING:
        amount_paise: Any

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='professional_payments')
    order_id = models.CharField(max_length=100, unique=True, db_index=True)
    order_type = models.CharField(max_length=40, choices=Purpose.choices, default=Purpose.WALLET_TOPUP)
    amount_paise = models.BigIntegerField()
    gateway = models.CharField(max_length=30, default='easebuzz')
    easebuzz_txnid = models.CharField(max_length=100, blank=True, db_index=True)
    easebuzz_access_key = models.CharField(max_length=120, blank=True)
    easepayid = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    @property
    def amount_inr(self) -> float:
        return round(self.amount_paise / 100.0, 2)  # type: ignore

    def __str__(self) -> str:
        return f"{self.order_id} ({self.order_type}) - ₹{self.amount_inr} [{self.status}]"


class MarketplaceLead(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING_REVIEW = 'pending_review', 'Pending Review'
        PUBLISHED = 'published', 'Published'
        RESERVED = 'reserved', 'Reserved'
        ACCEPTED = 'accepted', 'Accepted'
        UNAVAILABLE = 'unavailable', 'Unavailable'
        REJECTED = 'rejected', 'Rejected'
        CLOSED = 'closed', 'Closed'

    objects = models.Manager()

    if TYPE_CHECKING:
        price_paise: Any

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead_id = models.CharField(max_length=50, unique=True, db_index=True)
    assistance_request = models.OneToOneField(
        AssistanceRequest, on_delete=models.SET_NULL, null=True, blank=True, related_name='services_marketplace_lead'
    )
    category = models.CharField(max_length=200)
    urgency = models.CharField(max_length=50, default='medium')
    state_name = models.CharField(max_length=100, blank=True)
    city_name = models.CharField(max_length=100, blank=True)
    anonymized_summary = models.TextField()
    full_description = models.TextField(blank=True)
    price_paise = models.BigIntegerField(default=50000)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PUBLISHED, db_index=True)
    is_exclusive = models.BooleanField(default=True)

    # Client contact details (unlocked only upon acceptance)
    client_name = models.CharField(max_length=255, blank=True)
    client_email = models.EmailField(blank=True)
    client_mobile = models.CharField(max_length=20, blank=True)
    client_preferred_contact = models.CharField(max_length=20, blank=True)

    # Acceptance details
    accepted_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='accepted_marketplace_leads'
    )
    accepted_at = models.DateTimeField(null=True, blank=True)
    acceptance_payment_method = models.CharField(max_length=30, blank=True)

    published_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    @property
    def price_inr(self) -> float:
        return round(self.price_paise / 100.0, 2)  # type: ignore

    def __str__(self) -> str:
        return f"{self.lead_id} - {self.category} ({self.status})"


class LeadCommercialSettings(models.Model):
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paid_unlock_enabled = models.BooleanField(default=True)
    default_lead_price_paise = models.BigIntegerField(default=50000)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    reservation_timeout_minutes = models.PositiveIntegerField(default=15)
    allow_wallet_payment = models.BooleanField(default=True)
    allow_lead_credit_payment = models.BooleanField(default=True)
    allow_direct_payment = models.BooleanField(default=True)
    compliance_notice = models.TextField(
        default="Verified matter inquiries are subject to ICJ Trust ethical codes."
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Lead Commercial Settings"

    def __str__(self) -> str:
        return f"Lead Commercial Settings (Paid: {self.paid_unlock_enabled})"
