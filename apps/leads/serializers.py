from rest_framework import serializers
from apps.leads.models import (
    Lead,
    LeadAcceptance,
    LeadCommercialSettings,
    LeadPricingRule,
    LeadReservation,
    LeadActivity,
    ProfessionalWallet,
    WalletTransaction,
    LeadCreditPlan,
    ProfessionalPlanPurchase,
    LeadCreditLedger,
    PaymentOrder,
    PaymentTransaction,
    RefundRequest,
)


class LeadCommercialSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadCommercialSettings
        fields = [
            "id",
            "paid_unlock_enabled",
            "default_lead_price_paise",
            "tax_percentage",
            "reservation_timeout_minutes",
            "allow_wallet_payment",
            "allow_lead_credit_payment",
            "allow_direct_payment",
            "compliance_notice",
            "updated_at",
        ]


class LeadPricingRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadPricingRule
        fields = "__all__"


class LeadMarketplacePreviewSerializer(serializers.ModelSerializer):
    """
    Public/Marketplace preview for verified professionals.
    Sensitive client identity details (full name, email, phone, full text) are strictly omitted.
    """
    price_inr = serializers.ReadOnlyField()

    class Meta:
        model = Lead
        fields = [
            "id",
            "lead_id",
            "category",
            "urgency",
            "state_name",
            "city_name",
            "anonymized_summary",
            "tokens_required",
            "price_paise",
            "price_inr",
            "tax_percentage",
            "status",
            "is_exclusive",
            "published_at",
            "created_at",
        ]


class LeadDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer that safely controls visibility of confidential client information.
    Client details are unlocked ONLY if the requesting user is the accepting professional
    or an administrator.
    """
    price_inr = serializers.ReadOnlyField()
    client_name = serializers.SerializerMethodField()
    client_email = serializers.SerializerMethodField()
    client_mobile = serializers.SerializerMethodField()
    client_preferred_contact = serializers.SerializerMethodField()
    full_description = serializers.SerializerMethodField()
    client_documents = serializers.SerializerMethodField()
    assigned_professional_details = serializers.SerializerMethodField()
    acceptance_info = serializers.SerializerMethodField()
    legal_case_id = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            "id",
            "lead_id",
            "category",
            "urgency",
            "state_name",
            "city_name",
            "anonymized_summary",
            "full_description",
            "tokens_required",
            "assigned_professional",
            "assigned_professional_details",
            "case_stage",
            "case_notes",
            "reassignment_notes",
            "client_documents",
            "price_paise",
            "price_inr",
            "tax_percentage",
            "status",
            "is_exclusive",
            "client_name",
            "client_email",
            "client_mobile",
            "client_preferred_contact",
            "acceptance_info",
            "legal_case_id",
            "published_at",
            "created_at",
        ]

    def _has_access(self, obj: Lead) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        if user.is_staff or getattr(user, "role", "") in ["admin", "super_admin"]:
            return True
        if obj.assigned_professional_id == user.id:
            return True
        acceptance = getattr(obj, "acceptance", None)
        if acceptance and acceptance.professional_id == user.id and acceptance.status == LeadAcceptance.Status.ACTIVE:
            return True
        return False

    def get_assigned_professional_details(self, obj: Lead):
        pro = obj.assigned_professional
        if not pro:
            acc = getattr(obj, "acceptance", None)
            pro = acc.professional if acc else None
        if pro:
            return {
                "id": str(pro.id),
                "name": pro.get_full_name() or pro.email,
                "email": pro.email,
                "mobile": getattr(pro, "mobile_number", ""),
            }
        return None

    def get_client_documents(self, obj: Lead):
        if self._has_access(obj):
            return obj.client_documents or []
        return []

    def get_client_name(self, obj: Lead):
        if self._has_access(obj) and obj.assistance_request:
            return obj.assistance_request.full_name
        return None

    def get_client_email(self, obj: Lead):
        if self._has_access(obj) and obj.assistance_request:
            return obj.assistance_request.email
        return None

    def get_client_mobile(self, obj: Lead):
        if self._has_access(obj) and obj.assistance_request:
            return obj.assistance_request.mobile
        return None

    def get_client_preferred_contact(self, obj: Lead):
        if self._has_access(obj) and obj.assistance_request:
            return obj.assistance_request.preferred_contact
        return None

    def get_full_description(self, obj: Lead):
        if self._has_access(obj):
            return obj.full_description or obj.anonymized_summary
        return None

    def get_acceptance_info(self, obj: Lead):
        acceptance = getattr(obj, "acceptance", None)
        if acceptance:
            return {
                "accepted_at": acceptance.accepted_at,
                "payment_method": acceptance.payment_method,
                "receipt_reference": acceptance.receipt_reference,
                "professional_email": acceptance.professional.email,
                "status": acceptance.status,
            }
        return None

    def get_legal_case_id(self, obj: Lead):
        if obj.legal_case:
            return obj.legal_case.case_id
        if obj.assistance_request and hasattr(obj.assistance_request, "legal_case"):
            return obj.assistance_request.legal_case.case_id
        return None


class LeadAcceptanceSerializer(serializers.ModelSerializer):
    lead = LeadMarketplacePreviewSerializer(read_only=True)
    professional_email = serializers.ReadOnlyField(source="professional.email")

    class Meta:
        model = LeadAcceptance
        fields = [
            "id",
            "lead",
            "professional_email",
            "accepted_at",
            "payment_method",
            "price_paid_paise",
            "receipt_reference",
            "client_contact_unlocked",
            "status",
            "notes",
        ]


class WalletTransactionSerializer(serializers.ModelSerializer):
    amount_inr = serializers.SerializerMethodField()
    balance_after_inr = serializers.SerializerMethodField()

    class Meta:
        model = WalletTransaction
        fields = [
            "id",
            "reference",
            "tx_type",
            "tokens_delta",
            "token_balance_after",
            "amount_paise",
            "amount_inr",
            "balance_after_paise",
            "balance_after_inr",
            "description",
            "created_at",
        ]

    def get_amount_inr(self, obj):
        return round(obj.amount_paise / 100, 2)

    def get_balance_after_inr(self, obj):
        return round(obj.balance_after_paise / 100, 2)


class ProfessionalWalletSerializer(serializers.ModelSerializer):
    available_inr = serializers.ReadOnlyField()
    reserved_inr = serializers.SerializerMethodField()
    total_added_inr = serializers.SerializerMethodField()
    total_spent_inr = serializers.SerializerMethodField()
    professional_email = serializers.ReadOnlyField(source="professional.email")

    class Meta:
        model = ProfessionalWallet
        fields = [
            "id",
            "professional_email",
            "currency",
            "token_balance",
            "total_tokens_purchased",
            "total_tokens_spent",
            "balance_paise",
            "available_inr",
            "reserved_paise",
            "reserved_inr",
            "total_added_paise",
            "total_added_inr",
            "total_spent_paise",
            "total_spent_inr",
            "updated_at",
        ]

    def get_reserved_inr(self, obj):
        return round(obj.reserved_paise / 100, 2)

    def get_total_added_inr(self, obj):
        return round(obj.total_added_paise / 100, 2)

    def get_total_spent_inr(self, obj):
        return round(obj.total_spent_paise / 100, 2)


class LeadCreditPlanSerializer(serializers.ModelSerializer):
    price_inr = serializers.SerializerMethodField()

    class Meta:
        model = LeadCreditPlan
        fields = [
            "id",
            "name",
            "code",
            "price_paise",
            "price_inr",
            "credits_granted",
            "validity_days",
            "description",
            "is_active",
            "display_order",
        ]

    def get_price_inr(self, obj):
        return round(obj.price_paise / 100, 2)


class ProfessionalPlanPurchaseSerializer(serializers.ModelSerializer):
    plan_name = serializers.ReadOnlyField(source="plan.name")

    class Meta:
        model = ProfessionalPlanPurchase
        fields = [
            "id",
            "plan_name",
            "total_credits",
            "remaining_credits",
            "price_paid_paise",
            "valid_until",
            "status",
            "created_at",
        ]


class LeadCreditLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadCreditLedger
        fields = [
            "id",
            "entry_type",
            "credits_delta",
            "balance_after",
            "notes",
            "created_at",
        ]


class PaymentOrderSerializer(serializers.ModelSerializer):
    amount_inr = serializers.SerializerMethodField()

    class Meta:
        model = PaymentOrder
        fields = [
            "id",
            "order_id",
            "gateway_order_id",
            "order_type",
            "amount_paise",
            "amount_inr",
            "currency",
            "status",
            "created_at",
        ]

    def get_amount_inr(self, obj):
        return round(obj.amount_paise / 100, 2)


class RefundRequestSerializer(serializers.ModelSerializer):
    lead_id = serializers.ReadOnlyField(source="lead_acceptance.lead.lead_id")
    requested_by_email = serializers.ReadOnlyField(source="requested_by.email")
    amount_inr = serializers.SerializerMethodField()

    class Meta:
        model = RefundRequest
        fields = [
            "id",
            "lead_id",
            "requested_by_email",
            "amount_paise",
            "amount_inr",
            "reason",
            "status",
            "admin_notes",
            "created_at",
            "resolved_at",
        ]

    def get_amount_inr(self, obj):
        return round(obj.amount_paise / 100, 2)


class LeadActivitySerializer(serializers.ModelSerializer):
    actor_email = serializers.ReadOnlyField(source="actor.email")

    class Meta:
        model = LeadActivity
        fields = [
            "id",
            "action",
            "description",
            "actor_email",
            "metadata",
            "created_at",
        ]
