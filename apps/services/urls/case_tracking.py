from django.urls import path

from apps.services.views.public import CaseTrackingInitiateAPIView, CaseTrackingVerifyAPIView

urlpatterns = [
    path("initiate/", CaseTrackingInitiateAPIView.as_view(), name="case-track-initiate"),
    path("verify/", CaseTrackingVerifyAPIView.as_view(), name="case-track-verify"),
]

