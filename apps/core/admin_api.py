from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from common.api_listing import list_params, paginated_success
from common.responses import api_error, api_success

from apps.core.models import CommonField, FormFieldConfig, AdditionalOnboardingFormfields
from apps.core.serializers import CommonFieldSerializer, FormFieldConfigSerializer


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
            form_code_clean = form_code.strip()
            valid_codes = dict(AdditionalOnboardingFormfields.FormCode.choices)
            if form_code_clean in valid_codes:
                AdditionalOnboardingFormfields.objects.get_or_create(
                    form_code=form_code_clean,
                    defaults={
                        "form_name": valid_codes[form_code_clean],
                        "description": f"Onboarding flow for {valid_codes[form_code_clean]}."
                    }
                )
            qs = qs.filter(form__form_code=form_code_clean)
            
        ordering = params.get("ordering", "display_order")
        if ordering:
            qs = qs.order_by(ordering)
            
        return paginated_success(request, qs, FormFieldConfigSerializer, message="Form field configs retrieved.")

    def post(self, request):
        form_code = request.data.get("form")
        common_field_id = request.data.get("common_field")
        
        if form_code and common_field_id:
            try:
                existing = FormFieldConfig.objects.filter(
                    form__form_code=str(form_code).strip(),
                    common_field_id=common_field_id
                ).first()
                if existing:
                    serializer = FormFieldConfigSerializer(existing, data=request.data, partial=True)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    return api_success(data=serializer.data, message="Form field config updated.", status_code=status.HTTP_200_OK)
            except Exception:
                pass

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
