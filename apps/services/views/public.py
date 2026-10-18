from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.listing import apply_ordering, apply_search
from common.responses import api_success, api_error

from apps.services.models import JusticeService, ServiceCategory
from apps.services.serializers import JusticeServiceSerializer, ServiceCategorySerializer


def _filter_public_services(qs, params: dict):
    qs = apply_search(qs, params.get("search"), "title", "short_description")
    qs = apply_ordering(qs, params.get("ordering"), "display_order")
    category = params.get("category")
    if category and category != "all":
        qs = qs.filter(category__value=category)
    featured = params.get("featured")
    if featured in ("true", "1", "True", True):
        qs = qs.filter(is_featured=True)
    elif featured in ("false", "0", "False", False):
        qs = qs.filter(is_featured=False)
    return qs


class PublicCategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = ServiceCategory.objects.filter(is_active=True).order_by("display_order", "name")
        return api_success(
            data=ServiceCategorySerializer(qs, many=True).data,
            message="Categories retrieved."
        )


class PublicJusticeServiceListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        params = list_params(request)
        params["category"] = request.query_params.get("category")
        params["featured"] = request.query_params.get("featured")
        qs = _filter_public_services(
            JusticeService.objects.select_related("category").filter(is_active=True), 
            params
        )
        return paginated_success(request, qs, JusticeServiceSerializer, message="Services retrieved.")


class PublicJusticeServiceDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        obj = get_object_or_404(
            JusticeService.objects.select_related("category").filter(is_active=True), 
            slug=slug
        )
        return api_success(
            data=JusticeServiceSerializer(obj).data, 
            message="Service retrieved."
        )


class PublicFeaturedServicesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = JusticeService.objects.select_related("category").filter(is_active=True, is_featured=True).order_by("display_order", "title")
        return api_success(
            data=JusticeServiceSerializer(qs, many=True).data,
            message="Featured services retrieved."
        )


from decimal import Decimal
import random
from django.utils import timezone
from apps.services.models import AssistanceRequest, AssistanceFormField, AssistanceDocument
from apps.services.serializers import (
    AssistanceRequestSerializer,
    AssistanceFormFieldSerializer,
    AssistanceDocumentSerializer,
)
from apps.core.models import AdditionalOnboardingFormfields, FormFieldConfig


class PublicAssistanceFormConfigAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        citizen_configs = FormFieldConfig.objects.filter(
            form__form_code=AdditionalOnboardingFormfields.FormCode.SEEKER_ASSISTANT,
            is_visible=True,
            common_field__is_active=True,
        ).select_related("common_field").order_by("display_order")

        citizen_fields = []
        for c in citizen_configs:
            cf = c.common_field
            if not cf:
                continue
            citizen_fields.append({
                "field_key": cf.field_key,
                "label": c.label_override or cf.label or cf.name,
                "field_type": cf.field_type,
                "placeholder": c.placeholder_override or cf.placeholder,
                "help_text": c.help_text_override or cf.help_text,
                "is_required": c.is_required,
                "display_order": c.display_order,
                "options": cf.options or [],
            })

        legal_fields_qs = AssistanceFormField.objects.filter(is_active=True).order_by("display_order", "created_at")
        legal_matter_fields = AssistanceFormFieldSerializer(legal_fields_qs, many=True).data

        doc_qs = AssistanceDocument.objects.filter(is_active=True).order_by("display_order", "name")
        documents = AssistanceDocumentSerializer(doc_qs, many=True).data

        return api_success(
            data={
                "citizen_fields": citizen_fields,
                "legal_matter_fields": legal_matter_fields,
                "documents": documents,
            },
            message="Assistance form configuration retrieved."
        )


class PublicAssistanceRequestAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)

        # Normalize field aliases between common fields and model columns
        if "mobile_number" in payload and "mobile" not in payload:
            payload["mobile"] = payload["mobile_number"]
        if "state" in payload and "state_name" not in payload:
            payload["state_name"] = payload["state"]
        if "district" in payload and "city_name" not in payload:
            payload["city_name"] = payload["district"]

        standard_keys = {
            "full_name", "email", "mobile", "preferred_contact",
            "state_name", "city_name", "category", "urgency",
            "problem_description", "status", "reference_id"
        }
        extra = {k: v for k, v in payload.items() if k not in standard_keys}
        existing_extra = payload.get("additional_fields", {})
        if isinstance(existing_extra, dict):
            extra.update(existing_extra)
        payload["additional_fields"] = extra

        serializer = AssistanceRequestSerializer(data=payload)
        if serializer.is_valid():
            year = timezone.now().year
            ref_id = f"ICJ-REQ-{year}-{random.randint(10000, 99999)}"
            while AssistanceRequest.objects.filter(reference_id=ref_id).exists():
                ref_id = f"ICJ-REQ-{year}-{random.randint(10000, 99999)}"
                
            instance = serializer.save(reference_id=ref_id)

            # Ensure MarketplaceLead is created for Unified Leads Management
            from apps.services.models import LeadCommercialSettings, MarketplaceLead
            if not hasattr(instance, "marketplace_lead") or instance.marketplace_lead is None:
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

            return api_success(data=serializer.data, message="Assistance request submitted successfully.", status_code=201)
        return api_error(message="Validation failed.", errors=serializer.errors, status_code=400)


