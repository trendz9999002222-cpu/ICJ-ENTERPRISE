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
    client_address = serializers.SerializerMethodField()
    client_pincode = serializers.SerializerMethodField()
    client_gender = serializers.SerializerMethodField()
    client_age = serializers.SerializerMethodField()
    client_dob = serializers.SerializerMethodField()
    assistance_reference_id = serializers.SerializerMethodField()
    dynamic_fields = serializers.SerializerMethodField()
    full_description = serializers.SerializerMethodField()
    client_documents = serializers.SerializerMethodField()
    assigned_professional_details = serializers.SerializerMethodField()
    acceptance_info = serializers.SerializerMethodField()
    legal_case_id = serializers.SerializerMethodField()
    lead_type = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    target_professional_name = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            "id",
            "lead_id",
            "assistance_reference_id",
            "lead_type",
            "service_name",
            "target_professional_name",
            "target_professional_id",
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
            "dynamic_fields",
            "price_paise",
            "price_inr",
            "tax_percentage",
            "status",
            "is_exclusive",
            "client_name",
            "client_email",
            "client_mobile",
            "client_preferred_contact",
            "client_address",
            "client_pincode",
            "client_gender",
            "client_age",
            "client_dob",
            "acceptance_info",
            "legal_case_id",
            "published_at",
            "created_at",
        ]

    def get_lead_type(self, obj: Lead):
        if obj.lead_type:
            return obj.lead_type
        if obj.assistance_request and obj.assistance_request.additional_fields:
            af = obj.assistance_request.additional_fields
            if af.get("service_name") or af.get("service_slug"):
                return "service_request"
            if af.get("professional_name") or af.get("professional_id"):
                return "professional_appointment"
        return "seek_assistance"

    def get_service_name(self, obj: Lead):
        if obj.service_name:
            return obj.service_name
        if obj.assistance_request and obj.assistance_request.additional_fields:
            return obj.assistance_request.additional_fields.get("service_name", "")
        return ""

    def get_target_professional_name(self, obj: Lead):
        if obj.target_professional_name:
            return obj.target_professional_name
        if obj.assistance_request and obj.assistance_request.additional_fields:
            return obj.assistance_request.additional_fields.get("professional_name", "")
        return ""

    def _has_access(self, obj: Lead) -> bool:
        if self.context.get("is_admin", False):
            return True
        request = self.context.get("request")
        if not request:
            return True
        if getattr(request, "path", "").find("/admin/") != -1:
            return True
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        if (
            user.is_staff
            or user.is_superuser
            or getattr(user, "is_admin_role", False)
            or getattr(user, "role", "") in ["admin", "super_admin"]
        ):
            return True
        if obj.assigned_professional_id == user.id:
            return True
        acceptance = getattr(obj, "acceptance", None)
        if acceptance and acceptance.professional_id == user.id and acceptance.status == LeadAcceptance.Status.ACTIVE:
            return True
        return False

    def _get_active_acceptance(self, obj: Lead):
        # Use prefetched acceptances if available to avoid firing N+1 SQL queries
        if hasattr(obj, "_prefetched_objects_cache") and "acceptances" in obj._prefetched_objects_cache:
            for acc in obj.acceptances.all():
                if acc.status == LeadAcceptance.Status.ACTIVE:
                    return acc
            return None
        return getattr(obj, "acceptance", None)

    def get_assigned_professional_details(self, obj: Lead):
        pro = obj.assigned_professional
        if not pro:
            acc = self._get_active_acceptance(obj)
            pro = getattr(acc, "professional", None) if acc else None
        if pro:
            return {
                "id": str(pro.id),
                "name": pro.get_full_name() or pro.email,
                "email": pro.email,
                "mobile": getattr(pro, "mobile_number", ""),
            }
        return None

    def get_client_documents(self, obj: Lead):
        if not self._has_access(obj):
            return []
        docs = []
        if isinstance(obj.client_documents, list):
            docs.extend(obj.client_documents)
        if obj.assistance_request:
            request = self.context.get("request")
            for doc in obj.assistance_request.case_documents.all():
                url = doc.file.url if doc.file else None
                if url and request and not url.startswith("http"):
                    try:
                        url = request.build_absolute_uri(url)
                    except Exception:
                        pass
                docs.append({
                    "id": str(doc.id),
                    "document_title": doc.document_title or doc.file_name,
                    "file_name": doc.file_name,
                    "file_url": url,
                    "url": url,
                    "file_size": doc.file_size_bytes,
                })
        return docs

    def get_client_name(self, obj: Lead):
        if not self._has_access(obj):
            return None
        if obj.assistance_request and obj.assistance_request.full_name:
            return obj.assistance_request.full_name
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            af = obj.assistance_request.additional_fields
            for k in ["full_name", "client_name", "name"]:
                if af.get(k):
                    return af.get(k)
        return None

    def get_client_email(self, obj: Lead):
        if not self._has_access(obj):
            return None
        if obj.assistance_request and obj.assistance_request.email:
            return obj.assistance_request.email
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            af = obj.assistance_request.additional_fields
            for k in ["email", "client_email"]:
                if af.get(k):
                    return af.get(k)
        return None

    def get_client_mobile(self, obj: Lead):
        if not self._has_access(obj):
            return None
        if obj.assistance_request and obj.assistance_request.mobile:
            return obj.assistance_request.mobile
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            af = obj.assistance_request.additional_fields
            for k in ["mobile", "client_mobile", "mobile_number", "phone"]:
                if af.get(k):
                    return af.get(k)
        return None

    def get_client_preferred_contact(self, obj: Lead):
        if not self._has_access(obj):
            return None
        if obj.assistance_request and obj.assistance_request.preferred_contact:
            return obj.assistance_request.preferred_contact
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            af = obj.assistance_request.additional_fields
            for k in ["preferred_contact", "contact_method"]:
                if af.get(k):
                    return af.get(k)
        return None

    def get_client_address(self, obj: Lead):
        if not self._has_access(obj):
            return None
        if obj.assistance_request and obj.assistance_request.address:
            return obj.assistance_request.address
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            af = obj.assistance_request.additional_fields
            for k in ["address", "residential_address", "client_address"]:
                if af.get(k):
                    return af.get(k)
        loc = f"{obj.city_name}, {obj.state_name}".strip(", ")
        return loc if loc else None

    def get_client_pincode(self, obj: Lead):
        if not self._has_access(obj):
            return ""
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            af = obj.assistance_request.additional_fields
            return af.get("pincode") or af.get("client_pincode") or af.get("pin_code") or ""
        return ""

    def get_client_gender(self, obj: Lead):
        if not self._has_access(obj):
            return ""
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            af = obj.assistance_request.additional_fields
            return af.get("gender") or af.get("client_gender") or ""
        return ""

    def get_client_age(self, obj: Lead):
        if not self._has_access(obj):
            return None
        if obj.assistance_request and obj.assistance_request.calculated_age:
            age = obj.assistance_request.calculated_age
            return age if age > 0 else None
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            af = obj.assistance_request.additional_fields
            age = af.get("age") or af.get("client_age")
            if age:
                try:
                    age_int = int(age)
                    return age_int if age_int > 0 else None
                except Exception:
                    pass
        return None

    def get_client_dob(self, obj: Lead):
        if not self._has_access(obj):
            return None
        if obj.assistance_request and obj.assistance_request.date_of_birth:
            return str(obj.assistance_request.date_of_birth)
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            af = obj.assistance_request.additional_fields
            return af.get("date_of_birth") or af.get("dob") or None
        return None

    def get_assistance_reference_id(self, obj: Lead):
        if obj.assistance_request:
            return obj.assistance_request.reference_id
        return None

    def get_dynamic_fields(self, obj: Lead):
        if not self._has_access(obj):
            return {}
        if obj.assistance_request and isinstance(obj.assistance_request.additional_fields, dict):
            return obj.assistance_request.additional_fields
        return {}

    def get_full_description(self, obj: Lead):
        if self._has_access(obj):
            return obj.full_description or obj.anonymized_summary
        return None

    def get_acceptance_info(self, obj: Lead):
        acceptance = self._get_active_acceptance(obj)
        if acceptance:
            pro = getattr(acceptance, "professional", None)
            return {
                "accepted_at": acceptance.accepted_at,
                "payment_method": acceptance.payment_method,
                "receipt_reference": acceptance.receipt_reference,
                "professional_email": pro.email if pro else "",
                "status": acceptance.status,
            }
        return None

    def get_legal_case_id(self, obj: Lead):
        if obj.legal_case_id:
            try:
                if obj.legal_case:
                    return obj.legal_case.case_id
            except Exception:
                pass
        ar = obj.assistance_request
        if ar:
            # Check prefetched legal_case if available
            if hasattr(ar, "_prefetched_objects_cache") and "legal_case" in ar._prefetched_objects_cache:
                lc = getattr(ar, "legal_case", None)
                return lc.case_id if lc else None
            try:
                if hasattr(ar, "legal_case") and ar.legal_case:
                    return ar.legal_case.case_id
            except Exception:
                pass
        return None


class AdminLeadListSerializer(LeadDetailSerializer):
    """
    Ultra-lightweight list serializer for the Admin Leads Management table.
    Omits heavy relations (client_documents, acceptance_info, case_notes, dynamic_fields)
    so table fetches execute in 1 single fast query without N+1 joins!
    """
    class Meta:
        model = Lead
        fields = [
            "id",
            "lead_id",
            "assistance_reference_id",
            "lead_type",
            "service_name",
            "target_professional_name",
            "category",
            "urgency",
            "state_name",
            "city_name",
            "tokens_required",
            "price_paise",
            "price_inr",
            "status",
            "client_name",
            "client_email",
            "client_mobile",
            "client_preferred_contact",
            "created_at",
        ]


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
