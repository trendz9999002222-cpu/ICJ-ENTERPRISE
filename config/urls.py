from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from apps.core.views import HealthCheckView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/v1/auth/", include("apps.accounts.urls.auth")),
    path("api/v1/admin/users/", include("apps.accounts.urls.admin_users")),
    path(
        "api/v1/admin/professional-onboarding/",
        include("apps.professional_onboarding.urls.admin"),
    ),
    path(
        "api/v1/professional-onboarding/",
        include("apps.professional_onboarding.urls.public"),
    ),
    path(
        "api/v1/admin/membership-onboarding/",
        include("apps.membership_onboarding.urls.admin"),
    ),
    path(
        "api/v1/membership-onboarding/",
        include("apps.membership_onboarding.urls.public"),
    ),
    path(
        "api/v1/honorable-advisory/",
        include("apps.honorable_advisory.urls"),
    ),
]

if settings.DEBUG or True:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

