from django.urls import path

from apps.membership_onboarding.views.payment import (
    PublicMembershipCreateOrderAPIView,
    PublicMembershipPaymentSettingsAPIView,
    PublicMembershipVerifyPaymentAPIView,
)
from apps.membership_onboarding.views.public import (
    PublicMembershipApplicationStatusAPIView,
    PublicMembershipConfigurationAPIView,
    PublicMembershipRegisterAPIView,
    PublicMembershipTypeConfigurationAPIView,
    PublicMembershipTypeListAPIView,
)

urlpatterns = [
    path("types/", PublicMembershipTypeListAPIView.as_view(), name="membership-onboarding-types"),
    path(
        "types/<uuid:membership_type_id>/configuration/",
        PublicMembershipTypeConfigurationAPIView.as_view(),
        name="membership-onboarding-type-configuration",
    ),
    path("configuration/", PublicMembershipConfigurationAPIView.as_view(), name="membership-onboarding-configuration"),
    path("payment/settings/", PublicMembershipPaymentSettingsAPIView.as_view(), name="membership-onboarding-payment-settings"),
    path("payment/create-order/", PublicMembershipCreateOrderAPIView.as_view(), name="membership-onboarding-payment-create-order"),
    path("payment/verify/", PublicMembershipVerifyPaymentAPIView.as_view(), name="membership-onboarding-payment-verify"),
    path("register/", PublicMembershipRegisterAPIView.as_view(), name="membership-onboarding-register"),
    path(
        "applications/<str:reference_id>/",
        PublicMembershipApplicationStatusAPIView.as_view(),
        name="membership-onboarding-application-status",
    ),
]
