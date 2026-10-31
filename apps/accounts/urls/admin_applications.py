from django.urls import path

from apps.accounts.views.application import (
    AdminApplicationListAPIView,
    AdminApplicationDetailAPIView,
    AdminApplicationReviewAPIView,
)

urlpatterns = [
    path("", AdminApplicationListAPIView.as_view(), name="admin-application-list"),
    path("<uuid:pk>/", AdminApplicationDetailAPIView.as_view(), name="admin-application-detail"),
    path("<uuid:pk>/review/", AdminApplicationReviewAPIView.as_view(), name="admin-application-review"),
]

