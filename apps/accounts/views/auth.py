import re

from rest_framework import permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from common.responses import api_error, api_success

from apps.accounts.permissions import AllowDuringPasswordChange, PasswordChangeCompleted
from apps.accounts.serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    ResetPasswordSerializer,
    SetInitialPasswordSerializer,
    UpdateProfileSerializer,
    UserSerializer,
)

from apps.accounts.services.auth import (
    AuthServiceError,
    authenticate_user,
    change_password,
    request_password_reset,
    reset_password_with_token,
    set_initial_password,
)
from apps.accounts.throttles import ForgotPasswordRateThrottle, LoginRateThrottle


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = authenticate_user(
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
                request=request,
            )
        except AuthServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        # Embed essential claims into token
        access = refresh.access_token
        from apps.accounts.role_utils import normalize_platform_role

        access["role"] = normalize_platform_role(user.role) or "member"
        access["roles"] = user.get_all_roles()
        access["email"] = user.email
        access["first_name"] = user.first_name
        access["user_id"] = user.id
        access["password_change_required"] = user.password_change_required



        message = (
            "Login successful. Password change required."
            if user.password_change_required
            else "Login successful."
        )
        return api_success(
            message=message,
            requires_password_change=user.password_change_required,
            access=str(access),
            refresh=str(refresh),
            user=UserSerializer(user).data,
            status_code=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [AllowDuringPasswordChange]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except Exception:
            return api_error("Invalid refresh token.", status_code=status.HTTP_400_BAD_REQUEST)
        return api_success(message="Logged out successfully.")


class ForgotPasswordView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ForgotPasswordRateThrottle]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = request_password_reset(serializer.validated_data["email"], request=request)
        return api_success(message=message)


class ResetPasswordView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            reset_password_with_token(
                raw_token=serializer.validated_data["token"],
                new_password=serializer.validated_data["new_password"],
                confirm_password=serializer.validated_data["confirm_password"],
            )
        except AuthServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)
        return api_success(message="Password has been reset successfully.")


def _issue_auth_tokens_response(user, message: str):
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    from apps.accounts.role_utils import normalize_platform_role

    access["role"] = normalize_platform_role(user.role) or "member"
    access["roles"] = user.get_all_roles()
    access["email"] = user.email
    access["first_name"] = user.first_name
    access["user_id"] = user.id
    access["password_change_required"] = user.password_change_required

    return api_success(
        message=message,
        requires_password_change=user.password_change_required,
        access=str(access),
        refresh=str(refresh),
        user=UserSerializer(user).data,
    )


class SetInitialPasswordView(APIView):
    permission_classes = [AllowDuringPasswordChange]

    def post(self, request):
        serializer = SetInitialPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = set_initial_password(
                user=request.user,
                new_password=serializer.validated_data["new_password"],
                confirm_password=serializer.validated_data["confirm_password"],
            )
        except AuthServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)

        return _issue_auth_tokens_response(user, "Password set successfully. You can now use the dashboard.")


class ChangePasswordView(APIView):
    permission_classes = [AllowDuringPasswordChange]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = change_password(
                user=request.user,
                current_password=serializer.validated_data["current_password"],
                new_password=serializer.validated_data["new_password"],
                confirm_password=serializer.validated_data["confirm_password"],
            )
        except AuthServiceError as exc:
            return api_error(exc.message, exc.errors, status.HTTP_400_BAD_REQUEST)

        return _issue_auth_tokens_response(user, "Password changed successfully.")


class MeView(APIView):
    permission_classes = [AllowDuringPasswordChange]
    skip_password_change_check = True
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        return api_success(
            data=UserSerializer(request.user, context={"request": request}).data,
            message="Profile retrieved.",
        )

    def patch(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Handle updating membership form fields if provided
        membership_field_values = request.data.get("membership_field_values")
        if membership_field_values and isinstance(membership_field_values, dict):
            app = request.user.membership_applications.order_by("-created_at").first()
            if app:
                # Merge new values with existing values
                current_values = dict(app.field_values or {})
                current_values.update(membership_field_values)
                app.field_values = current_values
                app.save(update_fields=["field_values"])

        request.user.refresh_from_db()
        return api_success(
            data=UserSerializer(request.user, context={"request": request}).data,
            message="Profile updated successfully.",
        )



class RefreshTokenView(TokenRefreshView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]


class SendEmailVerificationLinkView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        if not email or "@" not in email:
            return api_error("Please provide a valid email address.", status_code=status.HTTP_400_BAD_REQUEST)

        # Check duplicate before sending any email or consuming quota
        from apps.accounts.services.identity_checks import check_duplicate_email
        user = request.user if getattr(request.user, "is_authenticated", False) else None
        duplicate_err = check_duplicate_email(email, current_user=user, check_applications=True)
        if duplicate_err:
            return api_error(
                message=duplicate_err,
                errors={"email": [duplicate_err]},
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        name = request.data.get("name", "").strip() or "Applicant"
        frontend_url = request.data.get("frontend_url", "").strip()
        if not frontend_url:
            frontend_url = settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else "http://localhost:3000"

        import base64
        import json
        import time
        from django.core.mail import send_mail

        token_payload = json.dumps({"email": email, "timestamp": int(time.time() * 1000)})
        token = base64.b64encode(token_payload.encode()).decode()

        verify_url = f"{frontend_url.rstrip('/')}/join-membership?verify_email={email}&verified=1&token={token}"

        subject = "Verify Your Email - International Consortium of Jurists (ICJ)"
        message = (
            f"Dear {name},\n\n"
            f"Thank you for initiating your application with the International Consortium of Jurists (ICJ).\n\n"
            f"Please click the link below to verify your email address:\n\n"
            f"{verify_url}\n\n"
            f"If you did not request this verification, please disregard this email.\n\n"
            f"Best regards,\n"
            f"International Consortium of Jurists (ICJ)"
        )

        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">International Consortium of Jurists (ICJ)</h2>
            <p>Dear {name},</p>
            <p>Thank you for initiating your membership application. Please click the button below to verify your email address and continue your registration:</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{verify_url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #64748b; font-size: 13px;">Or copy and paste this link in your browser:<br/><a href="{verify_url}" style="color: #2563eb; word-break: break-all;">{verify_url}</a></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;"/>
            <p style="color: #94a3b8; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
        """

        # 1. Dispatch via EmailJS API using configured keys
        emailjs_sent = False
        try:
            import urllib.request
            service_id = getattr(settings, "EMAILJS_SERVICE_ID", "service_rypannl")
            template_id = getattr(settings, "EMAILJS_TEMPLATE_ID", "template_pmntrjf")
            public_key = getattr(settings, "EMAILJS_PUBLIC_KEY", "_afNcmKvmFJoVdlI9")

            payload = json.dumps({
                "service_id": service_id,
                "template_id": template_id,
                "user_id": public_key,
                "template_params": {
                    "to_email": email,
                    "email": email,
                    "user_email": email,
                    "recipient": email,
                    "to_name": name,
                    "name": name,
                    "title": "Welcome to ICJ - Verify Your Email",
                    "subject": "Verify Your Email - International Consortium of Jurists (ICJ)",
                    "message": message,
                    "verify_url": verify_url,
                    "verify_link": verify_url,
                    "link": verify_url,
                },
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://api.emailjs.com/api/v1.0/email/send",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    emailjs_sent = True
        except Exception:
            pass

        # 2. Also dispatch via Django send_mail
        django_sent = False
        try:
            send_mail(
                subject=subject,
                message=message,
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            django_sent = True
        except Exception:
            pass

        return api_success(
            message=f"Verification email dispatched to {email}",
            data={
                "verify_url": verify_url,
                "email": email,
                "emailjs_sent": emailjs_sent,
                "django_sent": django_sent,
            },
        )


VERIFIED_EMAILS_CACHE = set()


class VerifyEmailStatusView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return api_error("Email is required.", status_code=status.HTTP_400_BAD_REQUEST)
        VERIFIED_EMAILS_CACHE.add(email)
        return api_success(message=f"Email {email} marked as verified.", data={"email": email, "verified": True})

    def get(self, request):
        email = request.query_params.get("email", "").strip().lower()
        if not email:
            return api_error("Email is required.", status_code=status.HTTP_400_BAD_REQUEST)
        is_verified = email in VERIFIED_EMAILS_CACHE
        return api_success(data={"email": email, "verified": is_verified})


class CheckEmailAvailabilityView(APIView):
    """
    Public endpoint to check if an email is available for registration
    BEFORE sending OTPs or consuming EmailJS token quotas.
    Returns 200 with available=True if unique, or 400 with duplicate message if already taken.
    """
    permission_classes = [permissions.AllowAny]

    def _check(self, request, email_param: str | None):
        email = (email_param or "").strip().lower()
        if not email or "@" not in email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            return api_error(
                message="Please provide a valid email address.",
                errors={"email": ["Please provide a valid email address."]},
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        from apps.accounts.services.identity_checks import check_duplicate_email
        user = request.user if getattr(request.user, "is_authenticated", False) else None
        duplicate_err = check_duplicate_email(email, current_user=user, check_applications=True)

        if duplicate_err:
            return api_error(
                message=duplicate_err,
                errors={"email": [duplicate_err]},
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return api_success(
            message="Email is available.",
            data={"available": True, "email": email},
        )

    def get(self, request):
        email = request.query_params.get("email", "")
        return self._check(request, email)

    def post(self, request):
        email = request.data.get("email", "") if isinstance(request.data, dict) else ""
        return self._check(request, email)


class UserProfessionalDocumentsView(APIView):
    """
    Allows a professional to view and update/replace their submitted verification documents.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        user = request.user
        subs = user.professional_registration_submissions.all().select_related("profession").prefetch_related("files")
        docs = []
        for s in subs:
            prof_name = s.profession.name if s.profession else "Professional"
            for f in s.files.all():
                url = request.build_absolute_uri(f.file.url) if f.file else ""
                docs.append({
                    "id": str(f.id),
                    "submission_id": str(s.id),
                    "document_key": f.document_key,
                    "original_name": f.original_name,
                    "content_type": f.content_type,
                    "size_bytes": f.size_bytes,
                    "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
                    "url": url,
                    "file_url": url,
                    "profession_name": prof_name,
                })
        return api_success(data={"documents": docs}, message="Documents retrieved.")

    def post(self, request):
        import os
        from apps.professional_onboarding.models import ProfessionalRegistrationSubmissionFile

        user = request.user
        file = request.FILES.get("file")
        if not file:
            return api_error("No file provided.", status_code=status.HTTP_400_BAD_REQUEST)

        file_id = request.data.get("file_id")
        document_key = (request.data.get("document_key") or "").strip()

        # Size check (max 5MB)
        if file.size > 5 * 1024 * 1024:
            return api_error("File size cannot exceed 5 MB.", status_code=status.HTTP_400_BAD_REQUEST)

        # Allowed types
        ext = os.path.splitext(file.name or "")[1].lower().lstrip(".")
        allowed_exts = {"pdf", "jpg", "jpeg", "png", "webp", "doc", "docx"}
        if ext not in allowed_exts:
            return api_error("Allowed file types are PDF, JPG, PNG, WebP, DOC, DOCX.", status_code=status.HTTP_400_BAD_REQUEST)

        sub_file = None
        if file_id:
            sub_file = ProfessionalRegistrationSubmissionFile.objects.filter(
                id=file_id,
                submission__user=user,
            ).first()

        if not sub_file and document_key:
            # Look for existing file with this document_key in user's submissions
            sub_file = ProfessionalRegistrationSubmissionFile.objects.filter(
                submission__user=user,
                document_key=document_key,
            ).first()

        if not sub_file:
            # Find user's latest submission to attach this file to
            latest_sub = user.professional_registration_submissions.order_by("-created_at").first()
            if not latest_sub:
                return api_error("No professional registration found for this user.", status_code=status.HTTP_404_NOT_FOUND)
            if not document_key:
                document_key = "document"
            sub_file = ProfessionalRegistrationSubmissionFile(
                submission=latest_sub,
                document_key=document_key,
            )

        sub_file.file = file
        sub_file.original_name = os.path.basename(file.name or "upload")
        sub_file.content_type = file.content_type or ""
        sub_file.size_bytes = file.size
        sub_file.save()

        # If this is a photo, also update user's profile picture
        if sub_file.document_key in ("photo", "profile_photo", "passport_photo", "avatar"):
            user.profile_picture = file
            user.save(update_fields=["profile_picture"])

        file_url = request.build_absolute_uri(sub_file.file.url) if sub_file.file else ""
        return api_success(
            data={
                "id": str(sub_file.id),
                "document_key": sub_file.document_key,
                "original_name": sub_file.original_name,
                "content_type": sub_file.content_type,
                "size_bytes": sub_file.size_bytes,
                "url": file_url,
                "file_url": file_url,
                "profile_picture_url": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
            },
            message="Document updated successfully.",
        )


