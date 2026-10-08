from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_error, api_success
from common.api_listing import list_params, paginated_success
from common.listing import apply_search, apply_ordering

from apps.accounts.permissions import PasswordChangeCompleted
from apps.professional_onboarding.models.submission import ProfessionalRegistrationSubmission
from apps.services.models import LegalCase
from apps.services.serializers import LegalCaseSerializer


class ProfessionalBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted]

    def _get_approved_group_ids(self, user) -> list:
        """Return group IDs from approved professional registration submissions for this user."""
        approved_subs = ProfessionalRegistrationSubmission.objects.filter(
            user=user,
            status=ProfessionalRegistrationSubmission.Status.APPROVED,
        ).values_list('selected_group_ids', flat=True)
        group_ids = []
        for gids in approved_subs:
            if isinstance(gids, list):
                group_ids.extend(gids)
        return list(set(group_ids))


class ProfessionalAvailableCasesAPIView(ProfessionalBaseView):
    """
    List all OPEN cases that belong to this professional's approved groups.
    A professional can only see cases from groups they are approved in.
    """
    def get(self, request):
        group_ids = self._get_approved_group_ids(request.user)
        if not group_ids:
            return api_success(data={"count": 0, "results": []}, message="No approved groups found.")

        params = list_params(request)
        qs = LegalCase.objects.filter(
            professional_group__id__in=group_ids,
            status=LegalCase.Status.OPEN,
        ).select_related('assistance_request', 'professional', 'professional_group')

        qs = apply_search(qs, params.get("search"), "case_id", "assistance_request__full_name")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, LegalCaseSerializer, message="Available cases retrieved.")


class ProfessionalTakeCaseAPIView(ProfessionalBaseView):
    """
    Professional takes/accepts a case.
    - Case must be OPEN.
    - Case must belong to one of professional's approved groups.
    - Once taken, status changes to ASSIGNED and professional is set.
    - No other professional can take it after this.
    """
    def post(self, request, pk):
        group_ids = self._get_approved_group_ids(request.user)
        if not group_ids:
            return api_error("You have no approved professional groups.", status_code=403)

        case_obj = get_object_or_404(
            LegalCase.objects.select_related('assistance_request', 'professional_group'),
            pk=pk,
        )

        # Check the case is in professional's group
        if str(case_obj.professional_group_id) not in group_ids:
            return api_error("This case does not belong to your professional group.", status_code=403)

        # Check case is still OPEN (not yet taken)
        if case_obj.status != LegalCase.Status.OPEN:
            return api_error("This case has already been taken by another professional.", status_code=400)

        # Assign and lock the case
        case_obj.professional = request.user
        case_obj.status = LegalCase.Status.ASSIGNED
        case_obj.save()

        return api_success(data=LegalCaseSerializer(case_obj).data, message="Case accepted successfully.")


class ProfessionalMyCasesAPIView(ProfessionalBaseView):
    """
    List all cases assigned to (taken by) this professional.
    """
    def get(self, request):
        params = list_params(request)
        qs = LegalCase.objects.filter(
            professional=request.user,
        ).select_related('assistance_request', 'professional_group')

        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)

        qs = apply_search(qs, params.get("search"), "case_id", "assistance_request__full_name")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, LegalCaseSerializer, message="My cases retrieved.")


class ProfessionalCaseDetailAPIView(ProfessionalBaseView):
    """
    Get full details of a case.
    The professional can only view it if:
    1. It's OPEN and belongs to their approved group, OR
    2. It's already assigned to them.
    """
    def get(self, request, pk):
        case_obj = get_object_or_404(
            LegalCase.objects.select_related('assistance_request', 'professional_group', 'professional'),
            pk=pk,
        )

        group_ids = self._get_approved_group_ids(request.user)

        # Check permissions
        can_view = False
        if case_obj.professional == request.user:
            can_view = True
        elif case_obj.status == LegalCase.Status.OPEN and str(case_obj.professional_group_id) in group_ids:
            can_view = True
            
        if not can_view:
            return api_error("You do not have permission to view this case.", status_code=403)

        return api_success(data=LegalCaseSerializer(case_obj).data, message="Case details retrieved.")
