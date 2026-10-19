from rest_framework import serializers

from apps.services.models import (
    ServiceCategory,
    JusticeService,
    AssistanceRequest,
    LegalCase,
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


class AssistanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistanceRequest
        fields = '__all__'
        read_only_fields = ('id', 'reference_id', 'created_at', 'updated_at', 'status')

class LegalCaseSerializer(serializers.ModelSerializer):
    assistance_request_details = AssistanceRequestSerializer(source='assistance_request', read_only=True)
    professional_name = serializers.CharField(source='professional.get_full_name', read_only=True)
    professional_group_name = serializers.CharField(source='professional_group.name', read_only=True)

    class Meta:
        model = LegalCase
        fields = '__all__'
        read_only_fields = ('id', 'case_id', 'created_at', 'updated_at')


class AssistanceFormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistanceFormField
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class AssistanceDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistanceDocument
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ProfessionalWalletSerializer(serializers.ModelSerializer):
    professional_email = serializers.EmailField(source='user.email', read_only=True)
    currency = serializers.CharField(default='INR', read_only=True)
    available_inr = serializers.FloatField(read_only=True)
    reserved_paise = serializers.IntegerField(read_only=True)
    reserved_inr = serializers.FloatField(read_only=True)
    total_added_paise = serializers.IntegerField(read_only=True)
    total_added_inr = serializers.FloatField(read_only=True)
    total_spent_paise = serializers.IntegerField(read_only=True)
    total_spent_inr = serializers.FloatField(read_only=True)
    available_lead_credits = serializers.IntegerField(source='lead_credits', read_only=True)
    token_balance = serializers.IntegerField(source='lead_credits', read_only=True)
    total_tokens_purchased = serializers.SerializerMethodField()
    total_tokens_spent = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalWallet
        fields = (
            'id',
            'professional_email',
            'currency',
            'balance_paise',
            'available_inr',
            'reserved_paise',
            'reserved_inr',
            'total_added_paise',
            'total_added_inr',
            'total_spent_paise',
            'total_spent_inr',
            'available_lead_credits',
            'token_balance',
            'total_tokens_purchased',
            'total_tokens_spent',
            'updated_at',
        )
        read_only_fields = fields

    def get_total_tokens_purchased(self, obj):
        total = 0
        if hasattr(obj, 'user') and obj.user:
            for p in obj.user.professional_payments.filter(status='success', order_type='lead_credit_plan'):
                total += int(p.metadata.get('credits', 0) or 0)
        return max(total, obj.lead_credits)

    def get_total_tokens_spent(self, obj):
        spent = 0
        if hasattr(obj, 'user') and obj.user:
            for lead in obj.user.accepted_marketplace_leads.filter(acceptance_payment_method__in=['lead_credit', 'tokens']):
                req = max(1, int(round(lead.price_paise / 50000.0))) if lead.price_paise else 1
                spent += req
        return spent


class WalletTransactionSerializer(serializers.ModelSerializer):
    amount_inr = serializers.FloatField(read_only=True)
    balance_after_inr = serializers.FloatField(read_only=True)
    professional_email = serializers.EmailField(source='wallet.user.email', read_only=True)
    tokens_delta = serializers.SerializerMethodField()
    token_balance_after = serializers.SerializerMethodField()

    class Meta:
        model = WalletTransaction
        fields = (
            'id',
            'professional_email',
            'reference',
            'tx_type',
            'amount_paise',
            'amount_inr',
            'balance_after_paise',
            'balance_after_inr',
            'tokens_delta',
            'token_balance_after',
            'description',
            'created_at',
        )
        read_only_fields = fields

    def get_tokens_delta(self, obj):
        import re
        m = re.search(r'([+-]?\d+)\s*(?:credit|token)', obj.description, re.IGNORECASE)
        if m:
            val = int(m.group(1))
            if "deducted" in obj.description.lower() or "used" in obj.description.lower() or "-" in m.group(0):
                return -abs(val)
            return abs(val)
        return None

    def get_token_balance_after(self, obj):
        return obj.wallet.lead_credits if hasattr(obj, 'wallet') and obj.wallet else None


class LeadCreditPlanSerializer(serializers.ModelSerializer):
    price_inr = serializers.FloatField(read_only=True)

    class Meta:
        model = LeadCreditPlan
        fields = (
            'id',
            'name',
            'code',
            'price_paise',
            'price_inr',
            'credits_granted',
            'validity_days',
            'description',
            'is_popular',
            'is_active',
            'display_order',
        )
        read_only_fields = ('id', 'price_inr')


class ProfessionalPaymentSerializer(serializers.ModelSerializer):
    amount_inr = serializers.FloatField(read_only=True)
    professional_email = serializers.EmailField(source='user.email', read_only=True)
    purpose = serializers.CharField(source='order_type', read_only=True)

    class Meta:
        model = ProfessionalPayment
        fields = (
            'id',
            'order_id',
            'order_type',
            'purpose',
            'professional_email',
            'amount_paise',
            'amount_inr',
            'gateway',
            'easebuzz_txnid',
            'easepayid',
            'status',
            'metadata',
            'created_at',
        )
        read_only_fields = fields


class MarketplaceLeadPreviewSerializer(serializers.ModelSerializer):
    price_inr = serializers.FloatField(read_only=True)
    assistance_reference_id = serializers.CharField(source='assistance_request.reference_id', read_only=True, allow_null=True)
    tokens_required = serializers.SerializerMethodField()

    class Meta:
        model = MarketplaceLead
        fields = (
            'id',
            'lead_id',
            'category',
            'urgency',
            'state_name',
            'city_name',
            'anonymized_summary',
            'price_paise',
            'price_inr',
            'tokens_required',
            'tax_percentage',
            'status',
            'is_exclusive',
            'assistance_reference_id',
            'published_at',
            'created_at',
        )
        read_only_fields = fields

    def get_tokens_required(self, obj):
        if not obj.price_paise:
            return 1
        return max(1, int(round(obj.price_paise / 50000.0)))


class MarketplaceLeadDetailSerializer(serializers.ModelSerializer):
    price_inr = serializers.FloatField(read_only=True)
    tokens_required = serializers.SerializerMethodField()
    acceptance_info = serializers.SerializerMethodField()
    assistance_reference_id = serializers.CharField(source='assistance_request.reference_id', read_only=True, allow_null=True)
    dynamic_fields = serializers.SerializerMethodField()
    assistance_data = serializers.SerializerMethodField()

    class Meta:
        model = MarketplaceLead
        fields = (
            'id',
            'lead_id',
            'category',
            'urgency',
            'state_name',
            'city_name',
            'anonymized_summary',
            'full_description',
            'price_paise',
            'price_inr',
            'tokens_required',
            'tax_percentage',
            'status',
            'is_exclusive',
            'client_name',
            'client_email',
            'client_mobile',
            'client_preferred_contact',
            'assistance_reference_id',
            'dynamic_fields',
            'assistance_data',
            'acceptance_info',
            'published_at',
            'created_at',
        )
        read_only_fields = fields

    def get_tokens_required(self, obj):
        if not obj.price_paise:
            return 1
        return max(1, int(round(obj.price_paise / 50000.0)))

    def get_dynamic_fields(self, obj):
        if not obj.assistance_request:
            return {}
        req = obj.assistance_request
        fields = {}
        if req.additional_fields and isinstance(req.additional_fields, dict):
            fields.update(req.additional_fields)
        if req.preferred_contact:
            fields['preferred_contact'] = req.preferred_contact
        return fields

    def get_assistance_data(self, obj):
        if not obj.assistance_request:
            return None
        req = obj.assistance_request
        return {
            'reference_id': req.reference_id,
            'full_name': req.full_name,
            'email': req.email,
            'mobile': req.mobile,
            'preferred_contact': req.preferred_contact,
            'state_name': req.state_name,
            'city_name': req.city_name,
            'category': req.category,
            'urgency': req.urgency,
            'problem_description': req.problem_description,
            'additional_fields': req.additional_fields or {},
            'status': req.status,
            'created_at': req.created_at.isoformat() if req.created_at else None,
        }

    def get_acceptance_info(self, obj):
        if not obj.accepted_by:
            return None
        return {
            'accepted_at': obj.accepted_at.isoformat() if obj.accepted_at else None,
            'payment_method': obj.acceptance_payment_method,
            'receipt_reference': obj.lead_id,
            'professional_email': obj.accepted_by.email if obj.accepted_by else '',
            'status': obj.status,
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        # Only show sensitive client contact details if accepted by the requesting user or admin/staff
        is_owner = user and (instance.accepted_by_id == user.id or user.is_staff or user.role in ['ADMIN', 'SUPERADMIN'])
        if not is_owner:
            ret['client_name'] = None
            ret['client_email'] = None
            ret['client_mobile'] = None
            ret['client_preferred_contact'] = None
        return ret


class LeadCommercialSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadCommercialSettings
        fields = '__all__'

