import uuid
from django.core.validators import RegexValidator
from django.db import models

class CommonField(models.Model):
    """
    Central Master Table for reusable onboarding fields.
    Acts as the single source of truth across Professional, Membership, and Seeker flows.
    """
    class FieldType(models.TextChoices):
        TEXT = "text", "Text"
        TEXTAREA = "textarea", "Textarea"
        NUMBER = "number", "Number"
        EMAIL = "email", "Email"
        PHONE = "phone", "Phone"
        DATE = "date", "Date"
        SELECT = "select", "Select"
        RADIO = "radio", "Radio"
        CHECKBOX = "checkbox", "Checkbox"
        FILE = "file", "File"
        COUNTRY = "country", "Country"
        STATE = "state", "State"
        CITY = "city", "City"
        PINCODE = "pincode", "PIN Code"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120, help_text="Human-readable name for admin.")
    field_key = models.CharField(
        max_length=64,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^[a-z][a-z0-9_]*$",
                message="field_key must start with a letter and use lowercase letters, digits, and underscores only.",
            ),
        ],
        help_text="Stable API key, e.g. full_name, email, mobile_number.",
    )
    field_type = models.CharField(
        max_length=16,
        choices=FieldType.choices,
        db_index=True,
    )
    label = models.CharField(max_length=200, help_text="Default label shown on the onboarding form.")
    placeholder = models.CharField(max_length=255, blank=True)
    help_text = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    default_value = models.CharField(max_length=500, blank=True)
    validation_rules = models.JSONField(default=dict, blank=True, help_text="JSON configuration for validation.")
    options = models.JSONField(default=list, blank=True, help_text="JSON configuration for dropdown/radio options.")
    
    is_system_field = models.BooleanField(default=False, help_text="If True, this field cannot be deleted as it is required by the core system (e.g. email).")
    is_active = models.BooleanField(default=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        indexes = [
            models.Index(fields=["is_active"]),
            models.Index(fields=["field_type", "is_active"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.field_key})"
