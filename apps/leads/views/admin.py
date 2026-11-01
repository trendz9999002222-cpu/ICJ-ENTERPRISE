from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.api_listing import list_params, paginated_success
from common.listing import apply_ordering, apply_search
from common.responses import api_error, api_success
from apps.accounts.permissions import IsAdminRole, PasswordChangeCompleted
from apps.accounts.models import User
from apps.leads.models import (
    Lead,
    LeadAcceptance,
    LeadCommercialSettings,
    LeadCreditPlan,
    ProfessionalWallet,
    WalletTransaction,
    PaymentOrder,
    RefundRequest,
    LeadAuditLog,
)
from apps.leads.serializers import (
    AdminLeadListSerializer,
    LeadDetailSerializer,
    LeadAcceptanceSerializer,
    LeadCommercialSettingsSerializer,
    LeadCreditPlanSerializer,
    ProfessionalWalletSerializer,
    WalletTransactionSerializer,
    PaymentOrderSerializer,
    RefundRequestSerializer,
)
from apps.leads.services.lead_service import LeadService
from apps.leads.services.wallet_service import WalletService
from django.core.cache import cache


def _get_admin_leads_version():
    return cache.get("admin_leads_cache_ver") or 1


def _clear_admin_leads_cache():
    try:
        ver = cache.get("admin_leads_cache_ver") or 1
        cache.set("admin_leads_cache_ver", ver + 1, timeout=86400 * 30)
    except Exception:
        pass


class AdminLeadsBaseView(APIView):
    permission_classes = [IsAuthenticated, PasswordChangeCompleted, IsAdminRole]

    def get_request_data(self, request):
        data = request.data
        if isinstance(data, str):
            import json
            try:
                data = json.loads(data)
            except Exception:
                data = {}
        return data if isinstance(data, dict) else {}


class AdminLeadListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        # Lightweight queryset for table list — only join assistance_request for client identity!
        qs = Lead.objects.select_related("assistance_request").all()

        lead_type = request.query_params.get("lead_type")
        if lead_type and lead_type != "all":
            if lead_type == Lead.LeadType.SEEK_ASSISTANCE:
                qs = qs.filter(Q(lead_type=Lead.LeadType.SEEK_ASSISTANCE) | Q(lead_type__isnull=True) | Q(lead_type=""))
            else:
                qs = qs.filter(lead_type=lead_type)

        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)

        category = request.query_params.get("category")
        if category and category != "all":
            qs = qs.filter(category=category)

        qs = apply_search(
            qs,
            params.get("search"),
            "lead_id",
            "category",
            "service_name",
            "target_professional_name",
            "assistance_request__full_name",
            "state_name",
            "city_name",
        )
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")

        ver = _get_admin_leads_version()

        # Top-level Tab Counts - Cached for 60s to eliminate Australia roundtrip on every navigation!
        counts_cache_key = f"admin_leads_top_counts_v{ver}"
        counts = cache.get(counts_cache_key)
        if counts is None:
            counts_agg = Lead.objects.aggregate(
                all_count=Count("id"),
                seek_count=Count(
                    "id",
                    filter=Q(lead_type=Lead.LeadType.SEEK_ASSISTANCE) | Q(lead_type__isnull=True) | Q(lead_type=""),
                ),
                prof_count=Count("id", filter=Q(lead_type=Lead.LeadType.PROFESSIONAL_APPOINTMENT)),
                serv_count=Count("id", filter=Q(lead_type=Lead.LeadType.SERVICE_REQUEST)),
            )
            counts = {
                "all": counts_agg["all_count"] or 0,
                "seek_assistance": counts_agg["seek_count"] or 0,
                "professional_appointment": counts_agg["prof_count"] or 0,
                "service_request": counts_agg["serv_count"] or 0,
            }
            cache.set(counts_cache_key, counts, timeout=60)

        # Status counts within the active lead_type tab - Cached for 60s
        status_cache_key = f"admin_leads_status_counts_v{ver}_{lead_type or 'all'}_{category or 'all'}"
        status_counts = cache.get(status_cache_key)
        if status_counts is None:
            base_type_qs = Lead.objects.all()
            if lead_type and lead_type != "all":
                if lead_type == Lead.LeadType.SEEK_ASSISTANCE:
                    base_type_qs = base_type_qs.filter(
                        Q(lead_type=Lead.LeadType.SEEK_ASSISTANCE) | Q(lead_type__isnull=True) | Q(lead_type="")
                    )
                else:
                    base_type_qs = base_type_qs.filter(lead_type=lead_type)
            if category and category != "all":
                base_type_qs = base_type_qs.filter(category=category)

            status_agg = base_type_qs.aggregate(
                all_count=Count("id"),
                pending_count=Count("id", filter=Q(status=Lead.Status.PENDING_REVIEW)),
                published_count=Count("id", filter=Q(status=Lead.Status.PUBLISHED)),
                accepted_count=Count("id", filter=Q(status=Lead.Status.ACCEPTED)),
                unavailable_count=Count(
                    "id",
                    filter=Q(status__in=[Lead.Status.UNAVAILABLE, Lead.Status.CLOSED, Lead.Status.REJECTED]),
                ),
            )
            status_counts = {
                "all": status_agg["all_count"] or 0,
                "pending_review": status_agg["pending_count"] or 0,
                "published": status_agg["published_count"] or 0,
                "accepted": status_agg["accepted_count"] or 0,
                "unavailable": status_agg["unavailable_count"] or 0,
            }
            cache.set(status_cache_key, status_counts, timeout=60)

        return paginated_success(
            request,
            qs,
            AdminLeadListSerializer,
            message="Admin leads retrieved.",
            extra={"counts": counts, "status_counts": status_counts},
            context={"request": request, "is_admin": True},
        )

    def post(self, request):
        """
        Manually generate lead from Admin Desk (e.g. over telephone intake).
        """
        data = self.get_request_data(request)
        full_name = data.get("client_name") or data.get("full_name")
        if not full_name:
            return api_error("Client name is required.", status_code=400)

        mobile = data.get("client_mobile") or data.get("mobile", "")
        email = data.get("client_email") or data.get("email", "")
        category = data.get("category", "General Legal")
        urgency = data.get("urgency", "Medium")
        state_name = data.get("state_name", "Not Specified")
        city_name = data.get("city_name", "Not Specified")
        problem_description = data.get("problem_description") or data.get("full_description", "")
        anonymized_summary = data.get("anonymized_summary") or f"Legal matter regarding {category} in {city_name}, {state_name}. Urgency: {urgency}."
        tokens_required = int(data.get("tokens_required", 1))
        initial_status = data.get("status", Lead.Status.PENDING_REVIEW)
        if initial_status not in [Lead.Status.PENDING_REVIEW, Lead.Status.PUBLISHED, Lead.Status.DRAFT]:
            initial_status = Lead.Status.PENDING_REVIEW

        lead_type = data.get("lead_type", Lead.LeadType.SEEK_ASSISTANCE)
        service_name = data.get("service_name", "")
        target_professional_name = data.get("target_professional_name", "")
        target_professional_id = data.get("target_professional_id", "")

        import random
        from django.utils import timezone
        from apps.services.models import AssistanceRequest
        from apps.leads.models import LeadActivity

        year = timezone.now().year
        ref_id = f"ICJ-CALL-{year}-{random.randint(10000, 99999)}"
        while AssistanceRequest.objects.filter(reference_id=ref_id).exists():
            ref_id = f"ICJ-CALL-{year}-{random.randint(10000, 99999)}"

        extra_fields = {
            "lead_type": lead_type,
            "service_name": service_name,
            "professional_name": target_professional_name,
            "professional_id": target_professional_id,
        }

        req = AssistanceRequest.objects.create(
            reference_id=ref_id,
            full_name=full_name,
            email=email,
            mobile=mobile,
            preferred_contact=data.get("preferred_contact", "Phone"),
            state_name=state_name,
            city_name=city_name,
            category=category,
            urgency=urgency,
            problem_description=problem_description,
            additional_fields=extra_fields,
        )

        lead_id = f"LEAD-{ref_id}"
        lead = Lead.objects.create(
            lead_id=lead_id,
            assistance_request=req,
            lead_type=lead_type,
            service_name=service_name,
            target_professional_name=target_professional_name,
            target_professional_id=target_professional_id,
            category=category,
            urgency=urgency,
            state_name=state_name,
            city_name=city_name,
            anonymized_summary=anonymized_summary,
            full_description=problem_description,
            tokens_required=tokens_required,
            status=initial_status,
            published_at=timezone.now() if initial_status == Lead.Status.PUBLISHED else None,
        )

        LeadActivity.objects.create(
            lead=lead,
            actor=request.user,
            action="LEAD_MANUALLY_CREATED",
            description=f"Lead {lead.lead_id} manually generated by admin {request.user.email} (Type: {lead_type}, Status: {initial_status}).",
        )

        return api_success(
            data=LeadDetailSerializer(lead, context={"request": request}).data,
            message="Lead generated successfully.",
            status_code=201,
        )


class AdminLeadDetailAPIView(AdminLeadsBaseView):
    def get(self, request, pk):
        lead = get_object_or_404(Lead.objects.select_related("assistance_request", "assigned_professional"), pk=pk)
        return api_success(data=LeadDetailSerializer(lead, context={"request": request, "is_admin": True}).data, message="Lead retrieved.")

    def patch(self, request, pk):
        lead = get_object_or_404(Lead, pk=pk)
        data = self.get_request_data(request)
        if "tokens_required" in data:
            lead.tokens_required = max(1, int(data["tokens_required"]))
        if "price_paise" in data:
            lead.price_paise = int(data["price_paise"])
        if "category" in data:
            lead.category = data["category"]
        if "urgency" in data:
            lead.urgency = data["urgency"]
        if "state_name" in data:
            lead.state_name = data["state_name"]
        if "city_name" in data:
            lead.city_name = data["city_name"]
        if "anonymized_summary" in data:
            lead.anonymized_summary = data["anonymized_summary"]
        if "full_description" in data:
            lead.full_description = data["full_description"]
        if "case_stage" in data:
            lead.case_stage = data["case_stage"]
        if "case_notes" in data:
            lead.case_notes = data["case_notes"]
        lead.save()
        return api_success(data=LeadDetailSerializer(lead, context={"request": request}).data, message="Lead updated.")


class AdminLeadReassignAPIView(AdminLeadsBaseView):
    """
    Reassign lead from one professional to another or back to marketplace.
    Preserves 100% of case notes, stage, and client documents.
    """
    def post(self, request, pk):
        data = self.get_request_data(request)
        new_professional_id = data.get("new_professional_id")
        refund_previous = data.get("refund_previous", True)
        handover_notes = data.get("handover_notes", "")
        return_to_marketplace = data.get("return_to_marketplace", False)

        try:
            lead = LeadService.reassign_lead(
                lead_id=pk,
                admin_user=request.user,
                new_professional_id=new_professional_id if new_professional_id and not return_to_marketplace else None,
                refund_previous=bool(refund_previous),
                handover_notes=handover_notes,
                return_to_marketplace=bool(return_to_marketplace),
            )
            return api_success(
                data=LeadDetailSerializer(lead, context={"request": request}).data,
                message=f"Lead {lead.lead_id} successfully reassigned. All case progress and history preserved.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class AdminLeadCaseProgressAPIView(AdminLeadsBaseView):
    def patch(self, request, pk):
        lead = get_object_or_404(Lead, pk=pk)
        data = self.get_request_data(request)
        from django.utils import timezone
        timestamp_str = timezone.now().strftime('%Y-%m-%d %I:%M %p')

        if "case_stage" in data:
            lead.case_stage = data["case_stage"]
        if "case_notes" in data and data["case_notes"].strip():
            new_note = data["case_notes"].strip()
            author = request.user.get_full_name() or request.user.email
            lead.case_notes = (lead.case_notes + f"\n[{author} - {timestamp_str}]: {new_note}").strip()
        lead.save()
        return api_success(data=LeadDetailSerializer(lead, context={"request": request}).data, message="Case progress updated.")



class AdminLeadPublishAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        data = self.get_request_data(request)
        notes = data.get("notes", "")
        try:
            lead = LeadService.publish_lead(lead_id=pk, admin_user=request.user, notes=notes)
            return api_success(
                data=LeadDetailSerializer(lead, context={"request": request}).data,
                message=f"Lead {lead.lead_id} successfully published to marketplace.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class AdminLeadUnpublishAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        data = self.get_request_data(request)
        notes = data.get("notes", "")
        try:
            lead = LeadService.unpublish_lead(lead_id=pk, admin_user=request.user, notes=notes)
            return api_success(
                data=LeadDetailSerializer(lead, context={"request": request}).data,
                message=f"Lead {lead.lead_id} unpublished from marketplace.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class AdminLeadPricingUpdateAPIView(AdminLeadsBaseView):
    def patch(self, request, pk):
        lead = get_object_or_404(Lead, pk=pk)
        if lead.status == Lead.Status.ACCEPTED:
            return api_error("Cannot alter pricing of an already accepted lead.", status_code=400)

        data = self.get_request_data(request)
        price_paise = data.get("price_paise")
        if price_paise is not None:
            lead.price_paise = int(price_paise)
        tax = data.get("tax_percentage")
        if tax is not None:
            lead.tax_percentage = tax
        lead.save()
        return api_success(data=LeadDetailSerializer(lead, context={"request": request}).data, message="Pricing updated.")


class AdminWalletsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = ProfessionalWallet.objects.select_related("professional").all()
        qs = apply_search(qs, params.get("search"), "professional__email", "professional__first_name")
        qs = apply_ordering(qs, params.get("ordering"), "-balance_paise")
        return paginated_success(request, qs, ProfessionalWalletSerializer, message="Wallets retrieved.")


class AdminWalletAdjustAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        wallet = get_object_or_404(ProfessionalWallet, pk=pk)
        data = self.get_request_data(request)
        tokens_delta = data.get("tokens_delta")
        amount_paise = data.get("amount_paise")
        is_credit = data.get("is_credit", True)
        reason = data.get("reason", "Admin token/wallet adjustment")

        # Handle token adjustment if provided
        if tokens_delta is not None and int(tokens_delta) != 0:
            delta = int(tokens_delta) if is_credit else -abs(int(tokens_delta))
            if delta < 0 and wallet.token_balance < abs(delta):
                return api_error(f"Cannot deduct {abs(delta)} tokens. Professional only has {wallet.token_balance} tokens.", status_code=400)
            wallet.token_balance += delta
            wallet.save(update_fields=["token_balance", "updated_at"])
            import uuid
            tx = WalletTransaction.objects.create(
                wallet=wallet,
                reference=f"TX-TOK-ADJ-{uuid.uuid4().hex[:8].upper()}",
                tx_type=WalletTransaction.TxType.ADJUSTMENT,
                amount_paise=0,
                balance_after_paise=wallet.balance_paise,
                tokens_delta=delta,
                token_balance_after=wallet.token_balance,
                description=f"Admin token adjustment: {reason}",
                created_by=request.user,
            )
            return api_success(
                data=WalletTransactionSerializer(tx).data,
                message=f"Wallet tokens adjusted by {delta:+d}. Current balance: {wallet.token_balance} tokens.",
            )

        if not amount_paise:
            amount_inr = data.get("amount_inr")
            if amount_inr:
                amount_paise = int(float(amount_inr) * 100)

        if not amount_paise or int(amount_paise) <= 0:
            return api_error("Valid positive adjustment amount or tokens required.", status_code=400)
        if not reason:
            return api_error("Audit reason is required for adjustments.", status_code=400)

        try:
            tx = WalletService.admin_adjust_balance(
                admin_user=request.user,
                target_user=wallet.professional,
                amount_paise=int(amount_paise),
                is_credit=bool(is_credit),
                reason=reason,
            )
            return api_success(
                data=WalletTransactionSerializer(tx).data,
                message=f"Wallet balance adjusted by ₹{tx.amount_paise / 100:.2f}.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)



class AdminWalletTransactionsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = WalletTransaction.objects.select_related("wallet__professional", "created_by").all()
        tx_type = request.query_params.get("type")
        if tx_type and tx_type != "all":
            qs = qs.filter(tx_type=tx_type)
        qs = apply_search(qs, params.get("search"), "reference", "wallet__professional__email", "description")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, WalletTransactionSerializer, message="Wallet transactions retrieved.")


class AdminLeadCreditPlansListCreateAPIView(AdminLeadsBaseView):
    def get(self, request):
        qs = LeadCreditPlan.objects.all().order_by("display_order", "price_paise")
        return api_success(data=LeadCreditPlanSerializer(qs, many=True).data, message="Plans retrieved.")

    def post(self, request):
        data = self.get_request_data(request)
        serializer = LeadCreditPlanSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return api_success(data=LeadCreditPlanSerializer(obj).data, message="Plan created.", status_code=201)


class AdminLeadCreditPlanDetailAPIView(AdminLeadsBaseView):
    def get(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk)
        return api_success(data=LeadCreditPlanSerializer(plan).data, message="Plan retrieved.")

    def patch(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk)
        data = self.get_request_data(request)
        serializer = LeadCreditPlanSerializer(plan, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return api_success(data=LeadCreditPlanSerializer(obj).data, message="Plan updated.")

    def delete(self, request, pk):
        plan = get_object_or_404(LeadCreditPlan, pk=pk)
        plan.is_active = False
        plan.save(update_fields=["is_active"])
        return api_success(message="Plan archived.")


class AdminPaymentsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = PaymentOrder.objects.select_related("professional", "lead", "plan").all()

        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)

        order_type = request.query_params.get("type")
        if order_type and order_type != "all":
            qs = qs.filter(order_type=order_type)

        qs = apply_search(qs, params.get("search"), "order_id", "gateway_order_id", "professional__email")
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, PaymentOrderSerializer, message="Payments retrieved.")


class AdminRefundsListAPIView(AdminLeadsBaseView):
    def get(self, request):
        params = list_params(request)
        qs = RefundRequest.objects.select_related("lead_acceptance__lead", "requested_by").all()
        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)
        qs = apply_ordering(qs, params.get("ordering"), "-created_at")
        return paginated_success(request, qs, RefundRequestSerializer, message="Refund requests retrieved.")


class AdminRefundProcessAPIView(AdminLeadsBaseView):
    def post(self, request, pk):
        data = self.get_request_data(request)
        approve = data.get("approve", True)
        notes = data.get("notes", "")
        try:
            refund = LeadService.process_refund(
                refund_request_id=pk,
                admin_user=request.user,
                approve=bool(approve),
                notes=notes,
            )
            return api_success(
                data=RefundRequestSerializer(refund).data,
                message=f"Refund request {'approved and processed' if approve else 'rejected'}.",
            )
        except Exception as exc:
            return api_error(str(exc), status_code=400)


class AdminCommercialSettingsAPIView(AdminLeadsBaseView):
    def get(self, request):
        settings_obj = LeadCommercialSettings.get_settings()
        return api_success(data=LeadCommercialSettingsSerializer(settings_obj).data, message="Commercial settings retrieved.")

    def patch(self, request):
        settings_obj = LeadCommercialSettings.get_settings()
        data = self.get_request_data(request)
        serializer = LeadCommercialSettingsSerializer(settings_obj, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(updated_by=request.user)

        LeadAuditLog.objects.create(
            entity_type="SETTINGS",
            entity_id=str(obj.id),
            action="COMMERCIAL_SETTINGS_UPDATED",
            actor=request.user,
            details=data,
        )
        return api_success(data=LeadCommercialSettingsSerializer(obj).data, message="Commercial settings updated.")


class AdminLeadReportsAPIView(AdminLeadsBaseView):
    def get(self, request):
        total_leads = Lead.objects.count()
        published_leads = Lead.objects.filter(status=Lead.Status.PUBLISHED).count()
        accepted_leads = Lead.objects.filter(status=Lead.Status.ACCEPTED).count()
        pending_review = Lead.objects.filter(status=Lead.Status.PENDING_REVIEW).count()

        # Revenue & Wallets
        total_revenue_paise = LeadAcceptance.objects.filter(status=LeadAcceptance.Status.ACTIVE).aggregate(
            total=Sum("price_paid_paise")
        )["total"] or 0

        total_wallet_balance_paise = ProfessionalWallet.objects.aggregate(
            total=Sum("balance_paise")
        )["total"] or 0

        total_wallet_added_paise = ProfessionalWallet.objects.aggregate(
            total=Sum("total_added_paise")
        )["total"] or 0

        conversion_rate = round((accepted_leads / total_leads * 100), 2) if total_leads > 0 else 0.0

        return api_success(
            data={
                "total_leads": total_leads,
                "published_leads": published_leads,
                "accepted_leads": accepted_leads,
                "pending_review": pending_review,
                "conversion_rate_percent": conversion_rate,
                "total_revenue_inr": round(total_revenue_paise / 100, 2),
                "total_wallet_balance_inr": round(total_wallet_balance_paise / 100, 2),
                "total_wallet_topups_inr": round(total_wallet_added_paise / 100, 2),
            },
            message="Lead marketplace reports retrieved.",
        )
