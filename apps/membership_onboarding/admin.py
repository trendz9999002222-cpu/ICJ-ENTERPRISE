from django.contrib import admin

from apps.membership_onboarding.models import (
    MembershipApplication,
    MembershipApplicationDocument,
    MembershipForm,
    MembershipType,
)


@admin.register(MembershipType)
class MembershipTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "display_order")


@admin.register(MembershipForm)
class MembershipFormAdmin(admin.ModelAdmin):
    list_display = ("title", "membership_type", "version", "is_active")


@admin.register(MembershipApplication)
class MembershipApplicationAdmin(admin.ModelAdmin):
    list_display = ("reference_id", "membership_type", "status", "created_at")
    search_fields = ("reference_id",)


@admin.register(MembershipApplicationDocument)
class MembershipApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ("document_key", "application", "verification_status")
