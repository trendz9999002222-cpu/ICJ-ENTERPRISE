from django.urls import path

from apps.professional_onboarding.views.public import (
    PublicCategoryGroupsAPIView,
    PublicCategoryListAPIView,
    PublicGroupProfessionsAPIView,
    PublicProfessionConfigurationAPIView,
    PublicProfessionalRegisterAPIView,
    PublicSubmissionCreateAPIView,
    PublicCommonFieldsAPIView,
)
from apps.professional_onboarding.views.public_professionals import (
    PublicProfessionalDetailAPIView,
    PublicProfessionalsListAPIView,
    PublicProfessionalsFiltersAPIView,
)

urlpatterns = [
    path("common-fields/", PublicCommonFieldsAPIView.as_view(), name="public-onboarding-common-fields"),
    path("categories/", PublicCategoryListAPIView.as_view(), name="public-onboarding-categories"),
    path(
        "categories/<uuid:category_id>/groups/",
        PublicCategoryGroupsAPIView.as_view(),
        name="public-onboarding-category-groups",
    ),
    path(
        "groups/<uuid:group_id>/professions/",
        PublicGroupProfessionsAPIView.as_view(),
        name="public-onboarding-group-professions",
    ),
    path(
        "professions/<uuid:profession_id>/configuration/",
        PublicProfessionConfigurationAPIView.as_view(),
        name="public-onboarding-profession-configuration",
    ),
    path("submissions/", PublicSubmissionCreateAPIView.as_view(), name="public-onboarding-submissions"),
    path("register/", PublicProfessionalRegisterAPIView.as_view(), name="public-onboarding-register"),
    path("public-professionals/", PublicProfessionalsListAPIView.as_view(), name="public-professionals-list"),
    path("public-professionals/filters/", PublicProfessionalsFiltersAPIView.as_view(), name="public-professionals-filters"),
    path(
        "public-professionals/<str:identifier>/",
        PublicProfessionalDetailAPIView.as_view(),
        name="public-professionals-detail",
    ),
]
