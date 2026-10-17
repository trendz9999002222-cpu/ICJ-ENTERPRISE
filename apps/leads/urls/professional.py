from django.urls import path

from apps.leads.views.professional import (
    LeadMarketplaceListAPIView,
    LeadMarketplaceDetailAPIView,
    LeadReserveAPIView,
    LeadAcceptAPIView,
    LeadReleaseAPIView,
    LeadRefundRequestAPIView,
    ProfessionalMyLeadsAPIView,
    ProfessionalWalletAPIView,
    ProfessionalWalletTransactionsAPIView,
    ProfessionalWalletTopupOrderAPIView,
    ProfessionalLeadPlansListAPIView,
    ProfessionalLeadPlanPurchaseAPIView,
    ProfessionalPaymentsListAPIView,
    PaymentVerifyAPIView,
)

urlpatterns = [
    path("leads/", LeadMarketplaceListAPIView.as_view(), name="professional-marketplace-leads"),
    path("leads/<uuid:pk>/", LeadMarketplaceDetailAPIView.as_view(), name="professional-marketplace-lead-detail"),
    path("leads/<uuid:pk>/reserve/", LeadReserveAPIView.as_view(), name="professional-lead-reserve"),
    path("leads/<uuid:pk>/accept/", LeadAcceptAPIView.as_view(), name="professional-lead-accept"),
    path("leads/<uuid:pk>/release/", LeadReleaseAPIView.as_view(), name="professional-lead-release"),
    path("leads/<uuid:pk>/refund-request/", LeadRefundRequestAPIView.as_view(), name="professional-lead-refund-request"),
    path("my-leads/", ProfessionalMyLeadsAPIView.as_view(), name="professional-my-leads"),
    path("wallet/", ProfessionalWalletAPIView.as_view(), name="professional-wallet"),
    path("wallet/transactions/", ProfessionalWalletTransactionsAPIView.as_view(), name="professional-wallet-transactions"),
    path("wallet/topup-order/", ProfessionalWalletTopupOrderAPIView.as_view(), name="professional-wallet-topup"),
    path("lead-plans/", ProfessionalLeadPlansListAPIView.as_view(), name="professional-lead-plans"),
    path("lead-plans/<uuid:pk>/purchase/", ProfessionalLeadPlanPurchaseAPIView.as_view(), name="professional-lead-plan-purchase"),
    path("payments/", ProfessionalPaymentsListAPIView.as_view(), name="professional-payments"),
    path("payments/verify/", PaymentVerifyAPIView.as_view(), name="professional-payment-verify"),
]
