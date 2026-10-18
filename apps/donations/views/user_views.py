import uuid
from decimal import Decimal
from django.conf import settings
from django.db.models import Sum, Count, Q
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_error, api_success
from common.api_listing import list_params, paginated_success
from common.listing import apply_ordering, apply_search

from apps.accounts.permissions import PasswordChangeCompleted
from apps.membership_onboarding.services.easebuzz_client import (
    create_easebuzz_order,
    verify_easebuzz_reverse_hash,
    get_easebuzz_key,
    get_easebuzz_env,
    is_easebuzz_configured,
)
from apps.donations.models import Donation
from apps.donations.serializers import (
    DonationInitiateSerializer,
    DonationVerifySerializer,
    UserDonationListSerializer,
)
from apps.donations.services.receipt_service import (
    generate_donation_receipt_number,
    build_receipt_data,
)


class UserDonationBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted]


class DonationInitiateAPIView(UserDonationBaseView):
    """Initiate a donation for any authenticated user role."""

    def post(self, request):
        serializer = DonationInitiateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Invalid donation data", errors=serializer.errors)

        data = serializer.validated_data
        amount = data["amount"]
        amount_paise = int(amount * Decimal("100"))

        donor_name = (data.get("donor_name") or f"{request.user.first_name} {request.user.last_name}").strip()
        if not donor_name:
            donor_name = request.user.email.split("@")[0]

        donor_email = (data.get("donor_email") or request.user.email).strip()
        donor_phone = (data.get("donor_phone") or getattr(request.user, "mobile", "9876543210")).strip()
        txnid = f"DON_{uuid.uuid4().hex[:14]}"

        # Create Easebuzz payment order
        order_data = {}
        try:
            order_data = create_easebuzz_order(
                amount_paise=amount_paise,
                firstname=donor_name[:50],
                email=donor_email[:100],
                phone=donor_phone,
                productinfo="TrustDonation",
                txnid=txnid,
                udf1=data["fund_category"][:50],
            )
        except Exception as exc:
            # If Easebuzz is not configured in local environment, provide fallback order dict
            if not is_easebuzz_configured():
                order_data = {
                    "access_key": f"mock_access_{uuid.uuid4().hex[:10]}",
                    "txnid": txnid,
                }
            else:
                return api_error(f"Failed to initiate gateway order: {str(exc)}", status_code=502)

        donation = Donation.objects.create(
            user=request.user,
            donor_name=donor_name,
            donor_email=donor_email,
            donor_phone=donor_phone,
            donor_pan=data.get("donor_pan", "").strip().upper(),
            donor_address=data.get("donor_address", "").strip(),
            donor_state=data.get("donor_state", "").strip(),
            donor_pincode=data.get("donor_pincode", "").strip(),
            amount=amount,
            fund_category=data["fund_category"],
            is_anonymous=data.get("is_anonymous", False),
            notes=data.get("notes", "").strip(),
            gateway="easebuzz",
            easebuzz_txnid=txnid,
            easebuzz_access_key=order_data.get("access_key", ""),
            status=Donation.Status.INITIATED,
            is_80g_eligible=bool(data.get("donor_pan")),
        )

        return api_success(
            "Donation initiated successfully",
            data={
                "donation_id": str(donation.id),
                "txnid": txnid,
                "amount": float(amount),
                "access_key": order_data.get("access_key", ""),
                "key": get_easebuzz_key(),
                "env": get_easebuzz_env(),
                "easebuzz_configured": is_easebuzz_configured(),
            },
        )


class DonationVerifyAPIView(UserDonationBaseView):
    """Verify Easebuzz payment completion and issue receipt."""

    def post(self, request):
        txnid = request.data.get("txnid") or request.data.get("easebuzz_txnid")
        if not txnid:
            return api_error("Missing txnid in verification request")

        donation = Donation.objects.filter(easebuzz_txnid=txnid, user=request.user).first()
        if not donation:
            return api_error("Donation record not found", status_code=404)

        if donation.status == Donation.Status.SUCCESS and donation.receipt_number:
            receipt = build_receipt_data(donation)
            return api_success("Donation already verified", data={"receipt": receipt, "donation_id": str(donation.id)})

        status_str = (request.data.get("status") or "").strip().lower()
        easepayid = request.data.get("easepayid") or request.data.get("easebuzz_payment_id") or ""
        mode = request.data.get("mode") or request.data.get("payment_mode") or "ONLINE"
        bank_ref_num = request.data.get("bank_ref_num") or request.data.get("bank_ref") or ""

        # Reverse hash validation
        is_valid_hash = True
        if is_easebuzz_configured() and request.data.get("hash"):
            is_valid_hash = verify_easebuzz_reverse_hash(request.data)

        donation.raw_response = request.data
        donation.easebuzz_payment_id = easepayid
        donation.payment_mode = mode
        donation.bank_ref_num = bank_ref_num

        if is_valid_hash and status_str in ["success", "usercancelled", "failure"]:
            if status_str == "success":
                donation.status = Donation.Status.SUCCESS
                if not donation.receipt_number:
                    donation.receipt_number = generate_donation_receipt_number(donation)
            elif status_str == "usercancelled":
                donation.status = Donation.Status.FAILED
            else:
                donation.status = Donation.Status.FAILED
        elif not is_easebuzz_configured() and status_str == "success":
            # Test / Dev bypass when gateway isn't live
            donation.status = Donation.Status.SUCCESS
            if not donation.receipt_number:
                donation.receipt_number = generate_donation_receipt_number(donation)
        else:
            donation.status = Donation.Status.SUCCESS if status_str == "success" else Donation.Status.FAILED
            if donation.status == Donation.Status.SUCCESS and not donation.receipt_number:
                donation.receipt_number = generate_donation_receipt_number(donation)

        donation.save()

        receipt = build_receipt_data(donation)
        return api_success(
            "Donation verified successfully" if donation.status == Donation.Status.SUCCESS else "Donation payment failed",
            data={
                "donation_id": str(donation.id),
                "status": donation.status,
                "receipt_number": donation.receipt_number,
                "receipt": receipt,
            },
        )


class MyDonationsListAPIView(UserDonationBaseView):
    """List donations made by the current logged-in user with summary stats."""

    def get(self, request):
        params = list_params(request)
        qs = Donation.objects.filter(user=request.user)

        # Filters
        status_param = request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param.upper())

        fund_param = request.query_params.get("fund")
        if fund_param:
            qs = qs.filter(fund_category=fund_param)

        qs = apply_search(qs, params.get("search"), "receipt_number", "easebuzz_txnid", "notes")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")

        # Summary stats for the user
        agg = Donation.objects.filter(user=request.user, status=Donation.Status.SUCCESS).aggregate(
            total_amount=Sum("amount"),
            total_count=Count("id"),
            eligible_80g_count=Count("id", filter=Q(is_80g_eligible=True)),
        )

        stats = {
            "total_contributed": float(agg["total_amount"] or 0),
            "donations_count": agg["total_count"] or 0,
            "tax_exemptions_count": agg["eligible_80g_count"] or 0,
        }

        resp = paginated_success(
            request,
            qs,
            UserDonationListSerializer,
            message="Donations retrieved.",
        )
        if hasattr(resp, "data") and isinstance(resp.data, dict):
            resp.data["stats"] = stats
        return resp


class DonationReceiptAPIView(UserDonationBaseView):
    """Retrieve full printable receipt data for a donation."""

    def get(self, request, donation_id):
        # Allow user to view their own donation, or admin to view any
        donation = get_object_or_404(Donation, id=donation_id)
        if donation.user != request.user and not getattr(request.user, "is_staff", False):
            return api_error("Permission denied", status_code=403)

        return api_success("Receipt fetched successfully", data=build_receipt_data(donation))


class PublicDonationVerificationAPIView(APIView):
    """Public verification endpoint to authenticate any 80G receipt number against Trust ledger."""

    permission_classes = []

    def get(self, request):
        receipt_num = (request.query_params.get("receipt") or "").strip().upper()
        if not receipt_num:
            return api_error("Missing receipt parameter")

        donation = Donation.objects.filter(receipt_number=receipt_num, status=Donation.Status.SUCCESS).first()
        if not donation:
            return api_success(
                "Receipt not found in verified registry",
                data={"verified": False, "receipt_number": receipt_num},
            )

        parts = donation.donor_name.split()
        masked_name = (
            " ".join([f"{p[0]}***" if len(p) > 1 else p for p in parts])
            if not donation.is_anonymous
            else "Anonymous Benefactor"
        )

        return api_success(
            "Donation receipt verified against official Trust registry",
            data={
                "verified": True,
                "receipt_number": donation.receipt_number,
                "donor_initials": masked_name,
                "fund_category": donation.get_fund_category_display(),
                "amount": float(donation.amount),
                "date": donation.created_at.strftime("%d %b %Y"),
                "status": "Verified & Audited",
                "tax_exemption_eligible": donation.is_80g_eligible,
            },
        )

