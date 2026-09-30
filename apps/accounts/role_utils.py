"""Platform roles: admin, professional, member only."""

PLATFORM_ROLES = frozenset({"admin", "professional", "member"})

_LEGACY_PROFESSIONAL = frozenset({"advocate", "client", "professional"})
_LEGACY_ADMIN = frozenset({"super_admin", "admin"})


def normalize_platform_role(role: str | None) -> str | None:
    if not role:
        return None
    key = str(role).lower().strip()
    if key in _LEGACY_ADMIN:
        return "admin"
    if key in _LEGACY_PROFESSIONAL:
        return "professional"
    if key == "member":
        return "member"
    return None


def normalize_platform_roles(roles: list[str] | None) -> list[str]:
    if not roles:
        return []
    out: set[str] = set()
    for r in roles:
        norm = normalize_platform_role(r)
        if norm:
            out.add(norm)
    return sorted(out)
