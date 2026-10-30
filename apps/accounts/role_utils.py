"""Platform roles: super_admin, admin, legal_professional, other_professional, volunteer, member, client."""

PLATFORM_ROLES = frozenset({
    "super_admin",
    "admin",
    "legal_professional",
    "other_professional",
    "volunteer",
    "member",
    "client",
    "professional",  # legacy alias for legal_professional
})

_ADMIN_ROLES = frozenset({"super_admin", "admin"})
_LEGAL_PROFESSIONAL_ROLES = frozenset({"legal_professional", "professional", "advocate"})
_OTHER_PROFESSIONAL_ROLES = frozenset({"other_professional", "ca"})
_VOLUNTEER_ROLES = frozenset({"volunteer"})
_CLIENT_ROLES = frozenset({"client"})


def normalize_platform_role(role: str | None) -> str | None:
    if not role:
        return None
    key = str(role).lower().strip()
    if key in _ADMIN_ROLES:
        return "admin"
    if key in _LEGAL_PROFESSIONAL_ROLES:
        return "legal_professional"
    if key in _OTHER_PROFESSIONAL_ROLES:
        return "other_professional"
    if key in _VOLUNTEER_ROLES:
        return "volunteer"
    if key in _CLIENT_ROLES:
        return "client"
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
