"""
Public Lead Preview API — No authentication required.
Returns anonymized published & accepted leads for the homepage marquee ticker.
Only leads within the last 30 days are included.
Client-sensitive data is strictly excluded.
"""
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from common.responses import api_success, api_error
from apps.leads.models import Lead
from apps.leads.serializers import LeadMarketplacePreviewSerializer


class PublicLeadMarqueeAPIView(APIView):
    """
    Public, unauthenticated endpoint for homepage lead marquee.
    Returns published and accepted leads from the last 30 days.
    Leads older than 30 days are automatically excluded.
    No client PII is exposed.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            limit = min(int(request.query_params.get("limit", 30)), 60)
        except (ValueError, TypeError):
            limit = 30

        # Leads must be within the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)

        leads = (
            Lead.objects
            .filter(status__in=[Lead.Status.PUBLISHED, Lead.Status.ACCEPTED])
            .filter(
                Q(published_at__gte=thirty_days_ago) |
                (Q(published_at__isnull=True) & Q(created_at__gte=thirty_days_ago))
            )
            .order_by("-published_at", "-created_at")
            [:limit]
        )

        data = LeadMarketplacePreviewSerializer(leads, many=True).data
        return api_success(data=list(data), message="Published and accepted leads for marquee")
