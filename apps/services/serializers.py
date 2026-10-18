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
            'updated_at',
        )
        read_only_fields = fields


class WalletTransactionSerializer(serializers.ModelSerializer):
    amount_inr = serializers.FloatField(read_only=True)
    balance_after_inr = serializers.FloatField(read_only=True)
    professional_email = serializers.EmailField(source='wallet.user.email', read_only=True)

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
            'description',
            'created_at',
        )
        read_only_fields = fields


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
            'tax_percentage',
            'status',
            'is_exclusive',
            'published_at',
            'created_at',
        )
        read_only_fields = fields


class MarketplaceLeadDetailSerializer(serializers.ModelSerializer):
    price_inr = serializers.FloatField(read_only=True)
    acceptance_info = serializers.SerializerMethodField()

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
            'tax_percentage',
            'status',
            'is_exclusive',
            'client_name',
            'client_email',
            'client_mobile',
            'client_preferred_contact',
            'acceptance_info',
            'published_at',
            'created_at',
        )
        read_only_fields = fields

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

