from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from common.api_listing import list_params, paginated_success
from common.responses import api_error, api_success

from apps.core.models import CommonField, FormFieldConfig, AdditionalOnboardingFormfields
from apps.core.serializers import CommonFieldSerializer, FormFieldConfigSerializer


def invalidate_form_caches():
    """
    Clears public form caches so any updates made by Admin are immediately visible.
    """
    try:
        from django.core.cache import cache
        cache.delete("public_seek_assistance_config")
        cache.delete("public_membership_onboarding_config")
        cache.delete("public_membership_configuration")
        cache.delete("cat_name_map")
        cache.delete("prof_name_map")
    except Exception:
        pass


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
        invalidate_form_caches()
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
        invalidate_form_caches()
        return api_success(data=serializer.data, message="Common field updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(CommonField, pk=pk)
        if obj.is_system_field:
            return api_error("System fields cannot be deleted.", status_code=status.HTTP_400_BAD_REQUEST)
        obj.delete()
        invalidate_form_caches()
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
            form_code_clean = str(form_code).strip()
            valid_codes = dict(AdditionalOnboardingFormfields.FormCode.choices)
            form_obj, _ = AdditionalOnboardingFormfields.objects.get_or_create(
                form_code=form_code_clean,
                defaults={
                    "form_name": valid_codes.get(form_code_clean, form_code_clean),
                    "description": f"Onboarding flow for {valid_codes.get(form_code_clean, form_code_clean)}."
                }
            )
            common_field_obj = get_object_or_404(CommonField, pk=common_field_id)

            existing = FormFieldConfig.objects.filter(
                form=form_obj,
                common_field=common_field_obj
            ).first()

            updatable_fields = (
                "section_name",
                "display_order",
                "is_visible",
                "is_required",
                "label_override",
                "placeholder_override",
                "help_text_override",
                "validation_overrides",
            )

            if existing:
                for key in updatable_fields:
                    if key in request.data:
                        setattr(existing, key, request.data[key])
                existing.save()
                invalidate_form_caches()
                return api_success(
                    data=FormFieldConfigSerializer(existing).data,
                    message="Form field config updated.",
                    status_code=status.HTTP_200_OK
                )
            else:
                new_cfg = FormFieldConfig.objects.create(
                    form=form_obj,
                    common_field=common_field_obj,
                    section_name=request.data.get("section_name", "General"),
                    display_order=request.data.get("display_order", 0),
                    is_visible=request.data.get("is_visible", True),
                    is_required=request.data.get("is_required", False),
                    label_override=request.data.get("label_override", ""),
                    placeholder_override=request.data.get("placeholder_override", ""),
                    help_text_override=request.data.get("help_text_override", ""),
                    validation_overrides=request.data.get("validation_overrides", {}),
                )
                invalidate_form_caches()
                return api_success(
                    data=FormFieldConfigSerializer(new_cfg).data,
                    message="Form field config created.",
                    status_code=status.HTTP_201_CREATED
                )

        serializer = FormFieldConfigSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        invalidate_form_caches()
        return api_success(data=serializer.data, message="Form field config created.", status_code=status.HTTP_201_CREATED)


class FormFieldConfigDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(FormFieldConfig, pk=pk)
        return api_success(data=FormFieldConfigSerializer(obj).data, message="Form field config retrieved.")

    def patch(self, request, pk):
        obj = get_object_or_404(FormFieldConfig, pk=pk)
        updatable_fields = (
            "section_name",
            "display_order",
            "is_visible",
            "is_required",
            "label_override",
            "placeholder_override",
            "help_text_override",
            "validation_overrides",
        )
        for key in updatable_fields:
            if key in request.data:
                setattr(obj, key, request.data[key])
        obj.save()
        invalidate_form_caches()
        return api_success(data=FormFieldConfigSerializer(obj).data, message="Form field config updated.")

    def delete(self, request, pk):
        obj = get_object_or_404(FormFieldConfig, pk=pk)
        obj.delete()
        invalidate_form_caches()
        return api_success(message="Form field config deleted.")

