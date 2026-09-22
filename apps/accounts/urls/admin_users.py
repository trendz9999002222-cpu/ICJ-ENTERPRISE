from django.urls import path

from apps.accounts.views.admin_users import (
    AdminUserActivateAPIView,
    AdminUserDeactivateAPIView,
    AdminUserDetailAPIView,
    AdminUserListAPIView,
)

urlpatterns = [
    path("", AdminUserListAPIView.as_view(), name="admin-users-list"),
    path("<int:pk>/", AdminUserDetailAPIView.as_view(), name="admin-users-detail"),
    path("<int:pk>/activate/", AdminUserActivateAPIView.as_view(), name="admin-users-activate"),
    path("<int:pk>/deactivate/", AdminUserDeactivateAPIView.as_view(), name="admin-users-deactivate"),
]
