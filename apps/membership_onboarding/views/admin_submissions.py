from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status

from common.api_listing import list_params, paginated_success
from common.responses import api_error, api_success

from apps.membership_onboarding.models import MembershipApplication
from apps.membership_onboarding.serializers.admin import MembershipApplicationDetailSerializer, MembershipApplicationListSerializer
from apps.membership_onboarding.services.approval import approve_application, mark_under_review, reject_application
from apps.membership_onboarding.views.base import AdminMembershipConfigAPIView
from apps.professional_onboarding.services.crud import ServiceError


class MembershipApplicationListAPIView(AdminMembershipConfigAPIView):
    def get(self, request):
        params = list_params(request)
        qs = MembershipApplication.objects.select_related("person", "membership_type").all()
        search = (params.get("search") or "").strip()
        if search:
            qs = qs.filter(
                Q(reference_id__icontains=search)
                | Q(person__full_name__icontains=search)
                | Q(person__email__icontains=search)
                | Q(person__mobile__icontains=search)
            )
        status_filter = params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        type_id = request.query_params.get("membership_type_id")
        if type_id:
            qs = qs.filter(membership_type_id=type_id)
        qs = qs.order_by("-created_at")
        return paginated_success(request, qs, MembershipApplicationListSerializer, message="Applications retrieved.")


class MembershipApplicationDetailAPIView(AdminMembershipConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(
            MembershipApplication.objects.select_related("person", "membership_type", "form").prefetch_related(
                "documents", "history"
            ),
            pk=pk,
        )
        return api_success(
            data=MembershipApplicationDetailSerializer(obj, context={"request": request}).data,
            message="Application retrieved.",
        )


class MembershipApplicationReviewAPIView(AdminMembershipConfigAPIView):
    def post(self, request, pk):
        obj = get_object_or_404(MembershipApplication, pk=pk)
        try:
            obj = mark_under_review(obj, request.user)
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)
        return api_success(data=MembershipApplicationListSerializer(obj).data, message="Marked under review.")


class MembershipApplicationApproveAPIView(AdminMembershipConfigAPIView):
    def post(self, request, pk):
        obj = get_object_or_404(MembershipApplication.objects.select_related("person", "user"), pk=pk)
        try:
            obj, temp_password, is_new = approve_application(obj, request.user)
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)

        data = MembershipApplicationListSerializer(obj).data
        user = obj.user
        if user:
            data["credentials"] = {
                "user_id": user.id,
                "email": user.email,
                "role": user.role,
                "temp_password": temp_password if is_new else None,
                "is_new_user": is_new,
                "password_change_required": user.password_change_required,
            }

        msg = "Application approved."
        if is_new and temp_password and user:
            msg += f" Member user account created for {user.email} with temporary credentials."

        return api_success(data=data, message=msg)


class MembershipApplicationRejectAPIView(AdminMembershipConfigAPIView):
    def post(self, request, pk):
        obj = get_object_or_404(MembershipApplication, pk=pk)
        reason = request.data.get("rejection_reason") or ""
        try:
            obj = reject_application(obj, request.user, reason)
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)
        return api_success(data=MembershipApplicationListSerializer(obj).data, message="Application rejected.")
