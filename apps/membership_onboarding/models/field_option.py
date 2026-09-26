import uuid

from django.db import models

from apps.membership_onboarding.models.step_field import MembershipStepField


class MembershipFieldOption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    step_field = models.ForeignKey(
        MembershipStepField,
        on_delete=models.CASCADE,
        related_name="options",
    )
    value = models.CharField(max_length=120)
    label = models.CharField(max_length=200)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "label")

    def __str__(self) -> str:
        return self.label
