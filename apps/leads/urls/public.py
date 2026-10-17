from django.urls import path
from apps.leads.views.payments import PaymentWebhookAPIView

urlpatterns = [
    path("webhook/", PaymentWebhookAPIView.as_view(), name="payment-webhook"),
]
