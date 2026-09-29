from rest_framework import permissions, status
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
    UpdateProfileSerializer,
    UserSerializer,
)

from apps.accounts.services.auth import (
    AuthServiceError,
    authenticate_user,
    change_password,
    request_password_reset,
    reset_password_with_token,
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
        access["role"] = "professional" if user.role == "client" else user.role
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

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        access["role"] = "professional" if user.role == "client" else user.role
        access["roles"] = user.get_all_roles()
        access["email"] = user.email
        access["first_name"] = user.first_name
        access["user_id"] = user.id
        access["password_change_required"] = False


        return api_success(
            message="Password changed successfully.",
            requires_password_change=False,
            access=str(access),
            refresh=str(refresh),
            user=UserSerializer(user).data,
        )


class MeView(APIView):
    permission_classes = [AllowDuringPasswordChange]
    skip_password_change_check = True

    def get(self, request):
        return api_success(data=UserSerializer(request.user).data, message="Profile retrieved.")

    def patch(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(data=UserSerializer(request.user).data, message="Profile updated successfully.")



class RefreshTokenView(TokenRefreshView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
