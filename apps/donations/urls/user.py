from django.urls import path
from apps.donations.views.user_views import (
    DonationInitiateAPIView,
    DonationVerifyAPIView,
    MyDonationsListAPIView,
    DonationReceiptAPIView,
    PublicDonationVerificationAPIView,
)

urlpatterns = [
    path("initiate/", DonationInitiateAPIView.as_view(), name="donation-initiate"),
    path("verify/", DonationVerifyAPIView.as_view(), name="donation-verify"),
    path("my-donations/", MyDonationsListAPIView.as_view(), name="my-donations"),
    path("verify-receipt/", PublicDonationVerificationAPIView.as_view(), name="public-verify-receipt"),
    path("<uuid:donation_id>/receipt/", DonationReceiptAPIView.as_view(), name="donation-receipt"),
]
