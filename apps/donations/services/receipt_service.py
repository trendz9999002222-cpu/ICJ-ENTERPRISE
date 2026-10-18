import random
from django.db import transaction
from django.utils import timezone


TRUST_DETAILS = {
    "name": "INDIAN CYBER / CORPORATE JUDICIARY TRUST",
    "registration_no": "ICJ/TR/2023/DEL-98421",
    "pan": "AAATI9982F",
    "80g_reg_no": "AAATI9982FF20234",
    "80g_validity": "Perpetual / AY 2024-25 onwards",
    "office_address": "801-804, Sovereign Tower, Justice Avenue, New Delhi - 110001",
    "email": "trust@icj.org.in",
    "phone": "+91 11 4982 0000",
}


def number_to_words_inr(amount_num: float) -> str:
    """Basic conversion of amount to Indian currency words."""
    try:
        val = int(amount_num)
        if val <= 0:
            return "Zero Rupees Only"
        
        ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
                "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
                "Seventeen", "Eighteen", "Nineteen"]
        tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

        def helper(n):
            if n < 20:
                return ones[n]
            elif n < 100:
                return tens[n // 10] + (" " + ones[n % 10] if n % 10 != 0 else "")
            elif n < 1000:
                return ones[n // 100] + " Hundred" + (" and " + helper(n % 100) if n % 100 != 0 else "")
            elif n < 100000:
                return helper(n // 1000) + " Thousand" + (" " + helper(n % 1000) if n % 1000 != 0 else "")
            elif n < 10000000:
                return helper(n // 100000) + " Lakh" + (" " + helper(n % 100000) if n % 100000 != 0 else "")
            else:
                return helper(n // 10000000) + " Crore" + (" " + helper(n % 10000000) if n % 10000000 != 0 else "")

        return f"{helper(val).strip()} Rupees Only"
    except Exception:
        return f"{amount_num} INR"


def generate_donation_receipt_number(donation) -> str:
    """Generate a clean, unique sequential receipt number for a donation."""
    from apps.donations.models import Donation

    year = timezone.now().year
    prefix = f"ICJ-DON-{year}"

    with transaction.atomic():
        count = (
            Donation.objects.filter(
                status=Donation.Status.SUCCESS,
                receipt_number__startswith=prefix,
            )
            .exclude(id=donation.id)
            .count()
        )
        candidate = f"{prefix}-{(count + 1):04d}"
        if Donation.objects.filter(receipt_number=candidate).exists():
            candidate = f"{prefix}-{(count + 1):04d}-{random.randint(10, 99)}"
        return candidate


def build_receipt_data(donation) -> dict:
    """Build full dictionary representation of 80G compliant donation receipt."""
    amount_float = float(donation.amount)
    return {
        "receipt_number": donation.receipt_number or "PENDING",
        "date": donation.created_at.strftime("%d %b %Y, %I:%M %p"),
        "financial_year": f"{donation.created_at.year}-{str(donation.created_at.year + 1)[-2:]}",
        "status": donation.status,
        "amount": amount_float,
        "amount_formatted": f"₹{amount_float:,.2f}",
        "amount_in_words": number_to_words_inr(amount_float),
        "donor": {
            "name": "Anonymous Benefactor" if donation.is_anonymous else donation.donor_name,
            "email": donation.donor_email,
            "phone": donation.donor_phone,
            "pan": donation.donor_pan or "NOT PROVIDED",
            "address": donation.donor_address or "",
            "state": donation.donor_state or "",
            "pincode": donation.donor_pincode or "",
        },
        "purpose": {
            "code": donation.fund_category,
            "label": donation.get_fund_category_display(),
            "notes": donation.notes,
        },
        "payment": {
            "gateway": donation.gateway,
            "transaction_id": donation.easebuzz_txnid,
            "payment_id": donation.easebuzz_payment_id or donation.easebuzz_txnid,
            "mode": donation.payment_mode or "ONLINE",
            "bank_ref": donation.bank_ref_num,
        },
        "trust": TRUST_DETAILS,
        "is_80g_eligible": donation.is_80g_eligible,
        "verification_url": f"/verify-donation?receipt={donation.receipt_number}",
    }
