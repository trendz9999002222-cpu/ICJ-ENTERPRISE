import json
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from apps.leads.services.payment_service import (
    PaymentGatewayService,
    verify_webhook_signature,
)


@method_decorator(csrf_exempt, name="dispatch")
class PaymentWebhookAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        signature = request.headers.get("X-Razorpay-Signature", "")
        raw_body = request.body

        if not verify_webhook_signature(raw_body, signature):
            return HttpResponse("Invalid webhook signature", status=400)

        try:
            event_data = json.loads(raw_body.decode())
        except Exception:
            return HttpResponse("Invalid JSON payload", status=400)

        event = event_data.get("event")
        payload = event_data.get("payload", {})

        if event in ("payment.captured", "order.paid"):
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")

            if order_id and payment_id:
                try:
                    PaymentGatewayService.verify_and_process_payment(
                        gateway_order_id=order_id,
                        gateway_payment_id=payment_id,
                        gateway_signature=signature,
                        raw_payload=payment_entity,
                    )
                except Exception as exc:
                    # Return 200 so webhook doesn't keep hammering if already processed
                    return JsonResponse({"status": "error_or_duplicate", "detail": str(exc)}, status=200)

        return JsonResponse({"status": "received"})
