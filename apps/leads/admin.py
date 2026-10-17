from django.contrib import admin
from apps.leads.models import (
    Lead,
    LeadCommercialSettings,
    LeadPricingRule,
    LeadPublication,
    LeadReservation,
    LeadAcceptance,
    LeadActivity,
    ProfessionalWallet,
    WalletTransaction,
    LeadCreditPlan,
    ProfessionalPlanPurchase,
    LeadCreditLedger,
    PaymentOrder,
    PaymentTransaction,
    RefundRequest,
    LeadAuditLog,
)

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("lead_id", "category", "urgency", "state_name", "price_paise", "status", "created_at")
    list_filter = ("status", "urgency", "category", "state_name")
    search_fields = ("lead_id", "category", "anonymized_summary")

@admin.register(LeadCommercialSettings)
class LeadCommercialSettingsAdmin(admin.ModelAdmin):
    list_display = ("__str__", "paid_unlock_enabled", "default_lead_price_paise", "tax_percentage", "updated_at")

@admin.register(ProfessionalWallet)
class ProfessionalWalletAdmin(admin.ModelAdmin):
    list_display = ("professional", "balance_paise", "reserved_paise", "total_added_paise", "total_spent_paise")
    search_fields = ("professional__email",)

@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("reference", "wallet", "tx_type", "amount_paise", "balance_after_paise", "created_at")
    list_filter = ("tx_type",)
    search_fields = ("reference", "wallet__professional__email")

@admin.register(LeadCreditPlan)
class LeadCreditPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "price_paise", "credits_granted", "is_active", "display_order")

@admin.register(LeadAcceptance)
class LeadAcceptanceAdmin(admin.ModelAdmin):
    list_display = ("receipt_reference", "lead", "professional", "payment_method", "price_paid_paise", "status", "accepted_at")
    list_filter = ("payment_method", "status")

@admin.register(PaymentOrder)
class PaymentOrderAdmin(admin.ModelAdmin):
    list_display = ("order_id", "gateway_order_id", "professional", "order_type", "amount_paise", "status", "created_at")
    list_filter = ("order_type", "status")

@admin.register(RefundRequest)
class RefundRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "lead_acceptance", "requested_by", "amount_paise", "status", "created_at")
    list_filter = ("status",)
