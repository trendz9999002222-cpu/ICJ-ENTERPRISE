from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_error, api_success
from apps.core.models import Notification
from apps.core.serializers import NotificationSerializer


class NotificationListAPIView(APIView):
    """
    List notifications relevant to the authenticated user.
    - Administrators receive user-specific, admin-broadcast, and global alerts.
    - Regular members / candidates receive user-specific and global alerts.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        is_admin = getattr(user, "is_admin_role", False) or user.is_staff or user.is_superuser

        if is_admin:
            query = Q(recipient=user) | Q(scope=Notification.Scope.ADMIN) | Q(scope=Notification.Scope.GLOBAL)
        else:
            query = Q(recipient=user) | Q(scope=Notification.Scope.GLOBAL)

        qs = Notification.objects.filter(query)

        # Filters
        unread_only = request.query_params.get("unread")
        if unread_only and unread_only.lower() in ("true", "1"):
            qs = qs.filter(is_read=False)

        scope_param = request.query_params.get("scope")
        if scope_param:
            qs = qs.filter(scope=scope_param)

        type_param = request.query_params.get("type")
        if type_param:
            qs = qs.filter(notification_type=type_param)

        unread_count = Notification.objects.filter(query, is_read=False).count()

        # Limit to recent 50 for performance
        notifications = qs[:50]
        serializer = NotificationSerializer(notifications, many=True)

        return api_success(
            data={
                "notifications": serializer.data,
                "unread_count": unread_count,
                "total_count": qs.count(),
            },
            message="Notifications retrieved successfully.",
        )

    def post(self, request):
        user = request.user
        is_admin = getattr(user, "is_admin_role", False) or user.is_staff or user.is_superuser
        if not is_admin:
            return api_error(message="Only administrators can dispatch broadcasts.", status_code=status.HTTP_403_FORBIDDEN)

        title = (request.data.get("title") or "").strip()
        message = (request.data.get("message") or "").strip()
        scope = (request.data.get("scope") or "global").strip()
        notification_type = (request.data.get("notification_type") or "info").strip()
        link = (request.data.get("link") or "").strip()

        if not title or not message:
            return api_error(message="Title and message are required.", status_code=status.HTTP_400_BAD_REQUEST)

        notif = Notification.objects.create(
            recipient=None,
            scope=scope,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link,
            is_read=False,
        )
        return api_success(
            data=NotificationSerializer(notif).data,
            message="Broadcast notification dispatched successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class NotificationUnreadCountAPIView(APIView):
    """Quick lightweight polling endpoint for notification bell badge."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        is_admin = getattr(user, "is_admin_role", False) or user.is_staff or user.is_superuser

        if is_admin:
            query = Q(recipient=user) | Q(scope=Notification.Scope.ADMIN) | Q(scope=Notification.Scope.GLOBAL)
        else:
            query = Q(recipient=user) | Q(scope=Notification.Scope.GLOBAL)

        unread_count = Notification.objects.filter(query, is_read=False).count()
        return api_success(
            data={"unread_count": unread_count},
            message="Unread notification count retrieved.",
        )


class NotificationMarkReadAPIView(APIView):
    """Mark a single notification as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            return api_error(message="Notification not found.", status_code=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_admin = getattr(user, "is_admin_role", False) or user.is_staff or user.is_superuser

        # Security check: can only mark if recipient matches or is global/admin
        if notif.recipient and notif.recipient != user and not is_admin:
            return api_error(message="Permission denied.", status_code=status.HTTP_403_FORBIDDEN)

        notif.is_read = True
        notif.read_at = timezone.now()
        notif.save(update_fields=["is_read", "read_at"])

        return api_success(
            data=NotificationSerializer(notif).data,
            message="Notification marked as read.",
        )


class NotificationMarkAllReadAPIView(APIView):
    """Mark all unread notifications for the user as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        is_admin = getattr(user, "is_admin_role", False) or user.is_staff or user.is_superuser

        if is_admin:
            query = Q(recipient=user) | Q(scope=Notification.Scope.ADMIN) | Q(scope=Notification.Scope.GLOBAL)
        else:
            query = Q(recipient=user) | Q(scope=Notification.Scope.GLOBAL)

        updated_count = Notification.objects.filter(query, is_read=False).update(
            is_read=True,
            read_at=timezone.now(),
        )

        return api_success(
            data={"updated_count": updated_count},
            message=f"{updated_count} notifications marked as read.",
        )


class NotificationDeleteAPIView(APIView):
    """Delete a notification."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            return api_error(message="Notification not found.", status_code=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_admin = getattr(user, "is_admin_role", False) or user.is_staff or user.is_superuser

        if notif.recipient and notif.recipient != user and not is_admin:
            return api_error(message="Permission denied.", status_code=status.HTTP_403_FORBIDDEN)

        notif.delete()
        return api_success(message="Notification dismissed successfully.")
