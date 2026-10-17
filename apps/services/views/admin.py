import re
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.listing import apply_is_active, apply_ordering, apply_search
from common.responses import api_error, api_success

from apps.accounts.permissions import IsAdminRole, PasswordChangeCompleted
from apps.professional_onboarding.services.crud import create_model, update_model, ServiceError
from apps.services.models import JusticeService, ServiceCategory, AssistanceFormField, AssistanceDocument
from apps.services.serializers import (
    JusticeServiceSerializer,
    ServiceCategorySerializer,
    AssistanceFormFieldSerializer,
    AssistanceDocumentSerializer,
)


class AdminServicesBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted, IsAdminRole]


def _filter_categories(qs, params: dict):
    qs = apply_search(qs, params.get("search"), "name", "slug")
    qs = apply_is_active(qs, params.get("is_active"))
    qs = apply_ordering(qs, params.get("ordering"), "display_order")
    return qs


class ServiceCategoryListCreateAPIView(AdminServicesBaseView):
    def get(self, request):
        params = list_params(request)
        qs = _filter_categories(ServiceCategory.objects.all(), params)
        return paginated_success(request, qs, ServiceCategorySerializer, message="Categories retrieved.")

    def post(self, request):
        serializer = ServiceCategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(ServiceCategory, serializer.validated_data)
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)
        return api_success(
            data=ServiceCategorySerializer(obj).data,
            message="Category created.",
            status_code=status.HTTP_201_CREATED,
        )


class ServiceCategoryDetailAPIView(AdminServicesBaseView):
    def get(self, request, pk):
        obj = get_object_or_404(ServiceCategory, pk=pk)
        return api_success(data=ServiceCategorySerializer(obj).data, message="Category retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(ServiceCategory, pk=pk)
        serializer = ServiceCategorySerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)
        return api_success(data=ServiceCategorySerializer(obj).data, message="Category updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(ServiceCategory, pk=pk)
        if obj.services.exists():
            return api_error("Cannot delete category with associated services.", status_code=status.HTTP_400_BAD_REQUEST)
        obj.delete()
        return api_success(message="Category deleted.")


def _filter_services(qs, params: dict):
    qs = apply_search(qs, params.get("search"), "title", "short_description")
    qs = apply_is_active(qs, params.get("is_active"))
    qs = apply_ordering(qs, params.get("ordering"), "display_order")
    category = params.get("category")
    if category and category != "all":
        qs = qs.filter(category__value=category)
    return qs


class JusticeServiceListCreateAPIView(AdminServicesBaseView):
    def get(self, request):
        params = list_params(request)
        params["category"] = request.query_params.get("category")
        qs = _filter_services(JusticeService.objects.select_related("category").all(), params)
        return paginated_success(request, qs, JusticeServiceSerializer, message="Services retrieved.")

    def post(self, request):
        serializer = JusticeServiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            obj = create_model(JusticeService, serializer.validated_data)
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)
        return api_success(
            data=JusticeServiceSerializer(obj).data,
            message="Service created.",
            status_code=status.HTTP_201_CREATED,
        )


class JusticeServiceDetailAPIView(AdminServicesBaseView):
    def get(self, request, pk):
        obj = get_object_or_404(JusticeService.objects.select_related("category"), pk=pk)
        return api_success(data=JusticeServiceSerializer(obj).data, message="Service retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(JusticeService, pk=pk)
        serializer = JusticeServiceSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            obj = update_model(obj, serializer.validated_data)
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)
        return api_success(data=JusticeServiceSerializer(obj).data, message="Service updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(JusticeService, pk=pk)
        obj.delete()
        return api_success(message="Service deleted.")

from django.utils import timezone
from apps.services.models import AssistanceRequest, LegalCase
from apps.services.serializers import AssistanceRequestSerializer, LegalCaseSerializer

class AdminAssistanceRequestListAPIView(AdminServicesBaseView):
    def get(self, request):
        params = list_params(request)
        qs = AssistanceRequest.objects.all()
        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)
        qs = apply_search(qs, params.get("search"), "full_name", "reference_id")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, AssistanceRequestSerializer, message="Assistance requests retrieved.")

class AdminAssistanceRequestDetailAPIView(AdminServicesBaseView):
    def get(self, request, pk):
        obj = get_object_or_404(AssistanceRequest, pk=pk)
        return api_success(data=AssistanceRequestSerializer(obj).data, message="Request retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(AssistanceRequest, pk=pk)
        serializer = AssistanceRequestSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(data=AssistanceRequestSerializer(obj).data, message="Request updated.")

class AdminAssistanceRequestAssignAPIView(AdminServicesBaseView):
    def post(self, request, pk):
        obj = get_object_or_404(AssistanceRequest, pk=pk)
        if obj.status == AssistanceRequest.Status.CASE_CREATED:
            return api_error("Case already created.", status_code=status.HTTP_400_BAD_REQUEST)
        
        budget = request.data.get("budget", 0.00)
        professional_group_id = request.data.get("professional_group_id")
        
        year = timezone.now().year
        import random
        case_id = f"ICJ-CASE-{year}-{random.randint(10000, 99999)}"
        while LegalCase.objects.filter(case_id=case_id).exists():
            case_id = f"ICJ-CASE-{year}-{random.randint(10000, 99999)}"
            
        case_obj = LegalCase.objects.create(
            case_id=case_id,
            assistance_request=obj,
            budget=budget,
            professional_group_id=professional_group_id,
            status=LegalCase.Status.OPEN
        )
        
        obj.status = AssistanceRequest.Status.CASE_CREATED
        obj.save()
        
        return api_success(data=LegalCaseSerializer(case_obj).data, message="Case created successfully.", status_code=201)

class AdminCaseListAPIView(AdminServicesBaseView):
    def get(self, request):
        params = list_params(request)
        qs = LegalCase.objects.select_related("assistance_request", "professional", "professional_group").all()
        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)
        qs = apply_search(qs, params.get("search"), "case_id", "assistance_request__full_name")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, LegalCaseSerializer, message="Cases retrieved.")

class AdminCaseDetailAPIView(AdminServicesBaseView):
    def get(self, request, pk):
        obj = get_object_or_404(LegalCase.objects.select_related("assistance_request", "professional"), pk=pk)
        return api_success(data=LegalCaseSerializer(obj).data, message="Case retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(LegalCase, pk=pk)
        serializer = LegalCaseSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(data=LegalCaseSerializer(obj).data, message="Case updated.")


class AdminAssistanceFormFieldListCreateAPIView(AdminServicesBaseView):
    def get(self, request):
        qs = AssistanceFormField.objects.all().order_by("display_order", "created_at")
        serializer = AssistanceFormFieldSerializer(qs, many=True)
        return api_success(data={"results": serializer.data}, message="Assistance form fields retrieved.")

    def post(self, request):
        label = request.data.get("label", "").strip()
        if not label:
            return api_error("Field label is required.", status_code=status.HTTP_400_BAD_REQUEST)
        
        field_type = request.data.get("field_type", "text")
        required = str(request.data.get("required", request.data.get("is_required", False))).lower() == "true"
        display_order = int(request.data.get("display_order", 0))
        is_active = str(request.data.get("is_active", True)).lower() == "true"
        options = request.data.get("options")
        
        field_key = request.data.get("field_key", "").strip()
        if not field_key:
            base_key = re.sub(r'[^a-z0-9]', '_', label.lower())
            base_key = re.sub(r'_+', '_', base_key).strip('_')
            field_key = base_key
            counter = 1
            while AssistanceFormField.objects.filter(field_key=field_key).exists():
                field_key = f"{base_key}_{counter}"
                counter += 1

        field = AssistanceFormField.objects.create(
            field_key=field_key,
            label=label,
            field_type=field_type,
            required=required,
            display_order=display_order,
            is_active=is_active,
            options=options,
        )
        return api_success(data=AssistanceFormFieldSerializer(field).data, message="Field created.", status_code=status.HTTP_201_CREATED)

    def put(self, request):
        field_id = request.data.get("id")
        if not field_id:
            return api_error("Field ID is required.", status_code=status.HTTP_400_BAD_REQUEST)
        field = get_object_or_404(AssistanceFormField, pk=field_id)
        
        if "label" in request.data:
            field.label = request.data.get("label", field.label).strip()
        if "field_type" in request.data:
            field.field_type = request.data.get("field_type", field.field_type)
        if "required" in request.data or "is_required" in request.data:
            val = request.data.get("required", request.data.get("is_required"))
            field.required = str(val).lower() == "true"
        if "display_order" in request.data:
            field.display_order = int(request.data.get("display_order", field.display_order))
        if "is_active" in request.data:
            field.is_active = str(request.data.get("is_active")).lower() == "true"
        if "options" in request.data:
            field.options = request.data.get("options")
        field.save()
        return api_success(data=AssistanceFormFieldSerializer(field).data, message="Field updated.")


class AdminAssistanceFormFieldDetailAPIView(AdminServicesBaseView):
    def get(self, request, pk):
        field = get_object_or_404(AssistanceFormField, pk=pk)
        return api_success(data=AssistanceFormFieldSerializer(field).data)

    def put(self, request, pk):
        field = get_object_or_404(AssistanceFormField, pk=pk)
        if "label" in request.data:
            field.label = request.data.get("label", field.label).strip()
        if "field_type" in request.data:
            field.field_type = request.data.get("field_type", field.field_type)
        if "required" in request.data or "is_required" in request.data:
            val = request.data.get("required", request.data.get("is_required"))
            field.required = str(val).lower() == "true"
        if "display_order" in request.data:
            field.display_order = int(request.data.get("display_order", field.display_order))
        if "is_active" in request.data:
            field.is_active = str(request.data.get("is_active")).lower() == "true"
        if "options" in request.data:
            field.options = request.data.get("options")
        field.save()
        return api_success(data=AssistanceFormFieldSerializer(field).data, message="Field updated.")

    def delete(self, request, pk):
        field = get_object_or_404(AssistanceFormField, pk=pk)
        field.delete()
        return api_success(message="Field deleted.")


class AdminAssistanceDocumentListCreateAPIView(AdminServicesBaseView):
    def get(self, request):
        qs = AssistanceDocument.objects.all().order_by("display_order", "created_at")
        serializer = AssistanceDocumentSerializer(qs, many=True)
        return api_success(data={"results": serializer.data}, message="Assistance documents retrieved.")

    def post(self, request):
        name = request.data.get("name", "").strip()
        if not name:
            return api_error("Document name is required.", status_code=status.HTTP_400_BAD_REQUEST)

        document_key = request.data.get("document_key", "").strip()
        if not document_key:
            base_key = re.sub(r'[^a-z0-9]', '_', name.lower())
            base_key = re.sub(r'_+', '_', base_key).strip('_')
            document_key = base_key
            counter = 1
            while AssistanceDocument.objects.filter(document_key=document_key).exists():
                document_key = f"{base_key}_{counter}"
                counter += 1

        allowed_file_types = request.data.get("allowed_file_types", ["pdf", "docx", "jpg", "png"])
        if isinstance(allowed_file_types, str):
            allowed_file_types = [t.strip().lstrip(".") for t in allowed_file_types.split(",") if t.strip()]

        doc = AssistanceDocument.objects.create(
            name=name,
            document_key=document_key,
            description=request.data.get("description", ""),
            allowed_file_types=allowed_file_types,
            max_file_size_mb=int(request.data.get("max_file_size_mb", 5)),
            is_required=str(request.data.get("is_required", False)).lower() == "true",
            is_active=str(request.data.get("is_active", True)).lower() == "true",
            display_order=int(request.data.get("display_order", 0)),
        )
        return api_success(data=AssistanceDocumentSerializer(doc).data, message="Document created.", status_code=status.HTTP_201_CREATED)

    def put(self, request):
        doc_id = request.data.get("id")
        if not doc_id:
            return api_error("Document ID is required.", status_code=status.HTTP_400_BAD_REQUEST)
        doc = get_object_or_404(AssistanceDocument, pk=doc_id)
        if "name" in request.data:
            doc.name = request.data.get("name", doc.name).strip()
        if "description" in request.data:
            doc.description = request.data.get("description", doc.description)
        if "allowed_file_types" in request.data:
            aft = request.data.get("allowed_file_types")
            if isinstance(aft, str):
                aft = [t.strip().lstrip(".") for t in aft.split(",") if t.strip()]
            doc.allowed_file_types = aft
        if "max_file_size_mb" in request.data:
            doc.max_file_size_mb = int(request.data.get("max_file_size_mb", doc.max_file_size_mb))
        if "is_required" in request.data:
            doc.is_required = str(request.data.get("is_required")).lower() == "true"
        if "is_active" in request.data:
            doc.is_active = str(request.data.get("is_active")).lower() == "true"
        if "display_order" in request.data:
            doc.display_order = int(request.data.get("display_order", doc.display_order))
        doc.save()
        return api_success(data=AssistanceDocumentSerializer(doc).data, message="Document updated.")


class AdminAssistanceDocumentDetailAPIView(AdminServicesBaseView):
    def get(self, request, pk):
        doc = get_object_or_404(AssistanceDocument, pk=pk)
        return api_success(data=AssistanceDocumentSerializer(doc).data)

    def put(self, request, pk):
        doc = get_object_or_404(AssistanceDocument, pk=pk)
        if "name" in request.data:
            doc.name = request.data.get("name", doc.name).strip()
        if "description" in request.data:
            doc.description = request.data.get("description", doc.description)
        if "allowed_file_types" in request.data:
            aft = request.data.get("allowed_file_types")
            if isinstance(aft, str):
                aft = [t.strip().lstrip(".") for t in aft.split(",") if t.strip()]
            doc.allowed_file_types = aft
        if "max_file_size_mb" in request.data:
            doc.max_file_size_mb = int(request.data.get("max_file_size_mb", doc.max_file_size_mb))
        if "is_required" in request.data:
            doc.is_required = str(request.data.get("is_required")).lower() == "true"
        if "is_active" in request.data:
            doc.is_active = str(request.data.get("is_active")).lower() == "true"
        if "display_order" in request.data:
            doc.display_order = int(request.data.get("display_order", doc.display_order))
        doc.save()
        return api_success(data=AssistanceDocumentSerializer(doc).data, message="Document updated.")

    def delete(self, request, pk):
        doc = get_object_or_404(AssistanceDocument, pk=pk)
        doc.delete()
        return api_success(message="Document deleted.")


