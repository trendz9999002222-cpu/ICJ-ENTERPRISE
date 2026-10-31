"""
Admin views for Case Reassignment and Installment Schedule management.
"""
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_error, api_success
from apps.accounts.permissions import IsAdminRole, PasswordChangeCompleted
from apps.accounts.models import User
from apps.services.models import (
    LegalCase,
    CaseAssignmentHistory,
    CaseInstallmentSchedule,
)
from apps.services.serializers import (
    LegalCaseSerializer,
    CaseReassignSerializer,
    CaseInstallmentScheduleSerializer,
)


class AdminCasesBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted, IsAdminRole]


class AdminCaseReassignAPIView(AdminCasesBaseView):
    """
    POST /api/v1/admin/services/cases/<pk>/reassign/
    Reassign a legal case to a different professional.
    Records full audit trail in CaseAssignmentHistory.
    Requires a mandatory business reason (min 10 chars).
    """

    def post(self, request, pk):
        legal_case = get_object_or_404(LegalCase, pk=pk)

        serializer = CaseReassignSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(
                message="Invalid reassignment request.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        new_professional_id = serializer.validated_data["new_professional_id"]
        reason = serializer.validated_data["reassignment_reason"]
        notify_client = serializer.validated_data.get("notify_client", True)

        # Validate the new professional exists and is a valid user
        try:
            new_professional = User.objects.get(pk=new_professional_id)
        except User.DoesNotExist:
            return api_error(
                message="The specified professional does not exist.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Prevent self-reassignment to the same professional
        if legal_case.professional and legal_case.professional.pk == new_professional.pk:
            return api_error(
                message="The case is already assigned to this professional.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            previous_professional = legal_case.professional

            # Create audit trail before changing assignment
            CaseAssignmentHistory.objects.create(
                legal_case=legal_case,
                previous_professional=previous_professional,
                new_professional=new_professional,
                reassigned_by=request.user,
                reason=reason,
                notify_client=notify_client,
            )

            # Perform the reassignment
            legal_case.professional = new_professional
            if legal_case.status == LegalCase.Status.OPEN:
                legal_case.status = LegalCase.Status.ASSIGNED
            legal_case.save(update_fields=["professional", "status", "updated_at"])

        return api_success(
            data=LegalCaseSerializer(legal_case).data,
            message=f"Case {legal_case.case_id} successfully reassigned to {new_professional.get_full_name() or new_professional.email}.",
            status_code=status.HTTP_200_OK,
        )


class AdminCaseInstallmentListCreateAPIView(AdminCasesBaseView):
    """
    GET  /api/v1/admin/services/cases/<pk>/installments/  — list all installments
    POST /api/v1/admin/services/cases/<pk>/installments/  — create a new installment
    """

    def get(self, request, pk):
        legal_case = get_object_or_404(LegalCase, pk=pk)
        installments = legal_case.installments.all()
        return api_success(
            data=CaseInstallmentScheduleSerializer(installments, many=True).data,
            message="Installment schedule retrieved.",
        )

    def post(self, request, pk):
        legal_case = get_object_or_404(LegalCase, pk=pk)

        serializer = CaseInstallmentScheduleSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(
                message="Invalid installment data.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Check total percentage does not exceed 100%
        existing_pct = sum(
            i.percentage for i in legal_case.installments.all()
        )
        new_pct = serializer.validated_data.get("percentage", 0)
        if existing_pct + new_pct > 100:
            return api_error(
                message=f"Total installment percentages would exceed 100% (current: {existing_pct}%, adding: {new_pct}%).",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        installment = serializer.save(legal_case=legal_case)
        return api_success(
            data=CaseInstallmentScheduleSerializer(installment).data,
            message="Installment created.",
            status_code=status.HTTP_201_CREATED,
        )


class AdminCaseInstallmentDetailAPIView(AdminCasesBaseView):
    """
    GET    /api/v1/admin/services/cases/<pk>/installments/<inst_pk>/
    PATCH  /api/v1/admin/services/cases/<pk>/installments/<inst_pk>/
    DELETE /api/v1/admin/services/cases/<pk>/installments/<inst_pk>/
    """

    def _get_installment(self, case_pk, inst_pk):
        legal_case = get_object_or_404(LegalCase, pk=case_pk)
        return get_object_or_404(CaseInstallmentSchedule, pk=inst_pk, legal_case=legal_case)

    def get(self, request, pk, inst_pk):
        installment = self._get_installment(pk, inst_pk)
        return api_success(
            data=CaseInstallmentScheduleSerializer(installment).data,
            message="Installment retrieved.",
        )

    def patch(self, request, pk, inst_pk):
        installment = self._get_installment(pk, inst_pk)
        serializer = CaseInstallmentScheduleSerializer(
            installment, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return api_error(
                message="Invalid installment data.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Re-validate total percentage if percentage is being changed
        if "percentage" in serializer.validated_data:
            legal_case = installment.legal_case
            existing_pct = sum(
                i.percentage
                for i in legal_case.installments.exclude(pk=inst_pk)
            )
            new_pct = serializer.validated_data["percentage"]
            if existing_pct + new_pct > 100:
                return api_error(
                    message=f"Total installment percentages would exceed 100% (others: {existing_pct}%, new: {new_pct}%).",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        serializer.save()
        return api_success(
            data=CaseInstallmentScheduleSerializer(installment).data,
            message="Installment updated.",
        )

    def delete(self, request, pk, inst_pk):
        installment = self._get_installment(pk, inst_pk)
        if installment.status == CaseInstallmentSchedule.Status.PAID:
            return api_error(
                message="Cannot delete a paid installment.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        installment.delete()
        return api_success(message="Installment deleted.")

