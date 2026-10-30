from django.urls import path

from apps.accounts.views.application import (
    ApplicationSubmitAPIView,
    MyApplicationStatusAPIView,
)

urlpatterns = [
    path("submit/", ApplicationSubmitAPIView.as_view(), name="application-submit"),
    path("my-status/", MyApplicationStatusAPIView.as_view(), name="application-my-status"),
]

