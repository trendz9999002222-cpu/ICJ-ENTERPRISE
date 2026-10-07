from django.contrib import admin
from apps.services.models import JusticeService, ServiceCategory

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
