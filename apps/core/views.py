from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.responses import api_success


class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        db_ok = True
        try:
            connection.ensure_connection()
        except Exception:
            db_ok = False
        return api_success(
            data={"status": "ok" if db_ok else "degraded", "database": db_ok},
            message="Health check",
        )
