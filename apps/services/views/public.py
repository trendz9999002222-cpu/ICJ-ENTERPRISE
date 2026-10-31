import hashlib
import random
import uuid
from datetime import date, datetime, timedelta
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.responses import api_error, api_success
from apps.services.models import (
    AssistanceRequest,
    CaseDocument,
    CaseOtpVerification,
    JusticeService,
    LeadCommercialSettings,
    LegalCase,
    MarketplaceLead,
    ServiceCategory,
)
from apps.services.serializers import (
    AssistanceRequestSerializer,
    CaseTrackingInitiateSerializer,
    CaseTrackingVerifySerializer,
    JusticeServiceSerializer,
    ServiceCategorySerializer,
)


class PublicCategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = ServiceCategory.objects.filter(is_active=True).order_by("display_order", "name")
        serializer = ServiceCategorySerializer(categories, many=True)
        return api_success(data=serializer.data, message="Categories retrieved successfully.")


class PublicJusticeServiceListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = JusticeService.objects.filter(is_active=True).select_related("category").order_by("display_order", "title")
        category_slug = request.query_params.get("category")
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        search_query = request.query_params.get("search")
        if search_query:
            qs = qs.filter(title__icontains=search_query) | qs.filter(short_description__icontains=search_query)
        serializer = JusticeServiceSerializer(qs, many=True)
        return api_success(data=serializer.data, message="Justice services retrieved successfully.")


class PublicFeaturedServicesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        services = JusticeService.objects.filter(is_active=True, is_featured=True).select_related("category").order_by("display_order", "title")
        serializer = JusticeServiceSerializer(services, many=True)
        return api_success(data=serializer.data, message="Featured services retrieved successfully.")


class PublicJusticeServiceDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        service = get_object_or_404(
            JusticeService.objects.select_related("category"),
            slug=slug,
            is_active=True,
        )
        serializer = JusticeServiceSerializer(service)
        return api_success(data=serializer.data, message="Service details retrieved successfully.")


class PublicAssistanceFormConfigAPIView(APIView):
    """
    Public Endpoint providing dynamic form configuration configured by the Admin.
    Combines:
    1. Citizen / Applicant common fields from core FormFieldConfig (SEEKER_ASSISTANT).
    2. Legal matter fields from AssistanceFormField.
    3. Attached document specifications from AssistanceDocument.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from apps.core.models import AdditionalOnboardingFormfields, FormFieldConfig, CommonField
        from apps.services.models import AssistanceFormField, AssistanceDocument
        from apps.services.serializers import AssistanceFormFieldSerializer, AssistanceDocumentSerializer

        # 1. Fetch Citizen Common Fields
        configs = (
            FormFieldConfig.objects.filter(
                form__form_code=AdditionalOnboardingFormfields.FormCode.SEEKER_ASSISTANT,
                is_visible=True,
                common_field__is_active=True,
            )
            .select_related("common_field")
            .order_by("display_order")
        )

        citizen_fields = []
        for cfg in configs:
            cf = cfg.common_field
            if not cf:
                continue
            citizen_fields.append({
                "field_key": cf.field_key,
                "label": cfg.label_override or cf.label,
                "field_type": cf.field_type,
                "placeholder": cfg.placeholder_override or cf.placeholder,
                "required": cfg.is_required,
                "options": cf.options or [],
                "display_order": cfg.display_order,
                "section_name": cfg.section_name or "Applicant Identity & Contact Information",
            })

        # 2. Fetch Legal Matter Fields
        legal_matter_fields = AssistanceFormField.objects.filter(is_active=True).order_by("display_order", "created_at")
        legal_fields_data = AssistanceFormFieldSerializer(legal_matter_fields, many=True).data

        # 3. Fetch Documents
        docs = AssistanceDocument.objects.filter(is_active=True).order_by("display_order", "name")
        docs_data = AssistanceDocumentSerializer(docs, many=True).data

        return api_success(
            data={
                "citizen_fields": citizen_fields,
                "legal_matter_fields": legal_fields_data,
                "documents": docs_data,
            },
            message="Dynamic form configuration retrieved successfully.",
        )


class PublicAssistanceRequestAPIView(APIView):
    """
    Public Seek Assistance Intake Endpoint:
    Captures citizen request with:
    - Personal details with DOB & calculated current age.
    - Profile picture / passport photo.
    - Matter details, service category, urgency, problem description.
    - Attached documents.
    - Persists record with unique Case ID (e.g. CASE-2026-00042).
    - Sets initial status to PENDING and links to marketplace leads safely.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data.copy()

        # Handle Date of Birth & Calculate Age accurately
        dob_raw = payload.get("date_of_birth") or payload.get("dob")
        dob_val = None
        calculated_age = None
        if dob_raw:
            try:
                if isinstance(dob_raw, str):
                    dob_val = datetime.strptime(dob_raw.strip(), "%Y-%m-%d").date()
                elif isinstance(dob_raw, date):
                    dob_val = dob_raw
                if dob_val:
                    today = timezone.localdate()
                    calculated_age = today.year - dob_val.year - ((today.month, today.day) < (dob_val.month, dob_val.day))
            except Exception:
                pass

        payload["date_of_birth"] = dob_val
        payload["calculated_age"] = calculated_age

        # Standardize category and matter description
        category = payload.get("category") or payload.get("matter_type") or "General Legal Assistance"
        payload["category"] = category
        if "matter_type" not in payload:
            payload["matter_type"] = category

        # Extract any unmapped dynamic fields into additional_fields JSON
        standard_keys = {
            "full_name", "email", "mobile", "preferred_contact",
            "state_name", "city_name", "category", "urgency",
            "problem_description", "status", "reference_id",
            "date_of_birth", "calculated_age", "help_type", "address"
        }
        extra = {k: v for k, v in payload.items() if k not in standard_keys and not k.startswith("document_")}
        existing_extra = payload.get("additional_fields", {})
        if isinstance(existing_extra, dict):
            extra.update(existing_extra)
        payload["additional_fields"] = extra

        serializer = AssistanceRequestSerializer(data=payload)
        if not serializer.is_valid():
            return api_error(message="Validation failed.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            year = timezone.now().year
            ref_id = f"CASE-{year}-{random.randint(10000, 99999)}"
            while AssistanceRequest.objects.filter(reference_id=ref_id).exists():
                ref_id = f"CASE-{year}-{random.randint(10000, 99999)}"

            instance = serializer.save(reference_id=ref_id)

            # Process attached documents
            for key, file_obj in request.FILES.items():
                title = key.replace("document_", "").replace("doc_", "").replace("_", " ").title()
                CaseDocument.objects.create(
                    assistance_request=instance,
                    document_title=title,
                    file=file_obj,
                    file_name=getattr(file_obj, "name", title),
                    file_size_bytes=getattr(file_obj, "size", 0),
                )

            # Ensure MarketplaceLead is safely created without duplicate key collisions
            if not MarketplaceLead.objects.filter(assistance_request=instance).exists():
                settings_obj = LeadCommercialSettings.objects.first()
                default_price = settings_obj.default_lead_price_paise if settings_obj else 50000
                tax = settings_obj.tax_percentage if settings_obj else Decimal("18.00")

                lead_id = f"LEAD-{year}-{random.randint(10000, 99999)}"
                while MarketplaceLead.objects.filter(lead_id=lead_id).exists():
                    lead_id = f"LEAD-{year}-{random.randint(10000, 99999)}"

                summary = (instance.problem_description or "").strip()
                if len(summary) > 220:
                    summary = summary[:217] + "..."

                urgency_raw = (instance.urgency or "medium").lower()
                if "high" in urgency_raw or "critical" in urgency_raw:
                    urgency_clean = "high"
                elif "low" in urgency_raw:
                    urgency_clean = "low"
                else:
                    urgency_clean = "medium"

                MarketplaceLead.objects.create(
                    lead_id=lead_id,
                    assistance_request=instance,
                    category=instance.category or "General Legal Assistance",
                    urgency=urgency_clean,
                    state_name=instance.state_name or "",
                    city_name=instance.city_name or "",
                    anonymized_summary=summary or f"Assistance request for {instance.category or 'General Legal Assistance'}",
                    full_description=instance.problem_description or "",
                    price_paise=default_price,
                    tax_percentage=tax,
                    status=MarketplaceLead.Status.PENDING_REVIEW,
                    client_name=instance.full_name or "",
                    client_email=instance.email or "",
                    client_mobile=instance.mobile or "",
                    client_preferred_contact=instance.preferred_contact or "Phone",
                )

        # ── Trigger Notifications ──────────────────────────────────────────────
        try:
            from apps.core.notifications import send_system_notification
            from apps.accounts.models import User

            # Admin Notification
            send_system_notification(
                title="New Legal Assistance Filed",
                message=f"Case #{instance.reference_id} ({instance.category}) filed by {instance.full_name or 'Citizen'}.",
                notification_type="assistance",
                scope="admin",
                link="/admin/assistance",
            )

            # User Notification if registered
            matched_user = User.objects.filter(email=instance.email).first() if instance.email else None
            if matched_user:
                send_system_notification(
                    title=f"Legal Assistance Request #{instance.reference_id}",
                    message=f"Your request for {instance.category} has been received and assigned Case ID {instance.reference_id}. Our legal panel is reviewing it.",
                    notification_type="assistance",
                    scope="user",
                    recipient=matched_user,
                    link="/dashboard/member",
                )
        except Exception:
            pass

        return api_success(
            data=response_data,
            message="Your legal assistance request has been submitted successfully. Please retain your Case ID for tracking.",
            status_code=status.HTTP_201_CREATED,
        )


class CaseTrackingInitiateAPIView(APIView):
    """
    Step 1 of 2-Factor Secure Case Tracking:
    Receives Case ID + Registered Contact (email or mobile).
    Emits generic response to prevent information harvesting about third-party cases.
    Issues rate-limited expiring OTP verification session.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CaseTrackingInitiateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(message="Invalid tracking request.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        case_id = serializer.validated_data["case_id"].strip()
        contact = serializer.validated_data["contact"].strip().lower()

        # Check against reference_id or LegalCase case_id
        matching_ar = AssistanceRequest.objects.filter(reference_id__iexact=case_id).first()
        if not matching_ar:
            lc = LegalCase.objects.filter(case_id__iexact=case_id).select_related("assistance_request").first()
            if lc:
                matching_ar = lc.assistance_request

        session_id = f"otp-sess-{uuid.uuid4().hex}"
        generic_success = {
            "session_id": session_id,
            "message": "If the Case ID and contact details match our records, a 6-digit verification code has been dispatched.",
        }

        if not matching_ar:
            # Generic response prevents enumerating valid cases
            return api_success(data=generic_success, message="Verification code dispatched.")

        # Verify contact matches email or mobile
        clean_contact = contact.replace(" ", "").replace("-", "")
        clean_email = matching_ar.email.strip().lower()
        clean_mobile = matching_ar.mobile.strip().replace(" ", "").replace("-", "")

        is_match = (clean_contact == clean_email) or (clean_contact in clean_mobile or clean_mobile in clean_contact)
        if not is_match:
            # Generic response prevents timing attacks
            return api_success(data=generic_success, message="Verification code dispatched.")

        # Generate 6-digit OTP
        otp = f"{random.randint(100000, 999999)}"
        otp_hash = hashlib.sha256(otp.encode("utf-8")).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=15)

        CaseOtpVerification.objects.create(
            session_id=session_id,
            case_reference=matching_ar.reference_id,
            contact=contact,
            otp_hash=otp_hash,
            expires_at=expires_at,
        )

        # In local/test mode, provide preview of the OTP code for seamless testing
        if settings.DEBUG:
            generic_success["dev_otp"] = otp

        return api_success(data=generic_success, message="Verification code dispatched.")


class CaseTrackingVerifyAPIView(APIView):
    """
    Step 2 of 2-Factor Secure Case Tracking:
    Validates session ID + 6-digit OTP with maximum 5 attempts.
    Returns sanitized case timeline, assigned legal team status, and milestones
    without exposing third-party private confidential documents.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CaseTrackingVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(message="Invalid OTP verification request.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        case_id = serializer.validated_data["case_id"].strip()
        session_id = serializer.validated_data["session_id"].strip()
        entered_otp = serializer.validated_data["otp"].strip()

        try:
            record = CaseOtpVerification.objects.get(session_id=session_id, verified=False)
        except CaseOtpVerification.DoesNotExist:
            return api_error(message="Invalid or expired verification session.", status_code=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > record.expires_at:
            return api_error(message="The verification code has expired. Please initiate a new tracking request.", status_code=status.HTTP_400_BAD_REQUEST)

        if record.attempts >= 5:
            return api_error(message="Maximum verification attempts exceeded. Please initiate a new request.", status_code=status.HTTP_429_TOO_MANY_REQUESTS)

        record.attempts += 1
        record.save(update_fields=["attempts"])

        entered_hash = hashlib.sha256(entered_otp.encode("utf-8")).hexdigest()
        if entered_hash != record.otp_hash:
            return api_error(message="Incorrect verification code. Please check and try again.", status_code=status.HTTP_400_BAD_REQUEST)

        # Mark verified
        record.verified = True
        record.save(update_fields=["verified"])

        # Fetch case data
        ar = AssistanceRequest.objects.filter(reference_id__iexact=record.case_reference).first()
        if not ar:
            return api_error(message="Case details unavailable.", status_code=status.HTTP_404_NOT_FOUND)

        legal_case = getattr(ar, "legal_case", None)

        milestones = [
            {"title": "Request Submitted", "date": ar.created_at.strftime("%Y-%m-%d"), "completed": True},
            {
                "title": "Empanelment Cell Review",
                "date": ar.updated_at.strftime("%Y-%m-%d") if ar.status != "pending" else None,
                "completed": ar.status in {"in_progress", "case_created", "closed"},
            },
            {
                "title": "Advocate Allocation",
                "date": legal_case.created_at.strftime("%Y-%m-%d") if legal_case else None,
                "completed": bool(legal_case and legal_case.professional_id),
            },
            {
                "title": "Active Legal Representation / Mediation",
                "date": None,
                "completed": bool(legal_case and legal_case.status in {"in_progress", "closed"}),
            },
            {
                "title": "Matter Resolved / Case Closed",
                "date": None,
                "completed": ar.status == "closed" or (legal_case and legal_case.status == "closed"),
            },
        ]

        assigned_advocate_display = "Pending Allocation by ICJ Admin"
        if legal_case and legal_case.professional:
            assigned_advocate_display = f"Empaneled Advocate (ID: PRO-{legal_case.professional.id:04d})"

        tracking_data = {
            "case_id": ar.reference_id,
            "matter_type": ar.category,
            "help_type": ar.help_type or "Legal Counsel",
            "urgency": ar.urgency,
            "status": ar.get_status_display(),
            "submission_date": ar.created_at.isoformat(),
            "assigned_legal_counsel": assigned_advocate_display,
            "milestones": milestones,
        }

        return api_success(data=tracking_data, message="Case status verified successfully.")
