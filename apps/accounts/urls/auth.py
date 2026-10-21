from django.urls import path

from apps.accounts.views import (
    ChangePasswordView,
    CheckEmailAvailabilityView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    MeView,
    RefreshTokenView,
    ResetPasswordView,
    SendEmailVerificationLinkView,
    SetInitialPasswordView,
    UserProfessionalDocumentsView,
    VerifyEmailStatusView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("set-password/", SetInitialPasswordView.as_view(), name="auth-set-password"),
    path("refresh/", RefreshTokenView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("me/documents/", UserProfessionalDocumentsView.as_view(), name="auth-me-documents"),
    path("check-email/", CheckEmailAvailabilityView.as_view(), name="auth-check-email"),
    path("send-verification-email/", SendEmailVerificationLinkView.as_view(), name="auth-send-verification-email"),
    path("email-verification-status/", VerifyEmailStatusView.as_view(), name="auth-email-verification-status"),
]
