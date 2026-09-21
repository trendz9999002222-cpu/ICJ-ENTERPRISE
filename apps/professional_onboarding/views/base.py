from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.professional_onboarding.permissions import ADMIN_CONFIG_PERMISSIONS


class AdminConfigAPIView(APIView):
    permission_classes = [IsAuthenticated, *ADMIN_CONFIG_PERMISSIONS]
