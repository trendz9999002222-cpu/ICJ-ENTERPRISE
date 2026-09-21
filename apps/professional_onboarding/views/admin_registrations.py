from django.shortcuts import get_object_or_404
from rest_framework import status

from common.api_listing import list_params, paginated_success
from common.responses import api_success

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
            data=ProfessionalRegistrationSubmissionDetailSerializer(obj).data,
            message="Registration retrieved.",
        )
