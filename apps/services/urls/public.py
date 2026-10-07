from django.urls import path

from apps.services.views.public import (
    PublicCategoryListAPIView,
    PublicFeaturedServicesAPIView,
    PublicJusticeServiceDetailAPIView,
    PublicJusticeServiceListAPIView,
)

urlpatterns = [
    path("categories/", PublicCategoryListAPIView.as_view(), name="public-service-categories"),
    path("featured/", PublicFeaturedServicesAPIView.as_view(), name="public-featured-services"),
    path("", PublicJusticeServiceListAPIView.as_view(), name="public-services"),
    path("<slug:slug>/", PublicJusticeServiceDetailAPIView.as_view(), name="public-service-detail"),
]
