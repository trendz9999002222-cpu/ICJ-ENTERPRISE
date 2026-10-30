import re
from rest_framework import serializers

from apps.services.models import (
    ServiceCategory,
    JusticeService,
    AssistanceRequest,
    CaseDocument,
    CaseOtpVerification,
    LegalCase,
    CaseAssignmentHistory,
    CaseInstallmentSchedule,
    AssistanceFormField,
    AssistanceDocument,
    ProfessionalWallet,
    WalletTransaction,
    LeadCreditPlan,
    ProfessionalPayment,
    MarketplaceLead,
    LeadCommercialSettings,
)


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = (
            "id",
            "name",
            "slug",
            "value",
            "is_active",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")


class JusticeServiceSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = JusticeService
        fields = (
            "id",
            "slug",
            "title",
            "short_description",
            "category",
            "category_label",
            "icon_name",
            "who_it_is_for",
            "how_icj_helps",
            "available_assistance",
            "next_steps",
            "related_professionals",
            "is_featured",
            "is_active",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "category_label", "created_at", "updated_at")


class CaseDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = CaseDocument
        fields = [
            "id",
            "document_title",
            "file_name",
            "file_size_bytes",
            "file_url",
            "uploaded_at",
        ]

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class AssistanceRequestSerializer(serializers.ModelSerializer):
    case_documents = CaseDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = AssistanceRequest
        fields = "__all__"
        read_only_fields = ("id", "reference_id", "created_at", "updated_at", "status")


class CaseAssignmentHistorySerializer(serializers.ModelSerializer):
    previous_professional_name = serializers.SerializerMethodField()
    new_professional_name = serializers.SerializerMethodField()
    reassigned_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CaseAssignmentHistory
        fields = [
            "id",
            "previous_professional_name",
            "new_professional_name",
            "reassigned_by_name",
            "reason",
            "notify_client",
            "created_at",
        ]

    def get_previous_professional_name(self, obj):
        if obj.previous_professional:
            return obj.previous_professional.get_full_name() or obj.previous_professional.email
        return "Initial Assignment"

    def get_new_professional_name(self, obj):
        return obj.new_professional.get_full_name() or obj.new_professional.email

    def get_reassigned_by_name(self, obj):
        if obj.reassigned_by:
            return obj.reassigned_by.get_full_name() or obj.reassigned_by.email
        return "ICJ Administrator"


class CaseInstallmentScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseInstallmentSchedule
        fields = [
            "id",
            "installment_number",
            "percentage",
            "amount",
            "due_date",
            "status",
            "paid_at",
            "created_at",
        ]


class LegalCaseSerializer(serializers.ModelSerializer):
    assistance_request_details = AssistanceRequestSerializer(source="assistance_request", read_only=True)
    professional_name = serializers.CharField(source="professional.get_full_name", read_only=True)
    professional_email = serializers.EmailField(source="professional.email", read_only=True)
    professional_group_name = serializers.CharField(source="professional_group.name", read_only=True)
    assignment_history = CaseAssignmentHistorySerializer(many=True, read_only=True)
    installments = CaseInstallmentScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = LegalCase
        fields = "__all__"
        read_only_fields = ("id", "case_id", "created_at", "updated_at")


class CaseReassignSerializer(serializers.Serializer):
    new_professional_id = serializers.IntegerField()
    reassignment_reason = serializers.CharField(min_length=10)
    notify_client = serializers.BooleanField(default=True)


class CaseTrackingInitiateSerializer(serializers.Serializer):
    case_id = serializers.CharField(max_length=50)
    contact = serializers.CharField(max_length=120)


class CaseTrackingVerifySerializer(serializers.Serializer):
    case_id = serializers.CharField(max_length=50)
    session_id = serializers.CharField(max_length=100)
    otp = serializers.CharField(min_length=6, max_length=6)


class AssistanceFormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistanceFormField
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class AssistanceDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistanceDocument
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class ProfessionalWalletSerializer(serializers.ModelSerializer):
    professional_email = serializers.EmailField(source="user.email", read_only=True)
    currency = serializers.CharField(default="INR", read_only=True)
    available_inr = serializers.FloatField(read_only=True)
    reserved_paise = serializers.IntegerField(read_only=True)
    reserved_inr = serializers.FloatField(read_only=True)
    total_added_paise = serializers.IntegerField(read_only=True)
    total_added_inr = serializers.FloatField(read_only=True)
    total_spent_paise = serializers.IntegerField(read_only=True)
    total_spent_inr = serializers.FloatField(read_only=True)
    available_lead_credits = serializers.IntegerField(source="lead_credits", read_only=True)
    token_balance = serializers.IntegerField(source="lead_credits", read_only=True)
    total_tokens_purchased = serializers.SerializerMethodField()
    total_tokens_spent = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalWallet
        fields = (
            "id",
            "professional_email",
            "currency",
            "balance_paise",
            "available_inr",
            "reserved_paise",
            "reserved_inr",
            "total_added_paise",
            "total_added_inr",
            "total_spent_paise",
            "total_spent_inr",
            "available_lead_credits",
            "token_balance",
            "total_tokens_purchased",
            "total_tokens_spent",
            "updated_at",
        )
        read_only_fields = fields

    def get_total_tokens_purchased(self, obj):
        total = 0
        if hasattr(obj, "user") and obj.user:
            for p in obj.user.professional_payments.filter(status="success", order_type="lead_credit_plan"):
                total += int(p.metadata.get("credits", 0) or 0)
        return max(total, obj.lead_credits)

    def get_total_tokens_spent(self, obj):
        spent = 0
        if hasattr(obj, "user") and obj.user:
            for lead in obj.user.accepted_marketplace_leads.filter(acceptance_payment_method__in=["lead_credit", "tokens"]):
                req = max(1, int(round(lead.price_paise / 50000.0))) if lead.price_paise else 1
                spent += req
        return spent


class WalletTransactionSerializer(serializers.ModelSerializer):
    amount_inr = serializers.FloatField(read_only=True)
    balance_after_inr = serializers.FloatField(read_only=True)
    professional_email = serializers.EmailField(source="wallet.user.email", read_only=True)
    tokens_delta = serializers.SerializerMethodField()
    token_balance_after = serializers.SerializerMethodField()

    class Meta:
        model = WalletTransaction
        fields = (
            "id",
            "professional_email",
            "reference",
            "tx_type",
            "amount_paise",
            "amount_inr",
            "balance_after_paise",
            "balance_after_inr",
            "tokens_delta",
            "token_balance_after",
            "description",
            "created_at",
        )
        read_only_fields = fields

    def get_tokens_delta(self, obj):
        m = re.search(r"([+-]?\d+)\s*(?:credit|token)", obj.description, re.IGNORECASE)
        if m:
            val = int(m.group(1))
            if "deducted" in obj.description.lower() or "used" in obj.description.lower() or "-" in m.group(0):
                return -abs(val)
            return abs(val)
        return None

    def get_token_balance_after(self, obj):
        return obj.wallet.lead_credits if hasattr(obj, "wallet") and obj.wallet else None


class LeadCreditPlanSerializer(serializers.ModelSerializer):
    price_inr = serializers.FloatField(read_only=True)

    class Meta:
        model = LeadCreditPlan
        fields = (
            "id",
            "name",
            "code",
            "price_paise",
            "price_inr",
            "credits_granted",
            "validity_days",
            "description",
            "is_popular",
            "is_active",
            "display_order",
        )
        read_only_fields = ("id", "price_inr")


class ProfessionalPaymentSerializer(serializers.ModelSerializer):
    amount_inr = serializers.FloatField(read_only=True)
    professional_email = serializers.EmailField(source="user.email", read_only=True)
    purpose = serializers.CharField(source="order_type", read_only=True)

    class Meta:
        model = ProfessionalPayment
        fields = (
            "id",
            "order_id",
            "order_type",
            "purpose",
            "professional_email",
            "amount_paise",
            "amount_inr",
            "gateway",
            "status",
            "created_at",
        )
        read_only_fields = fields


class MarketplaceLeadPreviewSerializer(serializers.ModelSerializer):
    price_inr = serializers.FloatField(read_only=True)

    class Meta:
        model = MarketplaceLead
        fields = (
            "id",
            "lead_id",
            "category",
            "urgency",
            "state_name",
            "city_name",
            "anonymized_summary",
            "price_paise",
            "price_inr",
            "tax_percentage",
            "is_exclusive",
            "status",
            "published_at",
        )
        read_only_fields = fields


class MarketplaceLeadDetailSerializer(serializers.ModelSerializer):
    price_inr = serializers.FloatField(read_only=True)
    assistance_request_details = AssistanceRequestSerializer(source="assistance_request", read_only=True)

    class Meta:
        model = MarketplaceLead
        fields = (
            "id",
            "lead_id",
            "category",
            "urgency",
            "state_name",
            "city_name",
            "anonymized_summary",
            "full_description",
            "price_paise",
            "price_inr",
            "tax_percentage",
            "is_exclusive",
            "status",
            "client_name",
            "client_email",
            "client_mobile",
            "client_preferred_contact",
            "assistance_request_details",
            "published_at",
            "accepted_at",
        )
        read_only_fields = fields


class LeadCommercialSettingsSerializer(serializers.ModelSerializer):
    default_lead_price_inr = serializers.SerializerMethodField()

    class Meta:
        model = LeadCommercialSettings
        fields = (
            "paid_unlock_enabled",
            "default_lead_price_paise",
            "default_lead_price_inr",
            "tax_percentage",
            "reservation_timeout_minutes",
            "allow_wallet_payment",
            "allow_lead_credit_payment",
            "allow_direct_payment",
            "compliance_notice",
            "updated_at",
        )

    def get_default_lead_price_inr(self, obj):
        return round(obj.default_lead_price_paise / 100.0, 2)
