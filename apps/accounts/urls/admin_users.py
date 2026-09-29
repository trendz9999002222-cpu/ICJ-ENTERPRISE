from django.urls import path

from apps.accounts.views.admin_users import (
    AdminUserActivateAPIView,
    AdminUserDeactivateAPIView,
    AdminUserDetailAPIView,
    AdminUserListAPIView,
    AdminUserResetPasswordAPIView,
)

urlpatterns = [
    path("", AdminUserListAPIView.as_view(), name="admin-users-list"),
    path("<int:pk>/", AdminUserDetailAPIView.as_view(), name="admin-users-detail"),
    path("<int:pk>/activate/", AdminUserActivateAPIView.as_view(), name="admin-users-activate"),
    path("<int:pk>/deactivate/", AdminUserDeactivateAPIView.as_view(), name="admin-users-deactivate"),
    path("<int:pk>/reset-password/", AdminUserResetPasswordAPIView.as_view(), name="admin-users-reset-password"),
]
