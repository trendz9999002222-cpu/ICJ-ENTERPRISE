from django.urls import path

from apps.services.views.admin import (
    JusticeServiceDetailAPIView,
    JusticeServiceListCreateAPIView,
    ServiceCategoryDetailAPIView,
    ServiceCategoryListCreateAPIView,
    AdminAssistanceRequestListAPIView,
    AdminAssistanceRequestDetailAPIView,
    AdminAssistanceRequestAssignAPIView,
    AdminCaseListAPIView,
    AdminCaseDetailAPIView,
)

urlpatterns = [
    path("categories/", ServiceCategoryListCreateAPIView.as_view(), name="admin-service-categories"),
    path("categories/<uuid:pk>/", ServiceCategoryDetailAPIView.as_view(), name="admin-service-category-detail"),
    path("", JusticeServiceListCreateAPIView.as_view(), name="admin-services"),
    path("assistance-requests/", AdminAssistanceRequestListAPIView.as_view(), name="admin-assistance-requests"),
    path("assistance-requests/<uuid:pk>/", AdminAssistanceRequestDetailAPIView.as_view(), name="admin-assistance-request-detail"),
    path("assistance-requests/<uuid:pk>/assign/", AdminAssistanceRequestAssignAPIView.as_view(), name="admin-assistance-request-assign"),
    path("cases/", AdminCaseListAPIView.as_view(), name="admin-cases"),
    path("cases/<uuid:pk>/", AdminCaseDetailAPIView.as_view(), name="admin-case-detail"),
    path("<uuid:pk>/", JusticeServiceDetailAPIView.as_view(), name="admin-service-detail"),
]
