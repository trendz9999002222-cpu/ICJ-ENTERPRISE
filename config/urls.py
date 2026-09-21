from django.contrib import admin
from django.urls import include, path

from apps.core.views import HealthCheckView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/v1/auth/", include("apps.accounts.urls.auth")),
    path(
        "api/v1/admin/professional-onboarding/",
        include("apps.professional_onboarding.urls.admin"),
    ),
    path(
        "api/v1/professional-onboarding/",
        include("apps.professional_onboarding.urls.public"),
    ),
]
