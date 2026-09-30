"""
Admin User Management Views — list, retrieve, approve, block, delete users.
"""

from django.contrib.auth import get_user_model
from django.db.models import Prefetch, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.responses import api_error, api_success

from apps.accounts.permissions import IsAdminRole
from apps.accounts.role_utils import normalize_platform_role
from apps.accounts.serializers.admin_user import (
    AdminUserDetailSerializer,
    AdminUserListSerializer,
    AdminUserUpdateSerializer,
)
from apps.membership_onboarding.models import MembershipApplication
from apps.professional_onboarding.models import ProfessionalRegistrationSubmission

User = get_user_model()


class AdminUserListAPIView(APIView):
    """
    GET /api/v1/admin/users/ — list approved users and admins (paginated & filterable).
    
    Filters:
      - search: email, username, first_name, last_name, phone, submission reference, category/group/profession name
      - role: admin, professional, member (super_admin maps to admin)
      - status: active, inactive, blocked
      - category: category UUID
      - group: group UUID
      - profession: profession UUID
      - verified: true / false
      - ordering: sorting field (default: -date_joined)

    Only lists users with an approved professional registration and/or approved membership,
    plus admin/staff accounts. Pending-only applicants are excluded (manage via onboarding modules).
    """

    permission_classes = [IsAdminRole]

    def get(self, request):
        params = list_params(request)
        qs = User.objects.all().prefetch_related(
            Prefetch(
                "professional_registration_submissions",
                queryset=ProfessionalRegistrationSubmission.objects.select_related(
                    "category", "group", "profession"
                ).order_by("-created_at"),
            )
        )

        # Users list = approved platform accounts only (pending applicants stay under Memberships / Registrations).
        qs = qs.filter(
            Q(role__in=["admin", "super_admin"])
            | Q(is_staff=True)
            | Q(
                professional_registration_submissions__status=ProfessionalRegistrationSubmission.Status.APPROVED
            )
            | Q(membership_applications__status=MembershipApplication.Status.APPROVED)
        ).distinct()

        # Search
        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(phone_number__icontains=search)
                | Q(professional_registration_submissions__reference_id__icontains=search)
                | Q(professional_registration_submissions__category__name__icontains=search)
                | Q(professional_registration_submissions__group__name__icontains=search)
                | Q(professional_registration_submissions__profession__name__icontains=search)
            )

        # Role filter (platform roles: admin, professional, member)
        role = request.query_params.get("role")
        if role:
            norm = normalize_platform_role(role) or role
            if norm == "admin":
                qs = qs.filter(role__in=["admin", "super_admin"])
            elif norm == "professional":
                qs = qs.filter(role__in=["professional", "advocate", "client"])
            elif norm == "member":
                qs = qs.filter(role="member")
            else:
                qs = qs.filter(role=role)

        # Status filter
        status_filter = request.query_params.get("status")
        if status_filter == "active":
            qs = qs.filter(is_active=True)
        elif status_filter in ("inactive", "blocked", "suspended"):
            qs = qs.filter(is_active=False)

        # Category filter
        category_id = request.query_params.get("category") or request.query_params.get("category_id")
        if category_id:
            qs = qs.filter(
                Q(professional_registration_submissions__category_id=category_id)
                | Q(professional_registration_submissions__selected_category_ids__contains=[str(category_id)])
                | Q(professional_registration_submissions__selected_category_ids__contains=str(category_id))
            )

        # Group filter
        group_id = request.query_params.get("group") or request.query_params.get("group_id")
        if group_id:
            qs = qs.filter(
                Q(professional_registration_submissions__group_id=group_id)
                | Q(professional_registration_submissions__selected_group_ids__contains=[str(group_id)])
                | Q(professional_registration_submissions__selected_group_ids__contains=str(group_id))
            )

        # Profession filter
        profession_id = request.query_params.get("profession") or request.query_params.get("profession_id")
        if profession_id:
            qs = qs.filter(
                Q(professional_registration_submissions__profession_id=profession_id)
                | Q(professional_registration_submissions__selected_profession_ids__contains=[str(profession_id)])
                | Q(professional_registration_submissions__selected_profession_ids__contains=str(profession_id))
            )

        # Email verified filter
        verified = request.query_params.get("verified")
        if verified == "true":
            qs = qs.filter(email_verified=True)
        elif verified == "false":
            qs = qs.filter(email_verified=False)

        # Distinct after joins
        qs = qs.distinct()

        # Ordering
        ordering = params.get("ordering") or "-date_joined"
        qs = qs.order_by(ordering)

        return paginated_success(
            request,
            qs,
            AdminUserListSerializer,
            message="Users retrieved successfully.",
        )


class AdminUserDetailAPIView(APIView):
    """GET /api/v1/admin/users/:id/ — retrieve single user."""

    permission_classes = [IsAdminRole]

    def get(self, request, pk):
        user = get_object_or_404(
            User.objects.prefetch_related(
                Prefetch(
                    "professional_registration_submissions",
                    queryset=ProfessionalRegistrationSubmission.objects.select_related(
                        "category", "group", "profession"
                    ).order_by("-created_at"),
                )
            ),
            pk=pk,
        )
        return api_success(
            data=AdminUserDetailSerializer(user).data,
            message="User retrieved.",
        )

    def patch(self, request, pk):
        """PATCH — update role / phone etc."""
        user = get_object_or_404(User, pk=pk)
        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_error("Validation error.", serializer.errors)
        serializer.save()
        return api_success(
            data=AdminUserDetailSerializer(user).data,
            message="User updated.",
        )

    def delete(self, request, pk):
        """DELETE — permanently delete user."""
        user = get_object_or_404(User, pk=pk)
        if user == request.user:
            return api_error("You cannot delete your own account.", status_code=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return api_success(message="User deleted successfully.")


class AdminUserActivateAPIView(APIView):
    """POST /api/v1/admin/users/:id/activate/ — activate a user."""

    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = True
        user.save(update_fields=["is_active"])
        return api_success(
            data=AdminUserDetailSerializer(user).data,
            message=f"User {user.email} has been activated.",
        )


class AdminUserDeactivateAPIView(APIView):
    """POST /api/v1/admin/users/:id/deactivate/ — deactivate/block a user."""

    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user == request.user:
            return api_error("You cannot deactivate your own account.", status_code=status.HTTP_400_BAD_REQUEST)
        user.is_active = False
        user.save(update_fields=["is_active"])
        return api_success(
            data=AdminUserDetailSerializer(user).data,
            message=f"User {user.email} has been deactivated.",
        )


class AdminUserResetPasswordAPIView(APIView):
    """POST /api/v1/admin/users/:id/reset-password/ — generate or regenerate a temporary password."""

    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        from apps.accounts.services.user_provisioning import generate_and_set_user_temp_password

        temp_password = generate_and_set_user_temp_password(user)

        data = {
            "user_id": user.id,
            "email": user.email,
            "name": user.get_full_name() or user.username,
            "role": user.role,
            "temp_password": temp_password,
            "password_change_required": True,
        }
        return api_success(
            data=data,
            message=f"Temporary password generated successfully for {user.email}.",
        )
