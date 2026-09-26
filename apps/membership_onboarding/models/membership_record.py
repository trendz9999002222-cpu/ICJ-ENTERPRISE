import uuid

from django.conf import settings
from django.db import models

from apps.membership_onboarding.models.type_and_form import MembershipForm, MembershipType
from apps.person.models import Person


class Membership(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        EXPIRED = "expired", "Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    membership_id = models.CharField(max_length=32, unique=True, db_index=True)
    person = models.ForeignKey(Person, on_delete=models.PROTECT, related_name="memberships")
    membership_type = models.ForeignKey(MembershipType, on_delete=models.PROTECT, related_name="memberships")
    application = models.OneToOneField(
        "membership_onboarding.MembershipApplication",
        on_delete=models.PROTECT,
        related_name="membership_record",
    )
    form = models.ForeignKey(MembershipForm, on_delete=models.PROTECT, related_name="memberships")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
