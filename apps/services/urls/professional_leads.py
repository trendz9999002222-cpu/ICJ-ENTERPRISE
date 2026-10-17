from django.urls import path

from apps.services.views.professional_leads import (
    WalletDetailAPIView,
    WalletTransactionsAPIView,
    WalletTopupOrderAPIView,
    LeadPlansListAPIView,
    PurchasePlanAPIView,
    ProfessionalPaymentsListAPIView,
    ProfessionalVerifyPaymentAPIView,
    MarketplaceLeadsListAPIView,
    MarketplaceLeadDetailAPIView,
    ReserveLeadAPIView,
    AcceptLeadAPIView,
    ReleaseLeadAPIView,
    RefundRequestAPIView,
    MyLeadsListAPIView,
)

urlpatterns = [
    # Wallet & Top-up
    path("wallet/", WalletDetailAPIView.as_view(), name="professional-wallet-detail"),
    path("wallet/transactions/", WalletTransactionsAPIView.as_view(), name="professional-wallet-transactions"),
    path("wallet/topup-order/", WalletTopupOrderAPIView.as_view(), name="professional-wallet-topup-order"),

    # Lead Credit Plans
    path("lead-plans/", LeadPlansListAPIView.as_view(), name="professional-lead-plans-list"),
    path("lead-plans/<uuid:pk>/purchase/", PurchasePlanAPIView.as_view(), name="professional-lead-plan-purchase"),

    # Payments & Easebuzz Verification
    path("payments/", ProfessionalPaymentsListAPIView.as_view(), name="professional-payments-list"),
    path("payments/verify/", ProfessionalVerifyPaymentAPIView.as_view(), name="professional-payment-verify"),

    # Marketplace Leads
    path("leads/", MarketplaceLeadsListAPIView.as_view(), name="professional-marketplace-leads-list"),
    path("leads/<uuid:pk>/", MarketplaceLeadDetailAPIView.as_view(), name="professional-marketplace-lead-detail"),
    path("leads/<uuid:pk>/reserve/", ReserveLeadAPIView.as_view(), name="professional-marketplace-lead-reserve"),
    path("leads/<uuid:pk>/accept/", AcceptLeadAPIView.as_view(), name="professional-marketplace-lead-accept"),
    path("leads/<uuid:pk>/release/", ReleaseLeadAPIView.as_view(), name="professional-marketplace-lead-release"),
    path("leads/<uuid:pk>/refund-request/", RefundRequestAPIView.as_view(), name="professional-marketplace-lead-refund"),
    path("my-leads/", MyLeadsListAPIView.as_view(), name="professional-my-leads-list"),
]
