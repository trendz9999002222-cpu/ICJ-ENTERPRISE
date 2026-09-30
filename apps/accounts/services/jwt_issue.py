from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.role_utils import normalize_platform_role


def issue_jwt_pair_for_user(user) -> tuple[str, str, bool]:
    """Return (access, refresh, password_change_required) with ICJ custom claims."""
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    access["role"] = normalize_platform_role(user.role) or "member"
    access["roles"] = user.get_all_roles()
    access["email"] = user.email
    access["first_name"] = user.first_name
    access["user_id"] = user.id
    access["password_change_required"] = user.password_change_required
    return str(access), str(refresh), bool(user.password_change_required)
