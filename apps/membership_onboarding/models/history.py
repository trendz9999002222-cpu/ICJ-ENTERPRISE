import uuid

from django.conf import settings
from django.db import models

from apps.membership_onboarding.models.submission import MembershipApplication


class MembershipApplicationHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(
        MembershipApplication,
        on_delete=models.CASCADE,
        related_name="history",
    )
    action = models.CharField(max_length=64, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
