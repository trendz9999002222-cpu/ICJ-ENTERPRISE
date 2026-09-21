from rest_framework.permissions import BasePermission, IsAuthenticated


class IsAuthenticatedUser(IsAuthenticated):
    """Explicit authenticated-user permission."""


class IsAdminRole(BasePermission):
    """Authorization: admin portal routes (not used on login itself)."""

    message = "Admin access required."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "is_admin_role", False))


class AllowDuringPasswordChange(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)


class PasswordChangeCompleted(BasePermission):
    message = "Password change required before accessing this resource."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(view, "skip_password_change_check", False):
            return True
        return not getattr(user, "password_change_required", False)
