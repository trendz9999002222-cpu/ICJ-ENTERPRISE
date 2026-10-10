from django.urls import path

from apps.core.admin_api import (
    CommonFieldListCreateAPIView,
    CommonFieldDetailAPIView,
    FormFieldConfigListCreateAPIView,
    FormFieldConfigDetailAPIView,
)

urlpatterns = [
    path(
        "common-fields/",
        CommonFieldListCreateAPIView.as_view(),
        name="admin-common-field-list-create",
    ),
    path(
        "common-fields/<uuid:pk>/",
        CommonFieldDetailAPIView.as_view(),
        name="admin-common-field-detail",
    ),
    path(
        "form-field-configs/",
        FormFieldConfigListCreateAPIView.as_view(),
        name="admin-form-field-config-list-create",
    ),
    path(
        "form-field-configs/<uuid:pk>/",
        FormFieldConfigDetailAPIView.as_view(),
        name="admin-form-field-config-detail",
    ),
]
