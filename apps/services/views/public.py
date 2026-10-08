from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.listing import apply_ordering, apply_search
from common.responses import api_success

from apps.services.models import JusticeService, ServiceCategory
from apps.services.serializers import JusticeServiceSerializer, ServiceCategorySerializer


def _filter_public_services(qs, params: dict):
    qs = apply_search(qs, params.get("search"), "title", "short_description")
    qs = apply_ordering(qs, params.get("ordering"), "display_order")
    category = params.get("category")
    if category and category != "all":
        qs = qs.filter(category__value=category)
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


import random
from django.utils import timezone
from apps.services.models import AssistanceRequest
from apps.services.serializers import AssistanceRequestSerializer

class PublicAssistanceRequestAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AssistanceRequestSerializer(data=request.data)
        if serializer.is_valid():
            # generate reference_id like ICJ-REQ-YYYY-XXXXX
            year = timezone.now().year
            ref_id = f"ICJ-REQ-{year}-{random.randint(10000, 99999)}"
            # ensure uniqueness
            while AssistanceRequest.objects.filter(reference_id=ref_id).exists():
                ref_id = f"ICJ-REQ-{year}-{random.randint(10000, 99999)}"
                
            serializer.save(reference_id=ref_id)
            return api_success(data=serializer.data, message="Assistance request submitted successfully.", status_code=201)
        return api_success(data=serializer.errors, message="Validation failed.", status_code=400, success=False)

