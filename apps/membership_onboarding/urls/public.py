from django.urls import path

from apps.membership_onboarding.views.payment import (
    MemberPayDuesAPIView,
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
    PublicMembershipValidateIdentityAPIView,
)

urlpatterns = [
    path("types/", PublicMembershipTypeListAPIView.as_view(), name="membership-onboarding-types"),
    path(
        "types/<uuid:membership_type_id>/configuration/",
        PublicMembershipTypeConfigurationAPIView.as_view(),
        name="membership-onboarding-type-configuration",
    ),
    path("payment/settings/", PublicMembershipPaymentSettingsAPIView.as_view(), name="membership-onboarding-payment-settings"),
    path("payment-settings/", PublicMembershipPaymentSettingsAPIView.as_view(), name="membership-onboarding-payment-settings-alias"),
    path("payment/create-order/", PublicMembershipCreateOrderAPIView.as_view(), name="membership-onboarding-payment-create-order"),
    path("payment/verify/", PublicMembershipVerifyPaymentAPIView.as_view(), name="membership-onboarding-payment-verify"),
    path("payment/pay-dues/", MemberPayDuesAPIView.as_view(), name="membership-onboarding-payment-pay-dues"),
    path("validate-identity/", PublicMembershipValidateIdentityAPIView.as_view(), name="membership-onboarding-validate-identity"),
    path("register/", PublicMembershipRegisterAPIView.as_view(), name="membership-onboarding-register"),
    path(
        "applications/<str:reference_id>/",
        PublicMembershipApplicationStatusAPIView.as_view(),
        name="membership-onboarding-application-status",
    ),
]
