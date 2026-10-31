from django.contrib import admin
from apps.services.models import (
    JusticeService,
    ServiceCategory,
    AssistanceRequest,
    CaseDocument,
    LegalCase,
    CaseAssignmentHistory,
    CaseInstallmentSchedule,
    CaseOtpVerification,
)


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "value", "is_active", "display_order")
    search_fields = ("name", "slug", "value")
    list_filter = ("is_active",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(JusticeService)
class JusticeServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "category", "is_featured", "is_active", "display_order")
    search_fields = ("title", "slug")
    list_filter = ("is_active", "is_featured", "category")
    prepopulated_fields = {"slug": ("title",)}


class CaseDocumentInline(admin.TabularInline):
    model = CaseDocument
    extra = 0
    readonly_fields = ("document_title", "file", "file_name", "file_size_bytes", "uploaded_at")


@admin.register(AssistanceRequest)
class AssistanceRequestAdmin(admin.ModelAdmin):
    list_display = ("reference_id", "full_name", "category", "urgency", "status", "created_at")
    list_filter = ("status", "urgency", "category")
    search_fields = ("reference_id", "full_name", "email", "mobile")
    inlines = [CaseDocumentInline]


class CaseAssignmentHistoryInline(admin.TabularInline):
    model = CaseAssignmentHistory
    extra = 0
    readonly_fields = ("previous_professional", "new_professional", "reassigned_by", "reason", "created_at")


class CaseInstallmentScheduleInline(admin.TabularInline):
    model = CaseInstallmentSchedule
    extra = 0


@admin.register(LegalCase)
class LegalCaseAdmin(admin.ModelAdmin):
    list_display = ("case_id", "assistance_request", "professional", "status", "budget", "client_fee_agreed", "created_at")
    list_filter = ("status",)
    search_fields = ("case_id", "assistance_request__reference_id", "professional__email")
    inlines = [CaseAssignmentHistoryInline, CaseInstallmentScheduleInline]


@admin.register(CaseOtpVerification)
class CaseOtpVerificationAdmin(admin.ModelAdmin):
    list_display = ("case_reference", "contact", "expires_at", "attempts", "verified", "created_at")
    list_filter = ("verified",)
    search_fields = ("case_reference", "contact")
