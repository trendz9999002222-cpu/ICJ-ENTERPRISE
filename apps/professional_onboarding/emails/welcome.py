"""
Welcome email sent to professional applicants upon successful registration submission.
"""
from __future__ import annotations

import json
import urllib.request

from django.conf import settings
from django.core.mail import send_mail


def send_professional_welcome_email(
    to_email: str,
    applicant_name: str,
    reference_id: str,
) -> None:
    """
    Send a welcome email to a newly registered professional applicant.
    Tries EmailJS first, then falls back to Django send_mail.
    """
    if not to_email or "@" not in to_email:
        return

    name = applicant_name.strip() or "Applicant"
    frontend_base = (
        settings.CORS_ALLOWED_ORIGINS[0]
        if getattr(settings, "CORS_ALLOWED_ORIGINS", [])
        else "http://localhost:3000"
    )
    dashboard_url = f"{frontend_base.rstrip('/')}/dashboard/professional/application"

    subject = "Welcome to ICJ — Professional Registration Received"
    plain_message = (
        f"Dear {name},\n\n"
        f"Thank you for submitting your professional registration with the "
        f"International Consortium of Jurists (ICJ).\n\n"
        f"Your application has been received and is currently under review.\n\n"
        f"Application Reference ID: {reference_id}\n\n"
        f"You can track the status of your application by logging into your dashboard:\n"
        f"{dashboard_url}\n\n"
        f"Our team will review your credentials and documents. You will be notified "
        f"by email once a decision has been made.\n\n"
        f"If you have any questions, please contact us.\n\n"
        f"Best regards,\n"
        f"International Consortium of Jurists (ICJ)\n"
        f"Justice • Integrity • Humanity"
    )

    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f2942 0%, #1e3a5f 100%); padding: 32px 32px 24px; text-align: center; border-bottom: 3px solid #b45309;">
        <h1 style="color: #ffffff; margin: 0 0 6px; font-size: 20px; font-weight: 900; letter-spacing: 0.5px;">INTERNATIONAL CONSORTIUM OF JURISTS</h1>
        <p style="color: #fbbf24; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1px;">Justice &bull; Integrity &bull; Humanity</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <h2 style="color: #0f172a; font-size: 22px; margin: 0 0 8px;">Welcome, {name}!</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          Thank you for submitting your professional registration with the International Consortium of Jurists (ICJ).
          Your application has been successfully received and is currently under review.
        </p>

        <!-- Reference Box -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 0 0 24px;">
          <p style="color: #166534; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Application Reference ID</p>
          <p style="color: #0f172a; font-size: 20px; font-weight: 900; margin: 0; letter-spacing: 1px;">{reference_id}</p>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Our team will carefully review your submitted credentials and documents. You will be notified by email once a decision has been made regarding your application.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="{dashboard_url}" style="background-color: #2563eb; color: #ffffff; padding: 13px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
            View My Application Status
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
          Or copy and paste this link in your browser:<br/>
          <a href="{dashboard_url}" style="color: #2563eb; word-break: break-all;">{dashboard_url}</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          &copy; {__import__('datetime').date.today().year} International Consortium of Jurists (ICJ). All rights reserved.
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin: 6px 0 0;">
          If you did not submit this registration, please contact us immediately.
        </p>
      </div>
    </div>
    """

    # 1. Try EmailJS first
    try:
        service_id = getattr(settings, "EMAILJS_SERVICE_ID", "")
        template_id = getattr(settings, "EMAILJS_TEMPLATE_ID", "")
        public_key = getattr(settings, "EMAILJS_PUBLIC_KEY", "")

        if service_id and template_id and public_key:
            payload = json.dumps({
                "service_id": service_id,
                "template_id": template_id,
                "user_id": public_key,
                "template_params": {
                    "to_email": to_email,
                    "email": to_email,
                    "to_name": name,
                    "name": name,
                    "subject": subject,
                    "message": plain_message,
                    "reference_id": reference_id,
                    "dashboard_url": dashboard_url,
                },
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://api.emailjs.com/api/v1.0/email/send",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    return  # EmailJS sent successfully
    except Exception:
        pass

    # 2. Fallback to Django send_mail
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=True,
        )
    except Exception:
        pass
