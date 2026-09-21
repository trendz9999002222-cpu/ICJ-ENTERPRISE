from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string


def send_password_reset_email(*, to_email: str, reset_link: str) -> None:
    subject = "ICJ — Password reset request"
    context = {
        "reset_link": reset_link,
        "support_email": settings.DEFAULT_FROM_EMAIL,
    }
    text_body = render_to_string("emails/password_reset.txt", context)
    html_body = render_to_string("emails/password_reset.html", context)
    send_mail(
        subject=subject,
        message=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_body,
        fail_silently=False,
    )
