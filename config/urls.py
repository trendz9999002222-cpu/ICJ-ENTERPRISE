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
    # Application submission and review (new Phase 3)
    path("api/v1/applications/", include("apps.accounts.urls.applications")),
    path("api/v1/admin/applications/", include("apps.accounts.urls.admin_applications")),
    path("api/v1/admin/core/", include("apps.core.urls_admin")),
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
    path(
        "api/v1/admin/services/",
        include("apps.services.urls.admin"),
    ),
    path(
        "api/v1/admin/donations/",
        include("apps.donations.urls.admin"),
    ),
    path(
        "api/v1/admin/",
        include("apps.leads.urls.admin"),
    ),
    path(
        "api/v1/admin/",
        include("apps.services.urls.admin_leads"),
    ),
    path(
        "api/v1/services/",
        include("apps.services.urls.public"),
    ),
    # 2-Factor Case Tracking
    path(
        "api/v1/services/cases/track/",
        include("apps.services.urls.case_tracking"),
    ),
    path(
        "api/v1/professional/",
        include("apps.leads.urls.professional"),
    ),
    path(
        "api/v1/professional/services/",
        include("apps.services.urls.professional"),
    ),
    path(
        "api/v1/donations/",
        include("apps.donations.urls.user"),
    ),
]

if settings.DEBUG or True:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
