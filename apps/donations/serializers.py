from decimal import Decimal
from rest_framework import serializers
from apps.donations.models import Donation


class DonationInitiateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("1.0"))
    fund_category = serializers.ChoiceField(
        choices=Donation.FundCategory.choices,
        default=Donation.FundCategory.GENERAL,
    )
    donor_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    donor_email = serializers.EmailField(required=False, allow_blank=True)
    donor_phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    donor_pan = serializers.CharField(max_length=20, required=False, allow_blank=True)
    donor_address = serializers.CharField(required=False, allow_blank=True)
    donor_state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    donor_pincode = serializers.CharField(max_length=20, required=False, allow_blank=True)
    is_anonymous = serializers.BooleanField(default=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class DonationVerifySerializer(serializers.Serializer):
    txnid = serializers.CharField(required=True)
    status = serializers.CharField(required=False, allow_blank=True)
    easepayid = serializers.CharField(required=False, allow_blank=True)
    hash = serializers.CharField(required=False, allow_blank=True)
    mode = serializers.CharField(required=False, allow_blank=True)
    bank_ref_num = serializers.CharField(required=False, allow_blank=True)


class UserDonationListSerializer(serializers.ModelSerializer):
    fund_category_display = serializers.CharField(source="get_fund_category_display", read_only=True)
    receipt_url = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            "id",
            "receipt_number",
            "amount",
            "currency",
            "fund_category",
            "fund_category_display",
            "is_anonymous",
            "status",
            "payment_mode",
            "donor_pan",
            "easebuzz_txnid",
            "created_at",
            "receipt_url",
            "notes",
        ]

    def get_receipt_url(self, obj):
        if obj.status == Donation.Status.SUCCESS and obj.receipt_number:
            return f"/verify-donation?receipt={obj.receipt_number}"
        return None


class AdminDonationListSerializer(serializers.ModelSerializer):
    fund_category_display = serializers.CharField(source="get_fund_category_display", read_only=True)
    user_info = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            "id",
            "receipt_number",
            "donor_name",
            "donor_email",
            "donor_phone",
            "donor_pan",
            "donor_address",
            "donor_state",
            "donor_pincode",
            "amount",
            "currency",
            "fund_category",
            "fund_category_display",
            "is_anonymous",
            "notes",
            "gateway",
            "easebuzz_txnid",
            "easebuzz_payment_id",
            "payment_mode",
            "bank_ref_num",
            "status",
            "is_80g_eligible",
            "created_at",
            "updated_at",
            "user_info",
        ]

    def get_user_info(self, obj):
        if not obj.user:
            return None
        roles = []
        if hasattr(obj.user, "roles"):
            roles = list(obj.user.roles.values_list("name", flat=True))
        return {
            "id": str(obj.user.id),
            "email": obj.user.email,
            "name": f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email,
            "roles": roles,
        }
