from django.urls import path

from apps.professional_onboarding.views.admin_theme import (
    CategoryThemeAPIView,
    GroupThemeAPIView,
    ProfessionResolvedThemeAPIView,
    ProfessionThemeAPIView,
)
from apps.professional_onboarding.views.admin_registrations import (
    AdminRegistrationApproveAPIView,
    AdminRegistrationDetailAPIView,
    AdminRegistrationListAPIView,
    AdminRegistrationRejectAPIView,
    AdminRegistrationUnderReviewAPIView,
)
from apps.professional_onboarding.views.admin_config import (
    CategoryDetailAPIView,
    CategoryListCreateAPIView,
    CommonFieldDetailAPIView,
    CommonFieldListCreateAPIView,
    DocumentDetailAPIView,
    DocumentListCreateAPIView,
    FieldOptionDetailAPIView,
    FieldOptionListCreateAPIView,
    GroupDetailAPIView,
    GroupListCreateAPIView,
    ProfessionDetailAPIView,
    ProfessionDocumentDetailAPIView,
    ProfessionDocumentListCreateAPIView,
    ProfessionFieldDetailAPIView,
    ProfessionFieldListCreateAPIView,
    ProfessionListCreateAPIView,
)

urlpatterns = [
    path("registrations/", AdminRegistrationListAPIView.as_view(), name="admin-onboarding-registrations"),
    path(
        "registrations/<uuid:pk>/",
        AdminRegistrationDetailAPIView.as_view(),
        name="admin-onboarding-registration-detail",
    ),
    path(
        "registrations/<uuid:pk>/approve/",
        AdminRegistrationApproveAPIView.as_view(),
        name="admin-onboarding-registration-approve",
    ),
    path(
        "registrations/<uuid:pk>/reject/",
        AdminRegistrationRejectAPIView.as_view(),
        name="admin-onboarding-registration-reject",
    ),
    path(
        "registrations/<uuid:pk>/under-review/",
        AdminRegistrationUnderReviewAPIView.as_view(),
        name="admin-onboarding-registration-under-review",
    ),
    path("categories/", CategoryListCreateAPIView.as_view(), name="admin-onboarding-categories"),
    path("categories/<uuid:pk>/", CategoryDetailAPIView.as_view(), name="admin-onboarding-category-detail"),
    path("categories/<uuid:pk>/theme/", CategoryThemeAPIView.as_view(), name="admin-onboarding-category-theme"),
    path("categories/<uuid:category_id>/groups/", GroupListCreateAPIView.as_view(), name="admin-onboarding-category-groups"),
    path("groups/", GroupListCreateAPIView.as_view(), name="admin-onboarding-groups"),
    path("groups/<uuid:pk>/", GroupDetailAPIView.as_view(), name="admin-onboarding-group-detail"),
    path("groups/<uuid:pk>/theme/", GroupThemeAPIView.as_view(), name="admin-onboarding-group-theme"),
    path("groups/<uuid:group_id>/professions/", ProfessionListCreateAPIView.as_view(), name="admin-onboarding-group-professions"),
    path("professions/", ProfessionListCreateAPIView.as_view(), name="admin-onboarding-professions"),
    path("professions/<uuid:pk>/", ProfessionDetailAPIView.as_view(), name="admin-onboarding-profession-detail"),
    path("professions/<uuid:pk>/theme/", ProfessionThemeAPIView.as_view(), name="admin-onboarding-profession-theme"),
    path(
        "professions/<uuid:pk>/theme/resolved/",
        ProfessionResolvedThemeAPIView.as_view(),
        name="admin-onboarding-profession-theme-resolved",
    ),
    path(
        "professions/<uuid:profession_id>/fields/",
        ProfessionFieldListCreateAPIView.as_view(),
        name="admin-onboarding-profession-fields",
    ),
    path(
        "professions/<uuid:profession_id>/documents/",
        ProfessionDocumentListCreateAPIView.as_view(),
        name="admin-onboarding-profession-documents-nested",
    ),
    path("profession-fields/", ProfessionFieldListCreateAPIView.as_view(), name="admin-onboarding-profession-fields-flat"),
    path("profession-fields/<uuid:pk>/", ProfessionFieldDetailAPIView.as_view(), name="admin-onboarding-profession-field-detail"),
    path(
        "profession-fields/<uuid:parent_id>/options/",
        FieldOptionListCreateAPIView.as_view(),
        {"parent_kind": "profession-fields"},
        name="admin-onboarding-profession-field-options",
    ),
    path("common-fields/", CommonFieldListCreateAPIView.as_view(), name="admin-onboarding-common-fields"),
    path("common-fields/<uuid:pk>/", CommonFieldDetailAPIView.as_view(), name="admin-onboarding-common-field-detail"),
    path(
        "common-fields/<uuid:parent_id>/options/",
        FieldOptionListCreateAPIView.as_view(),
        {"parent_kind": "common-fields"},
        name="admin-onboarding-common-field-options",
    ),
    path("field-options/", FieldOptionListCreateAPIView.as_view(), name="admin-onboarding-field-options"),
    path("field-options/<uuid:pk>/", FieldOptionDetailAPIView.as_view(), name="admin-onboarding-field-option-detail"),
    path("documents/", DocumentListCreateAPIView.as_view(), name="admin-onboarding-documents"),
    path("documents/<uuid:pk>/", DocumentDetailAPIView.as_view(), name="admin-onboarding-document-detail"),
    path("profession-documents/", ProfessionDocumentListCreateAPIView.as_view(), name="admin-onboarding-profession-documents"),
    path(
        "profession-documents/<uuid:pk>/",
        ProfessionDocumentDetailAPIView.as_view(),
        name="admin-onboarding-profession-document-detail",
    ),
]
