import json

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.responses import api_error, api_success

from apps.membership_onboarding.models import MembershipApplication, MembershipType
from apps.membership_onboarding.serializers.public import (
    PublicMembershipConfigurationSerializer,
    PublicMembershipTypeSerializer,
)
from apps.membership_onboarding.services.public_config import (
    build_active_configuration,
    build_type_configuration,
    ensure_default_membership_type,
    get_active_membership_form,
)
from apps.accounts.services.jwt_issue import issue_jwt_pair_for_user
from apps.accounts.serializers import UserSerializer
from apps.membership_onboarding.services.submission import MembershipApplicationService, parse_field_values_json
from apps.professional_onboarding.services.crud import ServiceError


class PublicMembershipTypeListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = MembershipType.objects.filter(is_active=True).order_by("display_order", "name")
        return api_success(
            data={"results": PublicMembershipTypeSerializer(qs, many=True).data},
            message="Membership types retrieved.",
        )


class PublicMembershipConfigurationAPIView(APIView):
    """Active membership form (no type selection required)."""

    permission_classes = [AllowAny]

    def get(self, request):
        config = build_active_configuration()
        payload = {
            "form": config["form"],
            "steps": config["steps"],
            "documents": config["documents"],
        }
        return api_success(
            data=PublicMembershipConfigurationSerializer(payload).data,
            message="Membership configuration retrieved.",
        )


class PublicMembershipTypeConfigurationAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, membership_type_id):
        config = build_type_configuration(membership_type_id)
        if not config["membership_type"].is_active:
            return api_error("Membership type is not active.", status_code=status.HTTP_404_NOT_FOUND)
        payload = {
            "membership_type": config["membership_type"],
            "form": config["form"],
            "steps": config["steps"],
            "documents": config["documents"],
        }
        return api_success(
            data=PublicMembershipConfigurationSerializer(payload).data,
            message="Membership configuration retrieved.",
        )


class PublicMembershipRegisterAPIView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        membership_type_id = request.data.get("membership_type_id")
        if not membership_type_id:
            active_form = get_active_membership_form()
            if active_form:
                membership_type_id = str(active_form.membership_type_id)
            else:
                membership_type_id = str(ensure_default_membership_type().id)

        try:
            field_values = parse_field_values_json(request.data.get("field_values") or "{}")
        except (json.JSONDecodeError, ValueError):
            return api_error("Invalid JSON in field_values.", status_code=status.HTTP_400_BAD_REQUEST)

        declaration_accepted = str(request.data.get("declaration_accepted", "")).lower() in ("1", "true", "yes")

        uploaded_files = {}
        for key, file in request.FILES.items():
            if key.startswith("document__") or key.startswith("file__"):
                uploaded_files[key.split("__", 1)[1]] = file

        user = request.user if getattr(request.user, "is_authenticated", False) else None
        idempotency_key = (
            request.headers.get("Idempotency-Key")
            or request.headers.get("HTTP_IDEMPOTENCY_KEY")
            or request.data.get("idempotency_key")
        )

        raw_payment_id = str(request.data.get("payment_id") or request.data.get("membership_payment_id") or "").strip()
        membership_payment_id = None
        if raw_payment_id and raw_payment_id.lower() not in ("null", "undefined", "none"):
            try:
                import uuid
                uuid.UUID(raw_payment_id)
                membership_payment_id = raw_payment_id
            except (ValueError, TypeError):
                membership_payment_id = None

        try:
            application, _, is_new_user = MembershipApplicationService.submit(
                membership_type_id=str(membership_type_id),
                field_values=field_values,
                uploaded_files=uploaded_files,
                declaration_accepted=declaration_accepted,
                user=user,
                idempotency_key=idempotency_key,
                membership_payment_id=membership_payment_id,
            )
        except ServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            import traceback
            traceback.print_exc()
            return api_error(f"Submission failed: {str(exc)}", status_code=status.HTTP_400_BAD_REQUEST)

        payload = {
            "reference_id": application.reference_id,
            "status": application.status,
            "submitted_at": application.submitted_at.isoformat() if application.submitted_at else None,
        }
        extra: dict = {}
        if application.user_id:
            user = application.user
            payload["user"] = UserSerializer(user).data
            payload["user"]["is_new_user"] = is_new_user
            access, refresh, pwd_change = issue_jwt_pair_for_user(user)
            extra["access"] = access
            extra["refresh"] = refresh
            extra["requires_password_change"] = pwd_change

        return api_success(
            data=payload,
            message="Membership application submitted successfully. Admin approval is required before full member access.",
            status_code=status.HTTP_201_CREATED,
            **extra,
        )


class PublicMembershipApplicationStatusAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, reference_id):
        app = get_object_or_404(MembershipApplication, reference_id=reference_id)
        return api_success(
            data={
                "reference_id": app.reference_id,
                "status": app.status,
                "membership_type": app.membership_type.name if app.membership_type_id else None,
                "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None,
            },
            message="Application status retrieved.",
        )


class PublicMembershipValidateIdentityAPIView(APIView):
    """
    Validates if an email address or mobile/phone number is already registered
    with a User, Person, or existing active application before allowing the applicant
    to advance to payment or further steps.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data or {}
        email = (
            data.get("email")
            or data.get("email_address")
            or data.get("email_id")
            or ""
        ).strip().lower()

        phone = (
            data.get("phone")
            or data.get("mobile")
            or data.get("mobile_number")
            or data.get("phone_number")
            or ""
        ).strip()

        errors: dict[str, list[str]] = {}
        user = request.user if getattr(request.user, "is_authenticated", False) else None

        from apps.accounts.services.identity_checks import check_duplicate_email, check_duplicate_phone

        if email:
            email_err = check_duplicate_email(email, current_user=user, check_applications=True)
            if email_err:
                errors["email"] = [email_err]
                errors["email_address"] = [email_err]

        if phone:
            phone_err = check_duplicate_phone(phone, current_user=user, check_applications=True)
            if phone_err:
                errors["mobile_number"] = [phone_err]
                errors["mobile"] = [phone_err]
                errors["phone"] = [phone_err]
                errors["phone_number"] = [phone_err]

        if errors:
            return api_error(
                message="Validation failed.",
                errors=errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return api_success(
            data={"valid": True},
            message="Identity verified successfully.",
        )

