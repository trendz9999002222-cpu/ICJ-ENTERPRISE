from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.listing import apply_is_active, apply_ordering, apply_search
from common.responses import api_error, api_success

from apps.accounts.permissions import IsAdminRole, PasswordChangeCompleted
from apps.professional_onboarding.services.crud import create_model, update_model, ServiceError
from apps.services.models import JusticeService, ServiceCategory
from apps.services.serializers import JusticeServiceSerializer, ServiceCategorySerializer


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
