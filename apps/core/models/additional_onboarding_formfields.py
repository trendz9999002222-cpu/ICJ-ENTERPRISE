import uuid
from django.db import models

class AdditionalOnboardingFormfields(models.Model):
    """
    Defines the onboarding forms available in the system (e.g., PROFESSIONAL, MEMBERSHIP).
    """
    class FormCode(models.TextChoices):
        PROFESSIONAL = "PROFESSIONAL", "Professional Onboarding"
        MEMBERSHIP = "MEMBERSHIP", "Trustee Membership Onboarding"
        SEEKER_ASSISTANT = "SEEKER_ASSISTANT", "Client Seeker Assistant"
        HONORABLE_ADVISORY = "HONORABLE_ADVISORY", "Honorable Advisory Onboarding"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form_code = models.CharField(
        max_length=64,
        choices=FormCode.choices,
        unique=True,
        db_index=True,
        help_text="Unique stable identifier for the form.",
    )
    form_name = models.CharField(max_length=200, help_text="Human-readable name for the form.")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    version = models.PositiveIntegerField(default=1, help_text="Form version, incremented on major changes.")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("form_name",)

    def __str__(self) -> str:
        return f"{self.form_name} ({self.form_code})"
