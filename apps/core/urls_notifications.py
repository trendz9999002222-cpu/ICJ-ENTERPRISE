from django.urls import path
from apps.core.views_notification import (
    NotificationListAPIView,
    NotificationUnreadCountAPIView,
    NotificationMarkReadAPIView,
    NotificationMarkAllReadAPIView,
    NotificationDeleteAPIView,
)

urlpatterns = [
    path("", NotificationListAPIView.as_view(), name="notification-list"),
    path("unread-count/", NotificationUnreadCountAPIView.as_view(), name="notification-unread-count"),
    path("<uuid:pk>/read/", NotificationMarkReadAPIView.as_view(), name="notification-mark-read"),
    path("mark-all-read/", NotificationMarkAllReadAPIView.as_view(), name="notification-mark-all-read"),
    path("<uuid:pk>/delete/", NotificationDeleteAPIView.as_view(), name="notification-delete"),
]
