from rest_framework.permissions import BasePermission


class IsApprovedProfessional(BasePermission):
    """
    Approval-based module access guard.
    Guarantees that professional modules (Marketplace, My Leads, Wallet, Bids, Cases)
    remain disabled until the relevant application is formally approved by ICJ Admin.
    Hiding a frontend button is not sufficient authorization; this enforces server-side security.
    """

    message = "Access restricted: Professional application is pending review or not approved."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "is_admin_role", False):
            return True
        return getattr(user, "is_approved_professional", False)


class IsLegalProfessional(BasePermission):
    """Requires user to be an approved legal professional or admin."""

    message = "Legal Professional access required."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "is_admin_role", False):
            return True
        return user.is_legal_professional and user.is_approved_professional


class IsOtherProfessional(BasePermission):
    """Requires user to be an approved other professional (e.g. CA) or admin."""

    message = "Other Professional access required."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "is_admin_role", False):
            return True
        return user.is_other_professional and user.is_approved_professional


class IsVolunteer(BasePermission):
    """Requires user to be a volunteer or admin."""

    message = "Volunteer access required."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "is_admin_role", False):
            return True
        return user.is_volunteer

