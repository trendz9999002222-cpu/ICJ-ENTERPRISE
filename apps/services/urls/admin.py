from django.urls import path

from apps.services.views.admin import (
    JusticeServiceDetailAPIView,
    JusticeServiceListCreateAPIView,
    ServiceCategoryDetailAPIView,
    ServiceCategoryListCreateAPIView,
)

urlpatterns = [
    path("categories/", ServiceCategoryListCreateAPIView.as_view(), name="admin-service-categories"),
    path("categories/<uuid:pk>/", ServiceCategoryDetailAPIView.as_view(), name="admin-service-category-detail"),
    path("", JusticeServiceListCreateAPIView.as_view(), name="admin-services"),
    path("<uuid:pk>/", JusticeServiceDetailAPIView.as_view(), name="admin-service-detail"),
]
