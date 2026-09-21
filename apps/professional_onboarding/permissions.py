from apps.accounts.permissions import IsAdminRole, PasswordChangeCompleted

ADMIN_CONFIG_PERMISSIONS = [PasswordChangeCompleted, IsAdminRole]
