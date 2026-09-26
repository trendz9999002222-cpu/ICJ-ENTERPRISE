from django.contrib import admin

from apps.membership_onboarding.models import (
    MembershipApplication,
    MembershipApplicationDocument,
    MembershipDocument,
    MembershipFieldOption,
    MembershipForm,
    MembershipStep,
    MembershipStepField,
    MembershipType,
)


@admin.register(MembershipType)
class MembershipTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "display_order")


@admin.register(MembershipForm)
class MembershipFormAdmin(admin.ModelAdmin):
    list_display = ("title", "membership_type", "version", "is_active")


@admin.register(MembershipStep)
class MembershipStepAdmin(admin.ModelAdmin):
    list_display = ("title", "form", "slug", "is_active", "display_order")


@admin.register(MembershipStepField)
class MembershipStepFieldAdmin(admin.ModelAdmin):
    list_display = ("field_key", "step", "field_type", "is_required", "is_active")


@admin.register(MembershipFieldOption)
class MembershipFieldOptionAdmin(admin.ModelAdmin):
    list_display = ("label", "value", "step_field", "is_active")


@admin.register(MembershipDocument)
class MembershipDocumentAdmin(admin.ModelAdmin):
    list_display = ("name", "form", "document_key", "is_required", "is_active")


@admin.register(MembershipApplication)
class MembershipApplicationAdmin(admin.ModelAdmin):
    list_display = ("reference_id", "membership_type", "status", "created_at")
    search_fields = ("reference_id",)


@admin.register(MembershipApplicationDocument)
class MembershipApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ("document_key", "application", "verification_status")
