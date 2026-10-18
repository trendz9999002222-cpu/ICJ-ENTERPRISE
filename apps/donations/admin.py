from django.contrib import admin
from apps.donations.models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = (
        "receipt_number",
        "donor_name",
        "amount",
        "fund_category",
        "status",
        "donor_pan",
        "easebuzz_txnid",
        "created_at",
    )
    list_filter = ("status", "fund_category", "is_80g_eligible", "created_at")
    search_fields = (
        "donor_name",
        "donor_email",
        "donor_phone",
        "donor_pan",
        "receipt_number",
        "easebuzz_txnid",
        "easebuzz_payment_id",
    )
    readonly_fields = ("created_at", "updated_at")
