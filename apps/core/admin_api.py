from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from common.api_listing import list_params, paginated_success
from common.responses import api_error, api_success

from apps.core.models.common_field import CommonField
from apps.core.models.form_field_config import FormFieldConfig
from apps.core.models.additional_onboarding_formfields import AdditionalOnboardingFormfields
from apps.core.serializers.common_field import CommonFieldSerializer
from apps.core.serializers.form_field_config import FormFieldConfigSerializer


class CommonFieldListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = list_params(request)
        qs = CommonField.objects.all()
        
        search = params.get("search")
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(label__icontains=search)
            
        ordering = params.get("ordering", "name")
        if ordering:
            qs = qs.order_by(ordering)
            
        return paginated_success(request, qs, CommonFieldSerializer, message="Master Common fields retrieved.")

    def post(self, request):
        serializer = CommonFieldSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(data=serializer.data, message="Common field created.", status_code=status.HTTP_201_CREATED)


class CommonFieldDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(CommonField, pk=pk)
        return api_success(data=CommonFieldSerializer(obj).data, message="Common field retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(CommonField, pk=pk)
        serializer = CommonFieldSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(data=serializer.data, message="Common field updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(CommonField, pk=pk)
        if obj.is_system_field:
            return api_error("System fields cannot be deleted.", status_code=status.HTTP_400_BAD_REQUEST)
        obj.delete()
        return api_success(message="Common field deleted.")


class FormFieldConfigListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = list_params(request)
        qs = FormFieldConfig.objects.select_related("common_field").all()
        
        form_code = request.query_params.get("form_code")
        if form_code:
            qs = qs.filter(form__form_code=form_code)
            
        ordering = params.get("ordering", "display_order")
        if ordering:
            qs = qs.order_by(ordering)
            
        return paginated_success(request, qs, FormFieldConfigSerializer, message="Form field configs retrieved.")

    def post(self, request):
        serializer = FormFieldConfigSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(data=serializer.data, message="Form field config created.", status_code=status.HTTP_201_CREATED)


class FormFieldConfigDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(FormFieldConfig, pk=pk)
        return api_success(data=FormFieldConfigSerializer(obj).data, message="Form field config retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(FormFieldConfig, pk=pk)
        serializer = FormFieldConfigSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(data=serializer.data, message="Form field config updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(FormFieldConfig, pk=pk)
        obj.delete()
        return api_success(message="Form field config deleted.")
