from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.accounts.models import (
    PasswordResetToken,
    User,
    ProfessionalApplication,
    ApplicationDocument,
    ApplicationReviewHistory,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "role", "is_active", "is_staff", "password_change_required")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "username")
    ordering = ("email",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("ICJ", {"fields": ("role", "phone_number", "date_of_birth", "address", "password_change_required", "email_verified")}),
    )


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "expires_at", "used_at", "created_at")
    list_filter = ("used_at",)
    readonly_fields = ("token_hash", "created_at")


class ApplicationDocumentInline(admin.TabularInline):
    model = ApplicationDocument
    extra = 0
    readonly_fields = ("document_key", "document_title", "file", "file_name", "uploaded_at")


class ApplicationReviewHistoryInline(admin.TabularInline):
    model = ApplicationReviewHistory
    extra = 0
    readonly_fields = ("action", "actor", "note", "created_at")


@admin.register(ProfessionalApplication)
class ProfessionalApplicationAdmin(admin.ModelAdmin):
    list_display = ("application_reference", "user", "pathway", "category", "status", "created_at")
    list_filter = ("pathway", "category", "status")
    search_fields = ("application_reference", "user__email", "user__first_name", "user__last_name")
    readonly_fields = ("application_reference", "created_at", "updated_at")
    inlines = [ApplicationDocumentInline, ApplicationReviewHistoryInline]
