from django.contrib import admin

from apps.professional_onboarding.models import (
    Category,
    CommonField,
    Document,
    FieldOption,
    Group,
    Profession,
    ProfessionDocument,
    ProfessionField,
    ProfessionalRegistrationSubmission,
    ProfessionalRegistrationSubmissionFile,
    VisualTheme,
)


class VisualThemeInline(admin.StackedInline):
    model = VisualTheme
    extra = 0
    fields = (
        "primary_color",
        "secondary_color",
        "accent_color",
        "background_color",
        "text_color",
        "border_color",
        "icon_color",
        "use_parent_theme",
    )


class FieldOptionInline(admin.TabularInline):
    model = FieldOption
    extra = 1
    fields = ("value", "label", "display_order", "is_active")


class GroupInline(admin.TabularInline):
    model = Group
    extra = 0
    fields = ("name", "slug", "display_order", "is_active")
    show_change_link = True


class ProfessionInline(admin.TabularInline):
    model = Profession
    extra = 0
    fields = ("name", "slug", "display_order", "is_active")
    show_change_link = True


class ProfessionFieldInline(admin.TabularInline):
    model = ProfessionField
    extra = 0
    fields = ("name", "field_key", "field_type", "label", "is_required", "display_order", "is_active")
    show_change_link = True


class ProfessionDocumentInline(admin.TabularInline):
    model = ProfessionDocument
    extra = 0
    fields = ("document", "is_required", "display_order", "is_active")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "display_order", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    ordering = ("display_order", "name")
    inlines = [VisualThemeInline, GroupInline]


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "slug", "display_order", "is_active", "created_at")
    list_filter = ("category", "is_active")
    search_fields = ("name", "slug", "description", "category__name")
    ordering = ("category__display_order", "display_order", "name")
    inlines = [VisualThemeInline, ProfessionInline]


@admin.register(Profession)
class ProfessionAdmin(admin.ModelAdmin):
    list_display = ("name", "group", "slug", "display_order", "is_active", "created_at")
    list_filter = ("group__category", "group", "is_active")
    search_fields = ("name", "slug", "description", "group__name")
    ordering = ("group__display_order", "display_order", "name")
    inlines = [VisualThemeInline, ProfessionFieldInline, ProfessionDocumentInline]


@admin.register(CommonField)
class CommonFieldAdmin(admin.ModelAdmin):
    list_display = (
        "label",
        "field_key",
        "field_type",
        "is_required",
        "display_order",
        "is_active",
        "updated_at",
    )
    list_filter = ("field_type", "is_required", "is_active")
    search_fields = ("name", "field_key", "label", "placeholder", "help_text")
    ordering = ("display_order", "name")
    inlines = [FieldOptionInline]


@admin.register(ProfessionField)
class ProfessionFieldAdmin(admin.ModelAdmin):
    list_display = (
        "label",
        "profession",
        "field_key",
        "field_type",
        "is_required",
        "display_order",
        "is_active",
        "updated_at",
    )
    list_filter = ("profession__group__category", "profession", "field_type", "is_required", "is_active")
    search_fields = ("name", "field_key", "label", "profession__name")
    ordering = ("profession", "display_order", "name")
    inlines = [FieldOptionInline]


@admin.register(FieldOption)
class FieldOptionAdmin(admin.ModelAdmin):
    list_display = (
        "label",
        "value",
        "common_field",
        "profession_field",
        "display_order",
        "is_active",
    )
    list_filter = ("is_active", "common_field__field_type", "profession_field__field_type")
    search_fields = ("value", "label", "common_field__name", "profession_field__name")
    ordering = ("display_order", "label")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("name", "document_key", "max_file_size_mb", "display_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "document_key", "description")
    ordering = ("display_order", "name")


@admin.register(ProfessionDocument)
class ProfessionDocumentAdmin(admin.ModelAdmin):
    list_display = ("profession", "document", "is_required", "display_order", "is_active")
    list_filter = ("profession__group__category", "profession", "is_required", "is_active")
    search_fields = ("profession__name", "document__name", "instructions")
    ordering = ("profession", "display_order")


@admin.register(VisualTheme)
class VisualThemeAdmin(admin.ModelAdmin):
    list_display = ("__str__", "primary_color", "background_color", "border_color", "use_parent_theme")
    search_fields = ("category__name", "group__name", "profession__name")


class SubmissionFileInline(admin.TabularInline):
    model = ProfessionalRegistrationSubmissionFile
    extra = 0
    readonly_fields = ("document_key", "original_name", "file", "content_type", "size_bytes", "uploaded_at")
    can_delete = False


@admin.register(ProfessionalRegistrationSubmission)
class ProfessionalRegistrationSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "reference_id",
        "category",
        "group",
        "profession",
        "status",
        "created_at",
    )
    list_filter = ("status", "category", "created_at")
    search_fields = ("reference_id",)
    readonly_fields = (
        "reference_id",
        "category",
        "group",
        "profession",
        "common_field_values",
        "profession_field_values",
        "selected_category_ids",
        "selected_group_ids",
        "selected_profession_ids",
        "created_at",
        "updated_at",
    )
    inlines = [SubmissionFileInline]

