from django.urls import path

from apps.membership_onboarding.views.admin_config import (
    MembershipDocumentDetailAPIView,
    MembershipDocumentListCreateAPIView,
    MembershipFieldOptionDetailAPIView,
    MembershipFieldOptionListCreateAPIView,
    MembershipFormDetailAPIView,
    MembershipFormListCreateAPIView,
    MembershipStepDetailAPIView,
    MembershipStepFieldDetailAPIView,
    MembershipStepFieldListCreateAPIView,
    MembershipStepListCreateAPIView,
    MembershipTypeDetailAPIView,
    MembershipTypeListCreateAPIView,
)
from apps.membership_onboarding.views.payment import AdminMembershipFeeSettingsAPIView
from apps.membership_onboarding.views.admin_submissions import (
    MembershipApplicationApproveAPIView,
    MembershipApplicationDetailAPIView,
    MembershipApplicationListAPIView,
    MembershipApplicationRejectAPIView,
    MembershipApplicationReviewAPIView,
)

urlpatterns = [
    path("types/", MembershipTypeListCreateAPIView.as_view()),
    path("types/<uuid:pk>/", MembershipTypeDetailAPIView.as_view()),
    path("forms/", MembershipFormListCreateAPIView.as_view()),
    path("forms/<uuid:pk>/", MembershipFormDetailAPIView.as_view()),
    path("forms/<uuid:form_id>/steps/", MembershipStepListCreateAPIView.as_view()),
    path("forms/<uuid:form_id>/documents/", MembershipDocumentListCreateAPIView.as_view()),
    path("steps/", MembershipStepListCreateAPIView.as_view()),
    path("steps/<uuid:pk>/", MembershipStepDetailAPIView.as_view()),
    path("steps/<uuid:step_id>/fields/", MembershipStepFieldListCreateAPIView.as_view()),
    path("step-fields/", MembershipStepFieldListCreateAPIView.as_view()),
    path("step-fields/<uuid:pk>/", MembershipStepFieldDetailAPIView.as_view()),
    path("step-fields/<uuid:field_id>/options/", MembershipFieldOptionListCreateAPIView.as_view()),
    path("field-options/<uuid:pk>/", MembershipFieldOptionDetailAPIView.as_view()),
    path("documents/<uuid:pk>/", MembershipDocumentDetailAPIView.as_view()),
    path("payment-settings/", AdminMembershipFeeSettingsAPIView.as_view()),
    path("applications/", MembershipApplicationListAPIView.as_view()),
    path("applications/<uuid:pk>/", MembershipApplicationDetailAPIView.as_view()),
    path("applications/<uuid:pk>/review/", MembershipApplicationReviewAPIView.as_view()),
    path("applications/<uuid:pk>/approve/", MembershipApplicationApproveAPIView.as_view()),
    path("applications/<uuid:pk>/reject/", MembershipApplicationRejectAPIView.as_view()),
]
