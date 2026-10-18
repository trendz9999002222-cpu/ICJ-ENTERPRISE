from django.urls import path
from apps.donations.views.admin_views import (
    AdminDonationListAPIView,
    AdminDonationStatsAPIView,
    AdminDonationDetailAPIView,
    AdminDonationExportCSVAPIView,
)

urlpatterns = [
    path("", AdminDonationListAPIView.as_view(), name="admin-donation-list"),
    path("stats/", AdminDonationStatsAPIView.as_view(), name="admin-donation-stats"),
    path("export/", AdminDonationExportCSVAPIView.as_view(), name="admin-donation-export"),
    path("<uuid:donation_id>/", AdminDonationDetailAPIView.as_view(), name="admin-donation-detail"),
]
