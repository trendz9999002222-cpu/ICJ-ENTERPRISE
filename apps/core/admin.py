from django.contrib import admin
from apps.core.models import AdditionalOnboardingFormfields, CommonField, FormFieldConfig

@admin.register(CommonField)
class CommonFieldAdmin(admin.ModelAdmin):
    list_display = ("field_key", "name", "field_type", "is_active", "is_system_field")
    list_filter = ("field_type", "is_active", "is_system_field")
    search_fields = ("field_key", "name", "label")

@admin.register(AdditionalOnboardingFormfields)
class AdditionalOnboardingFormfieldsAdmin(admin.ModelAdmin):
    list_display = ("form_code", "form_name", "is_active", "version")
    list_filter = ("is_active",)
    search_fields = ("form_code", "form_name")

@admin.register(FormFieldConfig)
class FormFieldConfigAdmin(admin.ModelAdmin):
    list_display = ("form", "common_field", "section_name", "display_order", "is_visible", "is_required")
    list_filter = ("form", "is_visible", "is_required")
    search_fields = ("common_field__field_key", "common_field__name", "section_name")
    ordering = ("form", "section_name", "display_order")
