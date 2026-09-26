import uuid

from django.conf import settings
from django.db import models

from apps.membership_onboarding.models.type_and_form import MembershipForm


class MembershipStep(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(
        MembershipForm,
        on_delete=models.CASCADE,
        related_name="steps",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=80)
    title = models.CharField(max_length=200, help_text="Public step title shown in the wizard.")
    subtitle = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    is_required = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    class Meta:
        ordering = ("display_order", "name")
        constraints = [
            models.UniqueConstraint(fields=["form", "slug"], name="membership_step_form_slug_unique"),
        ]

    def __str__(self) -> str:
        return self.title
