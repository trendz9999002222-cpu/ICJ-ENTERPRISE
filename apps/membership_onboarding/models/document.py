import uuid

from django.db import models

from apps.membership_onboarding.models.type_and_form import MembershipForm


class MembershipDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(MembershipForm, on_delete=models.CASCADE, related_name="documents")
    name = models.CharField(max_length=200)
    document_key = models.SlugField(max_length=64)
    document_type = models.CharField(max_length=64, blank=True)
    is_required = models.BooleanField(default=False)
    allowed_extensions = models.JSONField(default=list, blank=True)
    max_file_size_mb = models.PositiveSmallIntegerField(default=5)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")
        constraints = [
            models.UniqueConstraint(fields=["form", "document_key"], name="membership_doc_form_key_unique"),
        ]
