from django.urls import path
from apps.leads.views.payments import PaymentWebhookAPIView
from apps.leads.views.public import PublicLeadMarqueeAPIView

urlpatterns = [
    path("webhook/", PaymentWebhookAPIView.as_view(), name="payment-webhook"),
    path("leads/marquee/", PublicLeadMarqueeAPIView.as_view(), name="public-leads-marquee"),
]
