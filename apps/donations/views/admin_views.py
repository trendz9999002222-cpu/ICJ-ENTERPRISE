import csv
from datetime import datetime
from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_error, api_success
from common.api_listing import list_params, paginated_success
from common.listing import apply_ordering, apply_search

from apps.accounts.permissions import IsAdminRole, PasswordChangeCompleted
from apps.donations.models import Donation
from apps.donations.serializers import AdminDonationListSerializer
from apps.donations.services.receipt_service import build_receipt_data


class AdminDonationBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted, IsAdminRole]


class AdminDonationListAPIView(AdminDonationBaseView):
    """List all donations across the platform with filtering and search."""

    def get(self, request):
        params = list_params(request)
        qs = Donation.objects.select_related("user").all()

        # Filter by status
        status_param = request.query_params.get("status")
        if status_param and status_param.upper() != "ALL":
            qs = qs.filter(status=status_param.upper())

        # Filter by fund category
        fund_param = request.query_params.get("fund")
        if fund_param and fund_param.upper() != "ALL":
            qs = qs.filter(fund_category=fund_param)

        # Filter by role (member vs professional)
        role_param = request.query_params.get("role")
        if role_param and role_param.upper() != "ALL":
            qs = qs.filter(user__roles__name__iexact=role_param)

        # Filter by date range
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        if start_date:
            try:
                dt_start = datetime.strptime(start_date, "%Y-%m-%d")
                qs = qs.filter(created_at__gte=dt_start)
            except ValueError:
                pass
        if end_date:
            try:
                dt_end = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
                qs = qs.filter(created_at__lte=dt_end)
            except ValueError:
                pass

        qs = apply_search(
            qs,
            params.get("search"),
            "donor_name",
            "donor_email",
            "donor_phone",
            "donor_pan",
            "receipt_number",
            "easebuzz_txnid",
            "easebuzz_payment_id",
            "notes",
        )
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")

        return paginated_success(
            request,
            qs,
            AdminDonationListSerializer,
            message="Donations retrieved.",
        )


class AdminDonationStatsAPIView(AdminDonationBaseView):
    """Overall Trust donation stats for Admin Dashboard."""

    def get(self, request):
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        success_qs = Donation.objects.filter(status=Donation.Status.SUCCESS)

        overall_agg = success_qs.aggregate(
            total_raised=Sum("amount"),
            total_donations=Count("id"),
            total_80g=Count("id", filter=~Q(donor_pan="")),
            total_80g_amount=Sum("amount", filter=~Q(donor_pan="")),
        )

        month_agg = success_qs.filter(created_at__gte=start_of_month).aggregate(
            month_raised=Sum("amount"),
            month_count=Count("id"),
        )

        unique_donors = (
            success_qs.exclude(user__isnull=True)
            .values("user")
            .distinct()
            .count()
        )

        # Category breakdown
        category_breakdown = []
        for cat_code, cat_label in Donation.FundCategory.choices:
            cat_sum = (
                success_qs.filter(fund_category=cat_code).aggregate(s=Sum("amount"))["s"] or Decimal("0")
            )
            category_breakdown.append({
                "code": cat_code,
                "label": cat_label,
                "amount": float(cat_sum),
            })

        data = {
            "total_raised": float(overall_agg["total_raised"] or 0),
            "total_donations": overall_agg["total_donations"] or 0,
            "month_raised": float(month_agg["month_raised"] or 0),
            "month_count": month_agg["month_count"] or 0,
            "unique_donors": unique_donors,
            "total_80g_certificates": overall_agg["total_80g"] or 0,
            "total_80g_amount": float(overall_agg["total_80g_amount"] or 0),
            "category_breakdown": category_breakdown,
        }

        return api_success("Donation stats fetched", data=data)


class AdminDonationDetailAPIView(AdminDonationBaseView):
    """Retrieve complete audit details for a specific donation."""

    def get(self, request, donation_id):
        donation = get_object_or_404(Donation.objects.select_related("user"), id=donation_id)
        serializer = AdminDonationListSerializer(donation)
        receipt_data = build_receipt_data(donation)
        return api_success(
            "Donation detail retrieved",
            data={
                "donation": serializer.data,
                "receipt": receipt_data,
                "raw_response": donation.raw_response,
            },
        )


class AdminDonationExportCSVAPIView(AdminDonationBaseView):
    """Export donation records to CSV formatted for Trust IT Return / Form 10BD."""

    def get(self, request):
        qs = Donation.objects.all().order_by("-created_at")

        status_param = request.query_params.get("status")
        if status_param and status_param.upper() != "ALL":
            qs = qs.filter(status=status_param.upper())

        fund_param = request.query_params.get("fund")
        if fund_param and fund_param.upper() != "ALL":
            qs = qs.filter(fund_category=fund_param)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="ICJ_Trust_Donations_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "Receipt Number",
            "Date",
            "Donor Name",
            "Donor Email",
            "Donor Phone",
            "Donor PAN",
            "Donor Address",
            "Donor State",
            "Donor Pincode",
            "Amount (INR)",
            "Fund Category",
            "Status",
            "Payment Mode",
            "Transaction ID",
            "Easebuzz Payment ID",
            "Is 80G Eligible",
        ])

        for don in qs:
            writer.writerow([
                don.receipt_number or "N/A",
                don.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                don.donor_name,
                don.donor_email,
                don.donor_phone,
                don.donor_pan,
                don.donor_address,
                don.donor_state,
                don.donor_pincode,
                float(don.amount),
                don.get_fund_category_display(),
                don.status,
                don.payment_mode,
                don.easebuzz_txnid,
                don.easebuzz_payment_id,
                "YES" if don.is_80g_eligible else "NO",
            ])

        return response
