from django.urls import path

from apps.services.views.admin_leads import (
    AdminLeadCommercialSettingsAPIView,
    AdminLeadDetailAPIView,
    AdminLeadPlanDetailAPIView,
    AdminLeadPlansListCreateAPIView,
    AdminLeadPricingAPIView,
    AdminLeadPublishAPIView,
    AdminLeadReportsAPIView,
    AdminLeadsListAPIView,
    AdminLeadUnpublishAPIView,
    AdminPaymentsListAPIView,
    AdminRefundProcessAPIView,
    AdminRefundsListAPIView,
    AdminWalletAdjustAPIView,
    AdminWalletsListAPIView,
    AdminWalletTransactionsListAPIView,
)

urlpatterns = [
    # Marketplace Leads
    path("leads/", AdminLeadsListAPIView.as_view(), name="admin-leads-list"),
    path("leads/<uuid:pk>/", AdminLeadDetailAPIView.as_view(), name="admin-lead-detail"),
    path("leads/<uuid:pk>/publish/", AdminLeadPublishAPIView.as_view(), name="admin-lead-publish"),
    path("leads/<uuid:pk>/unpublish/", AdminLeadUnpublishAPIView.as_view(), name="admin-lead-unpublish"),
    path("leads/<uuid:pk>/pricing/", AdminLeadPricingAPIView.as_view(), name="admin-lead-pricing"),

    # Wallets & Transactions
    path("wallets/", AdminWalletsListAPIView.as_view(), name="admin-wallets-list"),
    path("wallets/<uuid:pk>/adjust/", AdminWalletAdjustAPIView.as_view(), name="admin-wallet-adjust"),
    path("wallet-transactions/", AdminWalletTransactionsListAPIView.as_view(), name="admin-wallet-transactions-list"),

    # Lead Credit Plans
    path("lead-plans/", AdminLeadPlansListCreateAPIView.as_view(), name="admin-lead-plans-list-create"),
    path("lead-plans/<uuid:pk>/", AdminLeadPlanDetailAPIView.as_view(), name="admin-lead-plan-detail"),

    # Payments & Refunds
    path("payments/", AdminPaymentsListAPIView.as_view(), name="admin-payments-list"),
    path("refunds/", AdminRefundsListAPIView.as_view(), name="admin-refunds-list"),
    path("refunds/<str:pk>/process/", AdminRefundProcessAPIView.as_view(), name="admin-refund-process"),

    # Commercial Settings & Reports
    path("lead-commercial-settings/", AdminLeadCommercialSettingsAPIView.as_view(), name="admin-lead-commercial-settings"),
    path("lead-reports/", AdminLeadReportsAPIView.as_view(), name="admin-lead-reports"),
]
