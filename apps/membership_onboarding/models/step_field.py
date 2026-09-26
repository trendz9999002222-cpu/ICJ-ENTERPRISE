import uuid

from django.core.validators import RegexValidator
from django.db import models

from apps.membership_onboarding.models.step import MembershipStep

FIELD_KEY_VALIDATOR = RegexValidator(
    regex=r"^[a-z][a-z0-9_]*$",
    message="field_key must start with a letter and use lowercase letters, digits, and underscores only.",
)


class MembershipStepField(models.Model):
    class FieldType(models.TextChoices):
        TEXT = "text", "Text"
        TEXTAREA = "textarea", "Textarea"
        NUMBER = "number", "Number"
        EMAIL = "email", "Email"
        PHONE = "phone", "Phone"
        DATE = "date", "Date"
        SELECT = "select", "Select"
        SEARCHABLE_DROPDOWN = "searchable_dropdown", "Searchable dropdown"
        RADIO = "radio", "Radio"
        CHECKBOX = "checkbox", "Checkbox"
        MULTI_SELECT = "multi_select", "Multi select"
        FILE = "file", "File"
        IMAGE = "image", "Image"
        COUNTRY = "country", "Country"
        STATE = "state", "State"
        DISTRICT = "district", "District"
        CITY = "city", "City"
        PINCODE = "pincode", "PIN code"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    step = models.ForeignKey(MembershipStep, on_delete=models.CASCADE, related_name="fields")
    name = models.CharField(max_length=120)
    field_key = models.CharField(max_length=64, validators=[FIELD_KEY_VALIDATOR])
    field_type = models.CharField(max_length=24, choices=FieldType.choices, db_index=True)
    label = models.CharField(max_length=200)
    placeholder = models.CharField(max_length=255, blank=True)
    help_text = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    default_value = models.CharField(max_length=500, blank=True)
    validation_config = models.JSONField(default=dict, blank=True)
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")
        constraints = [
            models.UniqueConstraint(fields=["step", "field_key"], name="membership_step_field_key_unique"),
        ]

    def __str__(self) -> str:
        return f"{self.step.slug}.{self.field_key}"
