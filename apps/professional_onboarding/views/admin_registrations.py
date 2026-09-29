"""
Admin views for managing professional registration submissions.
- List & detail
- Approve / Reject / Set under_review
- Delete
"""

from django.shortcuts import get_object_or_404
from rest_framework import status

from common.api_listing import list_params, paginated_success
from common.responses import api_error, api_success

from apps.professional_onboarding.models import ProfessionalRegistrationSubmission
from apps.professional_onboarding.serializers.professional_registration import (
    ProfessionalRegistrationSubmissionDetailSerializer,
    ProfessionalRegistrationSubmissionListSerializer,
)
from apps.professional_onboarding.services.registration_queries import filter_registrations
from apps.professional_onboarding.views.base import AdminConfigAPIView


class AdminRegistrationListAPIView(AdminConfigAPIView):
    def get(self, request):
        params = list_params(request)
        qs = ProfessionalRegistrationSubmission.objects.select_related("user").all()
        qs = filter_registrations(
            qs,
            search=params.get("search"),
            status=request.query_params.get("status"),
            category_id=request.query_params.get("category"),
            group_id=request.query_params.get("group"),
            profession_id=request.query_params.get("profession"),
            created_from=request.query_params.get("created_from"),
            created_to=request.query_params.get("created_to"),
            ordering=params.get("ordering") or "-created_at",
        )
        return paginated_success(
            request,
            qs,
            ProfessionalRegistrationSubmissionListSerializer,
            message="Registrations retrieved.",
        )


class AdminRegistrationDetailAPIView(AdminConfigAPIView):
    def get(self, request, pk):
        obj = get_object_or_404(
            ProfessionalRegistrationSubmission.objects.select_related("user").prefetch_related("files"),
            pk=pk,
        )
        return api_success(
            data=ProfessionalRegistrationSubmissionDetailSerializer(obj, context={"request": request}).data,
            message="Registration retrieved.",
        )

    def delete(self, request, pk):
        obj = get_object_or_404(ProfessionalRegistrationSubmission, pk=pk)
        ref = obj.reference_id
        obj.delete()
        return api_success(message=f"Registration {ref} deleted.")


from apps.accounts.services.user_provisioning import provision_user_for_professional


class AdminRegistrationApproveAPIView(AdminConfigAPIView):
    """POST /registrations/:id/approve/ — approve a submission."""

    def post(self, request, pk):
        obj = get_object_or_404(
            ProfessionalRegistrationSubmission.objects.select_related("profession", "user"),
            pk=pk,
        )
        if obj.status == ProfessionalRegistrationSubmission.Status.APPROVED:
            return api_error("Registration is already approved.", status_code=status.HTTP_400_BAD_REQUEST)

        obj.status = ProfessionalRegistrationSubmission.Status.APPROVED
        user, temp_password, is_new = provision_user_for_professional(obj)
        obj.user = user
        obj.save(update_fields=["status", "user", "updated_at"])

        serialized = ProfessionalRegistrationSubmissionDetailSerializer(
            ProfessionalRegistrationSubmission.objects.select_related("user", "profession").prefetch_related("files").get(pk=pk),
            context={"request": request},
        ).data

        response_data = {
            **serialized,
            "credentials": {
                "user_id": user.id,
                "email": user.email,
                "role": user.role,
                "temp_password": temp_password if is_new else None,
                "is_new_user": is_new,
                "password_change_required": user.password_change_required,
            },
        }

        msg = f"Registration {obj.reference_id} approved."
        if is_new and temp_password:
            msg += f" User account created for {user.email} with temporary credentials."

        return api_success(
            data=response_data,
            message=msg,
        )


class AdminRegistrationRejectAPIView(AdminConfigAPIView):
    """POST /registrations/:id/reject/ — reject a submission."""

    def post(self, request, pk):
        obj = get_object_or_404(ProfessionalRegistrationSubmission, pk=pk)
        if obj.status == ProfessionalRegistrationSubmission.Status.REJECTED:
            return api_error("Registration is already rejected.", status_code=status.HTTP_400_BAD_REQUEST)
        obj.status = ProfessionalRegistrationSubmission.Status.REJECTED
        obj.save(update_fields=["status", "updated_at"])
        return api_success(
            data=ProfessionalRegistrationSubmissionDetailSerializer(
                ProfessionalRegistrationSubmission.objects.select_related("user").prefetch_related("files").get(pk=pk),
                context={"request": request},
            ).data,
            message=f"Registration {obj.reference_id} rejected.",
        )


class AdminRegistrationUnderReviewAPIView(AdminConfigAPIView):
    """POST /registrations/:id/under-review/ — mark submission as under review."""

    def post(self, request, pk):
        obj = get_object_or_404(ProfessionalRegistrationSubmission, pk=pk)
        obj.status = ProfessionalRegistrationSubmission.Status.UNDER_REVIEW
        obj.save(update_fields=["status", "updated_at"])
        return api_success(
            data=ProfessionalRegistrationSubmissionDetailSerializer(
                ProfessionalRegistrationSubmission.objects.select_related("user").prefetch_related("files").get(pk=pk),
                context={"request": request},
            ).data,
            message=f"Registration {obj.reference_id} marked as under review.",
        )

