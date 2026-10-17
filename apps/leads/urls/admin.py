from django.urls import path

from apps.leads.views.admin import (
    AdminLeadListAPIView,
    AdminLeadDetailAPIView,
    AdminLeadPublishAPIView,
    AdminLeadUnpublishAPIView,
    AdminLeadPricingUpdateAPIView,
    AdminWalletsListAPIView,
    AdminWalletAdjustAPIView,
    AdminWalletTransactionsListAPIView,
    AdminLeadCreditPlansListCreateAPIView,
    AdminLeadCreditPlanDetailAPIView,
    AdminPaymentsListAPIView,
    AdminRefundsListAPIView,
    AdminRefundProcessAPIView,
    AdminCommercialSettingsAPIView,
    AdminLeadReportsAPIView,
)

urlpatterns = [
    path("leads/", AdminLeadListAPIView.as_view(), name="admin-leads-list"),
    path("leads/<uuid:pk>/", AdminLeadDetailAPIView.as_view(), name="admin-lead-detail"),
    path("leads/<uuid:pk>/publish/", AdminLeadPublishAPIView.as_view(), name="admin-lead-publish"),
    path("leads/<uuid:pk>/unpublish/", AdminLeadUnpublishAPIView.as_view(), name="admin-lead-unpublish"),
    path("leads/<uuid:pk>/pricing/", AdminLeadPricingUpdateAPIView.as_view(), name="admin-lead-pricing"),
    path("wallets/", AdminWalletsListAPIView.as_view(), name="admin-wallets"),
    path("wallets/<uuid:pk>/adjust/", AdminWalletAdjustAPIView.as_view(), name="admin-wallet-adjust"),
    path("wallet-transactions/", AdminWalletTransactionsListAPIView.as_view(), name="admin-wallet-transactions"),
    path("lead-plans/", AdminLeadCreditPlansListCreateAPIView.as_view(), name="admin-lead-plans"),
    path("lead-plans/<uuid:pk>/", AdminLeadCreditPlanDetailAPIView.as_view(), name="admin-lead-plan-detail"),
    path("payments/", AdminPaymentsListAPIView.as_view(), name="admin-payments"),
    path("refunds/", AdminRefundsListAPIView.as_view(), name="admin-refunds"),
    path("refunds/<uuid:pk>/process/", AdminRefundProcessAPIView.as_view(), name="admin-refund-process"),
    path("lead-commercial-settings/", AdminCommercialSettingsAPIView.as_view(), name="admin-commercial-settings"),
    path("lead-reports/", AdminLeadReportsAPIView.as_view(), name="admin-lead-reports"),
]
