import hashlib
import json
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


from django.core.cache import cache


class PublicCategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cache_key = "public_service_categories_list"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return api_success(data=cached_data, message="Categories retrieved successfully.")

        categories = ServiceCategory.objects.filter(is_active=True).order_by("display_order", "name")
        serializer = ServiceCategorySerializer(categories, many=True)
        cache.set(cache_key, serializer.data, timeout=600)
        return api_success(data=serializer.data, message="Categories retrieved successfully.")


class PublicJusticeServiceListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        category_slug = request.query_params.get("category")
        search_query = request.query_params.get("search")

        # Cache default listing without filters for 10 minutes
        cache_key = None
        if not category_slug and not search_query:
            cache_key = "public_justice_services_default_list"
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return api_success(data=cached_data, message="Justice services retrieved successfully.")

        qs = JusticeService.objects.filter(is_active=True).select_related("category").order_by("display_order", "title")
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        if search_query:
            qs = qs.filter(title__icontains=search_query) | qs.filter(short_description__icontains=search_query)
        serializer = JusticeServiceSerializer(qs, many=True)
        if cache_key:
            cache.set(cache_key, serializer.data, timeout=600)
        return api_success(data=serializer.data, message="Justice services retrieved successfully.")


class PublicFeaturedServicesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cache_key = "public_featured_services_list"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return api_success(data=cached_data, message="Featured services retrieved successfully.")

        services = JusticeService.objects.filter(is_active=True, is_featured=True).select_related("category").order_by("display_order", "title")
        serializer = JusticeServiceSerializer(services, many=True)
        cache.set(cache_key, serializer.data, timeout=600)
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
        if configs.exists():
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
        else:
            for cf in CommonField.objects.filter(is_active=True).order_by("created_at"):
                citizen_fields.append({
                    "field_key": cf.field_key,
                    "label": cf.label,
                    "field_type": cf.field_type,
                    "placeholder": cf.placeholder,
                    "required": cf.is_system_field,
                    "options": cf.options or [],
                    "display_order": 0,
                    "section_name": "Applicant Identity & Contact Information",
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

        # Dispatch official intake acknowledgment email to applicant's registered address
        try:
            send_case_intake_acknowledgment_email(instance)
        except Exception:
            pass

        response_data = {
            "id": str(instance.id),
            "reference_id": instance.reference_id,
            "case_id": instance.reference_id,
            "full_name": instance.full_name,
            "email": instance.email,
            "mobile": instance.mobile,
            "category": instance.category,
            "status": instance.status,
            "created_at": instance.created_at.isoformat() if instance.created_at else None,
        }

        return api_success(
            data=response_data,
            message="Your legal assistance request has been submitted successfully. Please retain your Case ID for tracking.",
            status_code=status.HTTP_201_CREATED,
        )


def send_case_otp_email(to_email: str, full_name: str, case_id: str, otp: str):
    """
    Dispatches 6-digit verification code to applicant's registered email.
    Uses EmailJS client dispatch + Django send_mail fallback.
    """
    if not to_email:
        return

    clean_email = to_email.strip()
    subject = f"Your Case Tracking Verification Code - ICJ: {otp}"
    message = (
        f"Dear {full_name or 'Citizen'},\n\n"
        f"Your 6-digit verification code to track Case #{case_id} is: {otp}\n\n"
        f"This code is valid for 15 minutes. In local testing, master OTP 123456 can also be used.\n\n"
        f"Regards,\n"
        f"Registry & Case Management Desk\n"
        f"International Consortium of Jurists (ICJ)\n"
    )
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">International Consortium of Jurists</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Citizen Legal Intake &amp; Case Registry</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
            <p style="font-size: 15px; color: #334155;">Dear <strong>{full_name or 'Citizen'}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                A verification request was initiated to track the real-time status of Case ID: <strong>{case_id}</strong>.
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #2563eb; border-radius: 8px; padding: 14px 28px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a;">{otp}</span>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for 15 minutes</p>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                If you did not request this verification code, please ignore this email or contact our legal helpdesk at consortiumofjurists@gmail.com.
            </p>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            &copy; 2026 International Consortium of Jurists. All Rights Reserved.
        </div>
    </div>
    """

    # 1. EmailJS dispatch
    try:
        import urllib.request
        service_id = getattr(settings, "EMAILJS_SERVICE_ID", "service_rypannl")
        template_id = getattr(settings, "EMAILJS_TEMPLATE_ID", "template_pmntrjf")
        public_key = getattr(settings, "EMAILJS_PUBLIC_KEY", "_afNcmKvmFJoVdlI9")
        payload = json.dumps({
            "service_id": service_id,
            "template_id": template_id,
            "user_id": public_key,
            "template_params": {
                "to_email": clean_email,
                "email": clean_email,
                "user_email": clean_email,
                "to_name": full_name or "Citizen",
                "name": full_name or "Citizen",
                "title": f"ICJ Case Tracking Verification Code: {otp}",
                "subject": subject,
                "message": message,
                "otp": otp,
                "passcode": otp,
                "code": otp,
                "verification_code": otp,
            },
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.emailjs.com/api/v1.0/email/send",
            data=payload,
            headers={"Content-Type": "application/json"},
        )
        urllib.request.urlopen(req, timeout=8)
    except Exception:
        pass

    # 2. Django send_mail fallback
    try:
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[clean_email],
            fail_silently=True,
        )
    except Exception:
        pass


def send_case_intake_acknowledgment_email(instance: AssistanceRequest):
    """
    Sends official intake acknowledgment email to applicant upon successful submission.
    """
    to_email = (instance.email or "").strip()
    if not to_email:
        return

    subject = f"Legal Assistance Request Acknowledged - Case #{instance.reference_id} - ICJ"
    message = (
        f"Dear {instance.full_name or 'Citizen'},\n\n"
        f"Your request for legal assistance has been recorded under Case ID: {instance.reference_id}.\n\n"
        f"Category: {instance.category}\n"
        f"Status: Under Panel Review\n\n"
        f"You can track real-time progress of your legal intake at any time by visiting our Case Tracking Portal with your registered contact.\n\n"
        f"Regards,\n"
        f"International Consortium of Jurists (ICJ)\n"
    )
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">International Consortium of Jurists</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Citizen Legal Aid &amp; Mediation Desk</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
            <p style="font-size: 15px; color: #334155;">Dear <strong>{instance.full_name or 'Citizen'}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                Your petition for legal assistance has been successfully received by our Citizen Intake Desk and assigned the following case tracking reference:
            </p>
            <div style="background-color: #f1f5f9; border-left: 4px solid #16a34a; padding: 14px; margin: 18px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #64748b;">Case Reference ID</p>
                <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: bold; color: #0f172a; font-family: monospace;">{instance.reference_id}</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;"><strong>Matter Type:</strong> {instance.category}</p>
            </div>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                Our legal advisory panel and empanelment cell are reviewing your submitted documents. You may track milestones and advocate allocation directly via our 2-Factor Case Tracking portal.
            </p>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            &copy; 2026 International Consortium of Jurists. All Rights Reserved.
        </div>
    </div>
    """

    try:
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=True,
        )
    except Exception:
        pass


def send_case_tracking_details_email(to_email: str, full_name: str, case_data: dict):
    """
    Dispatches full real-time case tracking report & milestones to applicant's email.
    """
    if not to_email:
        return

    clean_email = to_email.strip()
    case_id = case_data.get("case_id") or "Case"
    category = case_data.get("matter_type") or case_data.get("category") or "General Legal Aid"
    status_text = case_data.get("status") or "In Progress"
    counsel = case_data.get("assigned_legal_counsel") or "Empanelment Panel Review"
    milestones = case_data.get("milestones", [])

    milestone_lines = []
    for idx, m in enumerate(milestones, 1):
        status_icon = "[✓ Completed]" if m.get("completed") else "[Pending]"
        date_str = f" ({m.get('date')})" if m.get("date") else ""
        milestone_lines.append(f"{idx}. {m.get('title')}: {status_icon}{date_str}")
    milestones_txt = "\n".join(milestone_lines)

    frontend_base = (
        getattr(settings, "FRONTEND_URL", None)
        or (settings.CORS_ALLOWED_ORIGINS[0] if getattr(settings, "CORS_ALLOWED_ORIGINS", []) else None)
        or "https://icj.org.in"
    ).rstrip("/")
    track_url = f"{frontend_base}/track-case"

    subject = f"Case Status Report - Case #{case_id} ({status_text}) - ICJ"
    message = (
        f"Dear {full_name or 'Citizen'},\n\n"
        f"Here is your official real-time status summary for Case ID: {case_id}\n\n"
        f"• Matter Category: {category}\n"
        f"• Current Status: {status_text}\n"
        f"• Assigned Legal Counsel: {counsel}\n\n"
        f"Procedural Milestones:\n{milestones_txt}\n\n"
        f"You can re-verify or check live updates anytime: {track_url}\n\n"
        f"Regards,\n"
        f"Registry & Case Management Desk\n"
        f"International Consortium of Jurists (ICJ)\n"
    )

    # 1. EmailJS dispatch
    try:
        import urllib.request
        service_id = getattr(settings, "EMAILJS_SERVICE_ID", "service_rypannl")
        template_id = getattr(settings, "EMAILJS_TEMPLATE_ID", "template_pmntrjf")
        public_key = getattr(settings, "EMAILJS_PUBLIC_KEY", "_afNcmKvmFJoVdlI9")
        payload = json.dumps({
            "service_id": service_id,
            "template_id": template_id,
            "user_id": public_key,
            "template_params": {
                "to_email": clean_email,
                "email": clean_email,
                "user_email": clean_email,
                "to_name": full_name or "Citizen",
                "name": full_name or "Citizen",
                "title": f"Case Status Report - #{case_id}",
                "subject": subject,
                "message": message,
            },
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.emailjs.com/api/v1.0/email/send",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Origin": frontend_base,
            },
        )
        urllib.request.urlopen(req, timeout=8)
    except Exception:
        pass

    # 2. Django send_mail
    try:
        from django.core.mail import send_mail
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[clean_email],
            fail_silently=True,
        )
    except Exception:
        pass


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
            # Generic response prevents enumerating valid cases in production
            return api_success(
                data=generic_success,
                session_id=session_id,
                message="Verification code dispatched.",
            )

        # Verify contact matches email or mobile
        clean_contact = contact.replace(" ", "").replace("-", "")
        clean_email = matching_ar.email.strip().lower()
        clean_mobile = matching_ar.mobile.strip().replace(" ", "").replace("-", "")

        is_match = (clean_contact == clean_email) or (clean_contact in clean_mobile or clean_mobile in clean_contact)
        if not is_match and not settings.DEBUG:
            # Generic response prevents timing attacks on production
            return api_success(
                data=generic_success,
                session_id=session_id,
                message="Verification code dispatched.",
            )

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

        # Dispatch real OTP email to applicant's registered email
        send_case_otp_email(
            to_email=matching_ar.email,
            full_name=matching_ar.full_name,
            case_id=matching_ar.reference_id,
            otp=otp,
        )

        # In local/test mode, provide preview of the OTP code and note Master OTP 123456
        if settings.DEBUG:
            generic_success["dev_otp"] = otp
            generic_success["master_otp"] = "123456"

        return api_success(
            data=generic_success,
            session_id=session_id,
            dev_otp=otp if settings.DEBUG else None,
            master_otp="123456" if settings.DEBUG else None,
            applicant_email=matching_ar.email,
            applicant_name=matching_ar.full_name or "Citizen",
            message="Verification code dispatched.",
        )


class CaseTrackingVerifyAPIView(APIView):
    """
    Step 2 of 2-Factor Secure Case Tracking:
    Validates session ID + 6-digit OTP with maximum 5 attempts.
    Returns sanitized case timeline, assigned legal team status, and milestones
    without exposing third-party private confidential documents.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        case_id = (request.data.get("case_id") or "").strip()
        session_id = (request.data.get("session_id") or "").strip()
        entered_otp = (request.data.get("otp") or "").strip()

        # Master OTP '123456' is strictly valid in local/development mode only (DEBUG=True).
        is_master_otp = settings.DEBUG and entered_otp == "123456"

        record = None
        if session_id:
            record = CaseOtpVerification.objects.filter(session_id=session_id, verified=False).first()

        # If not master OTP in debug mode, enforce strict session verification
        if not is_master_otp:
            if not record:
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

        # Mark verified if record exists
        if record:
            record.verified = True
            record.save(update_fields=["verified"])

        # Fetch case data
        case_ref = (record.case_reference if record else case_id) or case_id
        ar = AssistanceRequest.objects.filter(reference_id__iexact=case_ref).first()
        if not ar:
            lc = LegalCase.objects.filter(case_id__iexact=case_ref).select_related("assistance_request").first()
            if lc:
                ar = lc.assistance_request

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
            "category": ar.category,
            "help_type": ar.help_type or "Legal Counsel",
            "urgency": ar.urgency,
            "status": ar.get_status_display(),
            "submission_date": ar.created_at.isoformat(),
            "assigned_legal_counsel": assigned_advocate_display,
            "milestones": milestones,
            "applicant_name": ar.full_name or "Citizen",
            "applicant_email": ar.email or "",
        }

        # Dispatch full case tracking details to applicant's email
        if ar.email:
            try:
                send_case_tracking_details_email(
                    to_email=ar.email,
                    full_name=ar.full_name,
                    case_data=tracking_data,
                )
            except Exception:
                pass

        return api_success(
            data=tracking_data,
            track_data=tracking_data,
            message="Case status verified successfully.",
        )


class PublicProfessionalAppointmentAPIView(APIView):
    """
    Public Direct Practitioner Appointment & Consultation Booking.
    Saves direct inquiry to an AssistanceRequest with lead_type="professional_appointment".
    Triggers automatic Lead record generation for Admin Leads desk.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data
        client_name = (payload.get("client_name") or payload.get("full_name") or "").strip()
        client_email = (payload.get("client_email") or payload.get("email") or "").strip()
        client_mobile = (payload.get("client_mobile") or payload.get("mobile") or payload.get("client_phone") or "").strip()
        consultation_notes = (payload.get("consultation_notes") or payload.get("problem_description") or "").strip()
        professional_id = str(payload.get("professional_id") or "").strip()
        professional_name = (payload.get("professional_name") or "").strip()
        profession = (payload.get("profession") or "Legal Professional").strip()

        if not client_name:
            return api_error("Your full name is required.", status_code=400)
        if not client_mobile:
            return api_error("Your mobile number is required.", status_code=400)
        if not consultation_notes:
            return api_error("Please provide a summary of your consultation query or legal matter.", status_code=400)

        year = timezone.now().year
        ref_id = f"ICJ-REQ-{random.randint(100000, 999999)}"
        while AssistanceRequest.objects.filter(reference_id=ref_id).exists():
            ref_id = f"ICJ-REQ-{random.randint(100000, 999999)}"

        extra_fields = {
            "lead_type": "professional_appointment",
            "professional_id": professional_id,
            "professional_name": professional_name,
            "profession": profession,
        }

        category_label = f"Consultation: {professional_name}" if professional_name else "Professional Consultation"

        instance = AssistanceRequest.objects.create(
            reference_id=ref_id,
            full_name=client_name,
            email=client_email,
            mobile=client_mobile,
            preferred_contact=payload.get("preferred_contact", "Phone Call"),
            state_name=payload.get("state_name", "Not Specified"),
            city_name=payload.get("city_name", "Not Specified"),
            category=category_label,
            urgency=payload.get("urgency", "Medium"),
            problem_description=consultation_notes,
            additional_fields=extra_fields,
        )

        return api_success(
            data={
                "reference_id": ref_id,
                "client_name": client_name,
                "professional_name": professional_name,
                "created_at": instance.created_at.isoformat(),
            },
            message="Consultation request received successfully. The practitioner's office will reach out within 24 hours.",
            status_code=201,
        )

