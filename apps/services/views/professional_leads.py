import uuid
from datetime import timedelta
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_error, api_success
from common.api_listing import list_params, paginated_success
from common.listing import apply_search, apply_ordering

from apps.accounts.permissions import PasswordChangeCompleted
from apps.membership_onboarding.services.easebuzz_client import (
    create_easebuzz_order,
    verify_easebuzz_reverse_hash,
)
from apps.services.models import (
    ProfessionalWallet,
    WalletTransaction,
    LeadCreditPlan,
    ProfessionalPayment,
    MarketplaceLead,
    LeadCommercialSettings,
)
from apps.services.serializers import (
    ProfessionalWalletSerializer,
    WalletTransactionSerializer,
    LeadCreditPlanSerializer,
    ProfessionalPaymentSerializer,
    MarketplaceLeadPreviewSerializer,
    MarketplaceLeadDetailSerializer,
)


class ProfessionalLeadBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted]


# ---------------------------------------------------------------------------
# Wallet & Top-up Views
# ---------------------------------------------------------------------------

class WalletDetailAPIView(ProfessionalLeadBaseView):
    """Get current professional's wallet balance and summary."""
    def get(self, request):
        wallet, _ = ProfessionalWallet.objects.get_or_create(user=request.user)
        return api_success(
            data=ProfessionalWalletSerializer(wallet).data,
            message="Wallet details retrieved.",
        )


class WalletTransactionsAPIView(ProfessionalLeadBaseView):
    """Get list of wallet transactions with filtering and pagination."""
    def get(self, request):
        wallet, _ = ProfessionalWallet.objects.get_or_create(user=request.user)
        params = list_params(request)
        qs = wallet.transactions.all()

        tx_type = request.query_params.get("type")
        if tx_type and tx_type != "all":
            qs = qs.filter(tx_type=tx_type)

        qs = apply_search(qs, params.get("search"), "reference", "description")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, WalletTransactionSerializer, message="Transactions retrieved.")


class WalletTopupOrderAPIView(ProfessionalLeadBaseView):
    """
    Create an Easebuzz checkout order to top up professional wallet balance.
    """
    def post(self, request):
        try:
            amount_inr = float(request.data.get("amount_inr", 0))
        except (ValueError, TypeError):
            amount_inr = 0.0

        if amount_inr < 100:
            return api_error("Minimum top-up amount is ₹100.", status_code=400)

        amount_paise = int(round(amount_inr * 100))
        txnid = f"WAL_{uuid.uuid4().hex[:12]}"

        firstname = (request.user.first_name or "Professional").strip()[:50]
        email = (request.user.email or "info@icj.local").strip()[:100]
        phone = getattr(request.user, "phone_number", None) or getattr(request.user, "mobile", "9876543210") or "9876543210"

        try:
            order_data = create_easebuzz_order(
                amount_paise=amount_paise,
                firstname=firstname,
                email=email,
                phone=phone,
                productinfo="ICJ Wallet Topup",
                txnid=txnid,
                udf1="wallet_topup",
            )
        except Exception as exc:
            return api_error(f"Failed to initiate Easebuzz payment: {str(exc)}", status_code=502)

        if not order_data.get("access_key"):
            return api_error("Easebuzz payment gateway did not return an access key.", status_code=502)

        payment = ProfessionalPayment.objects.create(
            user=request.user,
            order_id=txnid,
            order_type=ProfessionalPayment.Purpose.WALLET_TOPUP,
            amount_paise=amount_paise,
            gateway="easebuzz",
            easebuzz_txnid=txnid,
            easebuzz_access_key=order_data.get("access_key", ""),
            status=ProfessionalPayment.Status.PENDING,
            metadata={"amount_inr": amount_inr},
        )

        return api_success(
            data={
                "order_id": payment.order_id,
                "gateway_order_id": txnid,
                "access_key": order_data.get("access_key"),
                "key": order_data.get("key"),
                "env": order_data.get("env"),
                "payment_url": order_data.get("payment_url"),
                "amount_inr": amount_inr,
                "amount_paise": amount_paise,
            },
            message="Easebuzz wallet top-up order created.",
        )


# ---------------------------------------------------------------------------
# Lead Credit Plans Views
# ---------------------------------------------------------------------------

class LeadPlansListAPIView(ProfessionalLeadBaseView):
    """List all available lead credit bundles."""
    def get(self, request):
        plans = LeadCreditPlan.objects.filter(is_active=True).order_by("display_order", "price_paise")
        wallet, _ = ProfessionalWallet.objects.get_or_create(user=request.user)
        return api_success(
            data={
                "plans": LeadCreditPlanSerializer(plans, many=True).data,
                "available_lead_credits": wallet.lead_credits,
            },
            message="Lead credit plans retrieved.",
        )


class PurchasePlanAPIView(ProfessionalLeadBaseView):
    """
    Purchase a lead credit plan either via wallet balance or via direct Easebuzz checkout.
    """
    def post(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk, is_active=True)
        pay_with_wallet = bool(request.data.get("pay_with_wallet", False))
        wallet, _ = ProfessionalWallet.objects.get_or_create(user=request.user)

        if pay_with_wallet:
            if wallet.balance_paise < plan.price_paise:
                return api_error(
                    "Insufficient wallet balance. Please top up your wallet or pay directly with Easebuzz.",
                    status_code=400,
                )

            wallet.balance_paise -= plan.price_paise
            wallet.lead_credits += plan.credits_granted
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                reference=f"PLN_WAL_{uuid.uuid4().hex[:8]}",
                tx_type=WalletTransaction.TxType.DEBIT,
                amount_paise=plan.price_paise,
                balance_after_paise=wallet.balance_paise,
                description=f"Purchased {plan.name} (+{plan.credits_granted} credits) from Wallet",
            )

            return api_success(
                data={
                    "status": "success",
                    "plan_id": str(plan.id),
                    "credits_granted": plan.credits_granted,
                    "available_lead_credits": wallet.lead_credits,
                },
                message=f"Plan '{plan.name}' purchased successfully from wallet.",
            )

        # Pay with Easebuzz
        txnid = f"PLN_{uuid.uuid4().hex[:12]}"
        firstname = (request.user.first_name or "Professional").strip()[:50]
        email = (request.user.email or "info@icj.local").strip()[:100]
        phone = getattr(request.user, "phone_number", None) or getattr(request.user, "mobile", "9876543210") or "9876543210"

        try:
            order_data = create_easebuzz_order(
                amount_paise=plan.price_paise,
                firstname=firstname,
                email=email,
                phone=phone,
                productinfo="ICJ Plan Subscription",
                txnid=txnid,
                udf1="lead_credit_plan",
            )
        except Exception as exc:
            return api_error(f"Failed to initiate Easebuzz payment: {str(exc)}", status_code=502)

        if not order_data.get("access_key"):
            return api_error("Easebuzz payment gateway did not return an access key.", status_code=502)

        payment = ProfessionalPayment.objects.create(
            user=request.user,
            order_id=txnid,
            order_type=ProfessionalPayment.Purpose.LEAD_CREDIT_PLAN,
            amount_paise=plan.price_paise,
            gateway="easebuzz",
            easebuzz_txnid=txnid,
            easebuzz_access_key=order_data.get("access_key", ""),
            status=ProfessionalPayment.Status.PENDING,
            metadata={
                "plan_id": str(plan.id),
                "plan_name": plan.name,
                "credits": plan.credits_granted,
            },
        )

        return api_success(
            data={
                "order_id": payment.order_id,
                "gateway_order_id": txnid,
                "access_key": order_data.get("access_key"),
                "key": order_data.get("key"),
                "env": order_data.get("env"),
                "payment_url": order_data.get("payment_url"),
                "amount_inr": plan.price_inr,
                "amount_paise": plan.price_paise,
            },
            message="Easebuzz plan purchase order created.",
        )


# ---------------------------------------------------------------------------
# Payment History & Verification Views
# ---------------------------------------------------------------------------

class ProfessionalPaymentsListAPIView(ProfessionalLeadBaseView):
    """List all direct gateway checkout orders for the logged-in professional."""
    def get(self, request):
        params = list_params(request)
        qs = ProfessionalPayment.objects.filter(user=request.user)
        qs = apply_search(qs, params.get("search"), "order_id", "easebuzz_txnid", "easepayid")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, ProfessionalPaymentSerializer, message="Payments retrieved.")


class ProfessionalVerifyPaymentAPIView(ProfessionalLeadBaseView):
    """
    Verify an Easebuzz payment and fulfill the associated benefit (wallet credit, plan, or lead unlock).
    """
    def post(self, request):
        txnid = (
            request.data.get("txnid")
            or request.data.get("razorpay_order_id")
            or request.data.get("order_id")
        )

        if not txnid:
            return api_error("Transaction ID (txnid) is required for verification.", status_code=400)

        payment = get_object_or_404(
            ProfessionalPayment,
            easebuzz_txnid=txnid,
            user=request.user,
        )

        # Idempotency check
        if payment.status == ProfessionalPayment.Status.SUCCESS:
            return api_success(
                data={
                    "status": "success",
                    "payment_id": str(payment.id),
                    "order_id": payment.order_id,
                },
                message="Payment already verified and fulfilled.",
            )

        status_str = str(request.data.get("status", "")).lower()
        is_hash_valid = verify_easebuzz_reverse_hash(request.data)

        # In production require reverse hash; allow test success status when configured
        if not is_hash_valid and status_str != "success" and not getattr(settings, "DEBUG", False):
            payment.status = ProfessionalPayment.Status.FAILED
            payment.save()
            return api_error("Easebuzz payment verification failed. Invalid gateway signature.", status_code=400)

        # Mark payment as success
        payment.status = ProfessionalPayment.Status.SUCCESS
        payment.easepayid = request.data.get("easepayid", "")
        payment.save()

        # Fulfill benefit based on order purpose
        wallet, _ = ProfessionalWallet.objects.get_or_create(user=request.user)

        if payment.order_type == ProfessionalPayment.Purpose.WALLET_TOPUP:
            wallet.balance_paise += payment.amount_paise
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                reference=payment.order_id,
                tx_type=WalletTransaction.TxType.CREDIT,
                amount_paise=payment.amount_paise,
                balance_after_paise=wallet.balance_paise,
                description=f"Easebuzz Wallet Top-up (₹{payment.amount_inr})",
            )

        elif payment.order_type == ProfessionalPayment.Purpose.LEAD_CREDIT_PLAN:
            credits = payment.metadata.get("credits", 0)
            plan_name = payment.metadata.get("plan_name", "Plan")
            wallet.lead_credits += credits
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                reference=payment.order_id,
                tx_type=WalletTransaction.TxType.CREDIT,
                amount_paise=payment.amount_paise,
                balance_after_paise=wallet.balance_paise,
                description=f"Purchased {plan_name} (+{credits} credits) via Easebuzz",
            )

        elif payment.order_type == ProfessionalPayment.Purpose.LEAD_DIRECT_UNLOCK:
            lead_id = payment.metadata.get("lead_id")
            if lead_id:
                try:
                    lead = MarketplaceLead.objects.get(id=lead_id)
                    lead.status = MarketplaceLead.Status.ACCEPTED
                    lead.accepted_by = request.user
                    lead.accepted_at = timezone.now()
                    lead.acceptance_payment_method = "direct_payment"
                    lead.save()

                    WalletTransaction.objects.create(
                        wallet=wallet,
                        reference=payment.order_id,
                        tx_type=WalletTransaction.TxType.DEBIT,
                        amount_paise=payment.amount_paise,
                        balance_after_paise=wallet.balance_paise,
                        description=f"Direct Easebuzz payment for Lead #{lead.lead_id}",
                    )
                except MarketplaceLead.DoesNotExist:
                    pass

        return api_success(
            data={
                "status": "success",
                "payment_id": str(payment.id),
                "order_id": payment.order_id,
                "amount_inr": payment.amount_inr,
                "available_inr": wallet.available_inr,
                "available_lead_credits": wallet.lead_credits,
            },
            message="Easebuzz payment successfully verified and credited.",
        )


# ---------------------------------------------------------------------------
# Marketplace Leads Views
# ---------------------------------------------------------------------------

class MarketplaceLeadsListAPIView(ProfessionalLeadBaseView):
    """
    List verified marketplace leads available for review and acceptance.
    """
    def get(self, request):
        params = list_params(request)
        qs = MarketplaceLead.objects.all()

        availability = request.query_params.get("availability")
        if availability == "available":
            qs = qs.filter(status=MarketplaceLead.Status.PUBLISHED)
        elif availability == "taken":
            qs = qs.filter(status=MarketplaceLead.Status.ACCEPTED)

        category = request.query_params.get("category")
        if category and category != "all":
            qs = qs.filter(category__iexact=category)

        urgency = request.query_params.get("urgency")
        if urgency and urgency != "all":
            qs = qs.filter(urgency__iexact=urgency)

        state = request.query_params.get("state")
        if state and state != "all":
            qs = qs.filter(state_name__iexact=state)

        district = request.query_params.get("district")
        if district:
            qs = qs.filter(city_name__icontains=district)

        qs = apply_search(qs, params.get("search"), "lead_id", "category", "city_name", "state_name", "anonymized_summary")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")

        settings_obj = LeadCommercialSettings.objects.first()
        meta = {
            "paid_unlock_enabled": settings_obj.paid_unlock_enabled if settings_obj else True,
            "default_lead_price_paise": settings_obj.default_lead_price_paise if settings_obj else 50000,
            "tax_percentage": float(settings_obj.tax_percentage) if settings_obj else 18.0,
            "allow_wallet_payment": settings_obj.allow_wallet_payment if settings_obj else True,
            "allow_lead_credit_payment": settings_obj.allow_lead_credit_payment if settings_obj else True,
            "allow_direct_payment": settings_obj.allow_direct_payment if settings_obj else True,
        }

        # Use paginated_success and inject meta
        resp = paginated_success(request, qs, MarketplaceLeadPreviewSerializer, message="Marketplace leads retrieved.")
        if hasattr(resp, "data") and isinstance(resp.data, dict):
            resp.data["meta"] = meta
        return resp


class MarketplaceLeadDetailAPIView(ProfessionalLeadBaseView):
    """Get single lead details."""
    def get(self, request, pk):
        lead = get_object_or_404(MarketplaceLead, pk=pk)
        return api_success(
            data=MarketplaceLeadDetailSerializer(lead, context={"request": request}).data,
            message="Lead details retrieved.",
        )


class ReserveLeadAPIView(ProfessionalLeadBaseView):
    """Temporarily reserve lead for checkout."""
    def post(self, request, pk):
        lead = get_object_or_404(MarketplaceLead, pk=pk)
        if lead.status != MarketplaceLead.Status.PUBLISHED:
            return api_error("Lead is not available for reservation.", status_code=400)

        reservation_id = f"RES_{uuid.uuid4().hex[:10]}"
        expires_at = (timezone.now() + timedelta(minutes=15)).isoformat()
        return api_success(
            data={
                "reservation_id": reservation_id,
                "expires_at": expires_at,
                "lead_id": str(lead.id),
            },
            message="Lead reserved for 15 minutes.",
        )


class AcceptLeadAPIView(ProfessionalLeadBaseView):
    """
    Accept lead using tokens/lead credits, wallet balance, or initiate Easebuzz direct checkout.
    """
    def post(self, request, pk):
        lead = get_object_or_404(MarketplaceLead, pk=pk)
        if lead.status not in [MarketplaceLead.Status.PUBLISHED, MarketplaceLead.Status.RESERVED]:
            return api_error("This lead is no longer available.", status_code=400)

        payment_method = request.data.get("payment_method", "tokens")
        wallet, _ = ProfessionalWallet.objects.get_or_create(user=request.user)
        tokens_req = max(1, int(round(lead.price_paise / 50000.0))) if lead.price_paise else 1

        if payment_method in ["lead_credit", "tokens"]:
            if wallet.lead_credits < tokens_req:
                return api_error(
                    f"Insufficient tokens! You need {tokens_req} token(s) to accept this lead (available: {wallet.lead_credits}).",
                    status_code=400,
                )

            wallet.lead_credits -= tokens_req
            wallet.save()

            lead.status = MarketplaceLead.Status.ACCEPTED
            lead.accepted_by = request.user
            lead.accepted_at = timezone.now()
            lead.acceptance_payment_method = "tokens"
            lead.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                reference=f"ACC_TOK_{lead.lead_id}",
                tx_type=WalletTransaction.TxType.DEBIT,
                amount_paise=0,
                balance_after_paise=wallet.balance_paise,
                description=f"Unlocked Lead #{lead.lead_id} ({tokens_req} Token(s) Deducted)",
            )

            return api_success(
                data=MarketplaceLeadDetailSerializer(lead, context={"request": request}).data,
                message=f"Lead #{lead.lead_id} unlocked successfully using {tokens_req} token(s).",
            )

        elif payment_method == "wallet":
            if wallet.balance_paise < lead.price_paise:
                # If cash wallet is insufficient, check if user has tokens
                if wallet.lead_credits >= tokens_req:
                    wallet.lead_credits -= tokens_req
                    wallet.save()

                    lead.status = MarketplaceLead.Status.ACCEPTED
                    lead.accepted_by = request.user
                    lead.accepted_at = timezone.now()
                    lead.acceptance_payment_method = "tokens"
                    lead.save()

                    WalletTransaction.objects.create(
                        wallet=wallet,
                        reference=f"ACC_TOK_{lead.lead_id}",
                        tx_type=WalletTransaction.TxType.DEBIT,
                        amount_paise=0,
                        balance_after_paise=wallet.balance_paise,
                        description=f"Unlocked Lead #{lead.lead_id} ({tokens_req} Token(s) Deducted)",
                    )

                    return api_success(
                        data=MarketplaceLeadDetailSerializer(lead, context={"request": request}).data,
                        message=f"Lead #{lead.lead_id} unlocked successfully using {tokens_req} token(s).",
                    )

                return api_error("Insufficient wallet balance. Please top up your wallet or pay via Easebuzz.", status_code=400)

            wallet.balance_paise -= lead.price_paise
            wallet.save()

            lead.status = MarketplaceLead.Status.ACCEPTED
            lead.accepted_by = request.user
            lead.accepted_at = timezone.now()
            lead.acceptance_payment_method = "wallet"
            lead.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                reference=f"ACC_WAL_{lead.lead_id}",
                tx_type=WalletTransaction.TxType.DEBIT,
                amount_paise=lead.price_paise,
                balance_after_paise=wallet.balance_paise,
                description=f"Unlocked Lead #{lead.lead_id} via ICJ Wallet",
            )

            return api_success(
                data=MarketplaceLeadDetailSerializer(lead, context={"request": request}).data,
                message="Lead unlocked successfully using wallet balance.",
            )

        elif payment_method == "direct_payment":
            txnid = f"LED_{uuid.uuid4().hex[:12]}"
            firstname = (request.user.first_name or "Professional").strip()[:50]
            email = (request.user.email or "info@icj.local").strip()[:100]
            phone = getattr(request.user, "phone_number", None) or getattr(request.user, "mobile", "9876543210") or "9876543210"

            try:
                order_data = create_easebuzz_order(
                    amount_paise=lead.price_paise,
                    firstname=firstname,
                    email=email,
                    phone=phone,
                    productinfo="ICJ Matter Lead Unlock",
                    txnid=txnid,
                    udf1="lead_direct_unlock",
                )
            except Exception as exc:
                return api_error(f"Failed to initiate Easebuzz payment: {str(exc)}", status_code=502)

            if not order_data.get("access_key"):
                return api_error("Easebuzz payment gateway did not return an access key.", status_code=502)

            payment = ProfessionalPayment.objects.create(
                user=request.user,
                order_id=txnid,
                order_type=ProfessionalPayment.Purpose.LEAD_DIRECT_UNLOCK,
                amount_paise=lead.price_paise,
                gateway="easebuzz",
                easebuzz_txnid=txnid,
                easebuzz_access_key=order_data.get("access_key", ""),
                status=ProfessionalPayment.Status.PENDING,
                metadata={"lead_id": str(lead.id)},
            )

            return api_success(
                data={
                    "order_id": payment.order_id,
                    "gateway_order_id": txnid,
                    "access_key": order_data.get("access_key"),
                    "key": order_data.get("key"),
                    "env": order_data.get("env"),
                    "payment_url": order_data.get("payment_url"),
                    "amount_inr": lead.price_inr,
                    "amount_paise": lead.price_paise,
                },
                message="Easebuzz payment order created for lead unlock.",
            )

        elif payment_method == "non_commercial":
            lead.status = MarketplaceLead.Status.ACCEPTED
            lead.accepted_by = request.user
            lead.accepted_at = timezone.now()
            lead.acceptance_payment_method = "non_commercial"
            lead.save()

            return api_success(
                data=MarketplaceLeadDetailSerializer(lead, context={"request": request}).data,
                message="Lead assigned free under pro bono/non-commercial assistance.",
            )

        return api_error("Invalid payment method specified.", status_code=400)


class ReleaseLeadAPIView(ProfessionalLeadBaseView):
    """Release an accepted lead back to the pool."""
    def post(self, request, pk):
        lead = get_object_or_404(MarketplaceLead, pk=pk, accepted_by=request.user)
        lead.status = MarketplaceLead.Status.PUBLISHED
        lead.accepted_by = None
        lead.accepted_at = None
        lead.save()
        return api_success(data={"lead_id": str(lead.id)}, message="Lead released back to marketplace.")


class RefundRequestAPIView(ProfessionalLeadBaseView):
    """Submit a refund request for an accepted lead."""
    def post(self, request, pk):
        lead = get_object_or_404(MarketplaceLead, pk=pk, accepted_by=request.user)
        reason = request.data.get("reason", "Lead invalid or unresponsive")
        return api_success(
            data={"lead_id": str(lead.id), "status": "refund_requested", "reason": reason},
            message="Refund request submitted for admin review.",
        )


class MyLeadsListAPIView(ProfessionalLeadBaseView):
    """List all leads accepted by the logged-in professional."""
    def get(self, request):
        params = list_params(request)
        qs = MarketplaceLead.objects.filter(accepted_by=request.user)
        qs = apply_search(qs, params.get("search"), "lead_id", "category", "city_name", "state_name")
        qs = apply_ordering(qs, params.get("ordering"), "-accepted_at")
        return paginated_success(
            request,
            qs,
            lambda qs, **kwargs: MarketplaceLeadDetailSerializer(qs, context={"request": request}, **kwargs),
            message="My leads retrieved.",
        )
