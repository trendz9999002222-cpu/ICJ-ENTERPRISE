import logging
from typing import Optional, Union
from django.contrib.auth import get_user_model
from apps.core.models import Notification

logger = logging.getLogger(__name__)
User = get_user_model()


def send_system_notification(
    title: str,
    message: str,
    notification_type: str = Notification.NotificationType.INFO,
    scope: str = Notification.Scope.USER,
    recipient: Optional[Union[object, int, str]] = None,
    link: str = "",
) -> Optional[Notification]:
    """
    Enterprise notification dispatcher.
    - If scope is 'user', recipient should be a User instance or user_id.
    - If scope is 'admin', notification is visible to administrator staff.
    - If scope is 'global', notification is broadcast across all authenticated users.
    """
    try:
        user_obj = None
        if recipient is not None:
            if isinstance(recipient, User):
                user_obj = recipient
            elif isinstance(recipient, (int, str)):
                try:
                    user_obj = User.objects.filter(pk=recipient).first()
                except Exception:
                    user_obj = None

        notif = Notification.objects.create(
            recipient=user_obj,
            scope=scope,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link or "",
            is_read=False,
        )
        return notif
    except Exception as exc:
        logger.error(f"Failed to create system notification: {exc}", exc_info=True)
        return None
