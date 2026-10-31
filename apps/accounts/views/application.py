import random
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_error, api_success
from apps.accounts.models import (
    ProfessionalApplication,
    ApplicationDocument,
    ApplicationReviewHistory,
    User,
)
from apps.accounts.permissions import IsAdminRole, PasswordChangeCompleted
from apps.accounts.serializers.application import (
    ProfessionalApplicationSubmitSerializer,
    ProfessionalApplicationDetailSerializer,
)


class ProfileCompletionAPIView(APIView):
    """
    Returns live profile completion percentage, missing fields, and active application status.
    Consumed by the persistent dashboard completion banner and popup.
    """
    permission_classes = [IsAuthenticated, PasswordChangeCompleted]

    def get(self, request):
        status_data = request.user.get_profile_completion_status()
        return api_success(data=status_data, message="Profile completion status retrieved.")


class ApplicationSubmitAPIView(APIView):
    """
    Unified multi-step application submission for:
    - Legal Professionals (Advocate, Legal Consultant, Researcher, Forensic, Drafting)
    - Other Professionals (Chartered Accountant)
    - Volunteers
    Consumes validated frontend JSON form payload and documents.
    """
    permission_classes = [IsAuthenticated, PasswordChangeCompleted]

    def post(self, request):
        serializer = ProfessionalApplicationSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(message="Invalid application data.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        user = request.user
        year = timezone.now().year

        with transaction.atomic():
            # Generate unique application reference
            ref = f"ICJ-APP-{year}-{random.randint(10000, 99999)}"
            while ProfessionalApplication.objects.filter(application_reference=ref).exists():
                ref = f"ICJ-APP-{year}-{random.randint(10000, 99999)}"

            app = ProfessionalApplication.objects.create(
                user=user,
                application_reference=ref,
                pathway=validated["pathway"],
                category=validated["category"],
                status=ProfessionalApplication.Status.UNDER_REVIEW,
                personal_data=validated.get("personal_data", {}),
                professional_data=validated.get("professional_data", {}),
                category_data=validated.get("category_data", {}),
            )

            # Process attached documents
            for key, file_obj in request.FILES.items():
                clean_key = key.removeprefix("document_").removeprefix("doc_")
                ApplicationDocument.objects.create(
                    application=app,
                    document_key=clean_key,
                    document_title=clean_key.replace("_", " ").title(),
                    file=file_obj,
                    file_name=getattr(file_obj, "name", clean_key),
                    file_size_bytes=getattr(file_obj, "size", 0),
                )

            # Record initial history
            ApplicationReviewHistory.objects.create(
                application=app,
                action="SUBMITTED",
                actor=user,
                note="Application successfully submitted by candidate.",
            )

            # Set status to under_review once submitted
            app.status = ProfessionalApplication.Status.UNDER_REVIEW
            app.save(update_fields=["status"])

        # Trigger notifications
        try:
            from apps.core.notifications import send_system_notification
            send_system_notification(
                title=f"Empanelment Application Lodged ({app.application_reference})",
                message=f"Your empanelment application for {app.category} has been received and is under official scrutiny.",
                notification_type="application",
                scope="user",
                recipient=user,
                link="/dashboard/member",
            )
            send_system_notification(
                title="New Empanelment Application",
                message=f"Candidate {user.get_full_name() or user.email} submitted empanelment application ({app.application_reference}) for {app.category}.",
                notification_type="application",
                scope="admin",
                link="/admin/applications",
            )
        except Exception:
            pass

        return api_success(
            data=ProfessionalApplicationDetailSerializer(app).data,
            message="Your application has been received and is under review by the ICJ Empanelment Committee.",
            status_code=status.HTTP_201_CREATED,
        )


class MyApplicationStatusAPIView(APIView):
    """Retrieves all applications and review status for the authenticated user."""
    permission_classes = [IsAuthenticated, PasswordChangeCompleted]

    def get(self, request):
        apps = ProfessionalApplication.objects.filter(user=request.user).order_by("-created_at")
        serializer = ProfessionalApplicationDetailSerializer(apps, many=True)
        return api_success(data=serializer.data, message="Applications retrieved.")


class AdminApplicationListAPIView(APIView):
    """Administrative review: lists all applications with filtering and search."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        qs = ProfessionalApplication.objects.select_related("user").prefetch_related("documents").order_by("-created_at")

        pathway = request.query_params.get("pathway")
        if pathway:
            qs = qs.filter(pathway=pathway)

        status_param = request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        search = request.query_params.get("search")
        if search:
            qs = qs.filter(
                application_reference__icontains=search
            ) | qs.filter(user__email__icontains=search) | qs.filter(user__first_name__icontains=search)

        serializer = ProfessionalApplicationDetailSerializer(qs, many=True)
        return api_success(data=serializer.data, message="Applications retrieved for review.")


class AdminApplicationDetailAPIView(APIView):
    """Administrative review: detailed view of an application."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, pk):
        try:
            app = ProfessionalApplication.objects.select_related("user").prefetch_related("documents", "review_history").get(pk=pk)
        except ProfessionalApplication.DoesNotExist:
            return api_error(message="Application not found.", status_code=status.HTTP_404_NOT_FOUND)

        return api_success(data=ProfessionalApplicationDetailSerializer(app).data, message="Application retrieved.")


class AdminApplicationReviewAPIView(APIView):
    """
    Administrative review decision:
    - Approve (promotes user role to appropriate professional tier, unlocking modules)
    - Reject (records mandatory reason)
    - Request Info (records note for candidate)
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        try:
            app = ProfessionalApplication.objects.select_related("user").get(pk=pk)
        except ProfessionalApplication.DoesNotExist:
            return api_error(message="Application not found.", status_code=status.HTTP_404_NOT_FOUND)

        decision = (request.data.get("decision") or request.data.get("action") or "").lower().strip()
        note = (request.data.get("note") or request.data.get("notes") or "").strip()

        if decision not in {"approve", "reject", "request_info"}:
            return api_error(message="Invalid decision. Choose from 'approve', 'reject', or 'request_info'.", status_code=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            reviewer = request.user
            app.reviewed_by = reviewer
            app.reviewed_at = timezone.now()

            if decision == "approve":
                app.status = ProfessionalApplication.Status.APPROVED
                # Update user role to pathway
                user = app.user
                if app.pathway == ProfessionalApplication.Pathway.LEGAL_PROFESSIONAL:
                    user.role = User.Role.LEGAL_PROFESSIONAL
                elif app.pathway == ProfessionalApplication.Pathway.OTHER_PROFESSIONAL:
                    user.role = User.Role.OTHER_PROFESSIONAL
                elif app.pathway == ProfessionalApplication.Pathway.VOLUNTEER:
                    user.role = User.Role.VOLUNTEER
                user.save(update_fields=["role"])

                ApplicationReviewHistory.objects.create(
                    application=app,
                    action="APPROVED",
                    actor=reviewer,
                    note=note or "Application approved by ICJ Empanelment Committee.",
                )

            elif decision == "reject":
                if not note:
                    return api_error(message="A rejection reason is mandatory.", status_code=status.HTTP_400_BAD_REQUEST)
                app.status = ProfessionalApplication.Status.REJECTED
                app.rejection_reason = note
                ApplicationReviewHistory.objects.create(
                    application=app,
                    action="REJECTED",
                    actor=reviewer,
                    note=note,
                )

            elif decision == "request_info":
                if not note:
                    return api_error(message="Please provide instructions detailing what additional information is required.", status_code=status.HTTP_400_BAD_REQUEST)
                app.status = ProfessionalApplication.Status.INFO_REQUESTED
                app.info_request_note = note
                ApplicationReviewHistory.objects.create(
                    application=app,
                    action="INFO_REQUESTED",
                    actor=reviewer,
                    note=note,
                )

            app.save()

        # Trigger notification to candidate
        try:
            from apps.core.notifications import send_system_notification
            if decision == "approve":
                send_system_notification(
                    title=f"Empanelment Approved! ({app.application_reference})",
                    message=f"Congratulations! Your empanelment application ({app.application_reference}) as {app.category} has been approved. Your professional privileges are now active.",
                    notification_type="success",
                    scope="user",
                    recipient=app.user,
                    link="/dashboard/profile",
                )
            elif decision == "reject":
                send_system_notification(
                    title=f"Empanelment Status Update ({app.application_reference})",
                    message=f"Your empanelment application was not approved. Committee note: {note}",
                    notification_type="error",
                    scope="user",
                    recipient=app.user,
                    link="/dashboard/member",
                )
            elif decision == "request_info":
                send_system_notification(
                    title=f"Information Requested ({app.application_reference})",
                    message=f"The scrutiny board requires additional details for your empanelment application: {note}",
                    notification_type="warning",
                    scope="user",
                    recipient=app.user,
                    link="/dashboard/member",
                )
        except Exception:
            pass

        return api_success(
            data=ProfessionalApplicationDetailSerializer(app).data,
            message=f"Application {app.application_reference} status updated to {app.get_status_display()}.",
        )

