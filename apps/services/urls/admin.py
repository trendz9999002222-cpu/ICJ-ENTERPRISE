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
    AdminAssistanceFormFieldListCreateAPIView,
    AdminAssistanceFormFieldDetailAPIView,
    AdminAssistanceDocumentListCreateAPIView,
    AdminAssistanceDocumentDetailAPIView,
)
from apps.services.views.admin_cases import (
    AdminCaseReassignAPIView,
    AdminCaseInstallmentListCreateAPIView,
    AdminCaseInstallmentDetailAPIView,
)

urlpatterns = [
    path("categories/", ServiceCategoryListCreateAPIView.as_view(), name="admin-service-categories"),
    path("categories/<uuid:pk>/", ServiceCategoryDetailAPIView.as_view(), name="admin-service-category-detail"),
    path("form-fields/", AdminAssistanceFormFieldListCreateAPIView.as_view(), name="admin-assistance-form-fields"),
    path("form-fields/<uuid:pk>/", AdminAssistanceFormFieldDetailAPIView.as_view(), name="admin-assistance-form-field-detail"),
    path("documents/", AdminAssistanceDocumentListCreateAPIView.as_view(), name="admin-assistance-documents"),
    path("documents/<uuid:pk>/", AdminAssistanceDocumentDetailAPIView.as_view(), name="admin-assistance-document-detail"),
    path("", JusticeServiceListCreateAPIView.as_view(), name="admin-services"),
    path("assistance-requests/", AdminAssistanceRequestListAPIView.as_view(), name="admin-assistance-requests"),
    path("assistance-requests/<uuid:pk>/", AdminAssistanceRequestDetailAPIView.as_view(), name="admin-assistance-request-detail"),
    path("assistance-requests/<uuid:pk>/assign/", AdminAssistanceRequestAssignAPIView.as_view(), name="admin-assistance-request-assign"),
    path("cases/", AdminCaseListAPIView.as_view(), name="admin-cases"),
    path("cases/<uuid:pk>/", AdminCaseDetailAPIView.as_view(), name="admin-case-detail"),
    # Case Reassignment (with mandatory audit trail)
    path("cases/<uuid:pk>/reassign/", AdminCaseReassignAPIView.as_view(), name="admin-case-reassign"),
    # Case Installment Schedule
    path("cases/<uuid:pk>/installments/", AdminCaseInstallmentListCreateAPIView.as_view(), name="admin-case-installments"),
    path("cases/<uuid:pk>/installments/<uuid:inst_pk>/", AdminCaseInstallmentDetailAPIView.as_view(), name="admin-case-installment-detail"),
    path("<uuid:pk>/", JusticeServiceDetailAPIView.as_view(), name="admin-service-detail"),
]
