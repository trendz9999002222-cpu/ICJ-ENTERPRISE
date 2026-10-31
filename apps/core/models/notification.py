import uuid
from django.conf import settings
from django.db import models


class Notification(models.Model):
    """
    Enterprise Notification Model for ICJ Platform.
    Supports user-specific alerts, administrator broadcasts, and global announcements.
    """
    class Scope(models.TextChoices):
        USER = "user", "User Specific"
        ADMIN = "admin", "Admin Staff"
        GLOBAL = "global", "Global Broadcast"

    class NotificationType(models.TextChoices):
        INFO = "info", "Information"
        SUCCESS = "success", "Success"
        WARNING = "warning", "Warning"
        ERROR = "error", "Urgent / Action Required"
        APPLICATION = "application", "Empanelment Application"
        ASSISTANCE = "assistance", "Legal Assistance"
        MEMBERSHIP = "membership", "Membership"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
        help_text="Target user. Null when notification is broadcast to all administrators or globally.",
    )
    scope = models.CharField(
        max_length=20,
        choices=Scope.choices,
        default=Scope.USER,
        db_index=True,
    )
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.INFO,
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=500, blank=True, default="")
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["scope", "is_read"]),
            models.Index(fields=["recipient", "is_read"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"[{self.scope.upper()}] {self.title}"
