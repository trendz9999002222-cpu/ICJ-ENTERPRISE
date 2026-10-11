import uuid
from django.db import models

from .common_field import CommonField
from .additional_onboarding_formfields import AdditionalOnboardingFormfields

class FormFieldConfig(models.Model):
    """
    Mapping table that links a CommonField (or later, a ProfessionField) to a specific AdditionalOnboardingFormfields.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(
        AdditionalOnboardingFormfields,
        on_delete=models.CASCADE,
        related_name="field_configs",
    )
    common_field = models.ForeignKey(
        CommonField,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="form_configs",
    )
    # If the project requires mapping profession-specific fields globally here, we can add a professional_field FK.
    # professional_field = models.ForeignKey("professional_onboarding.ProfessionField", on_delete=models.CASCADE, null=True, blank=True)
    
    section_name = models.CharField(max_length=120, default="General", help_text="Groups fields visually in the UI.")
    display_order = models.PositiveIntegerField(default=0)
    
    is_visible = models.BooleanField(default=True)
    is_required = models.BooleanField(default=False)
    
    # Overrides for the specific form
    label_override = models.CharField(max_length=200, blank=True, help_text="Overrides the master label if provided.")
    placeholder_override = models.CharField(max_length=255, blank=True)
    help_text_override = models.CharField(max_length=500, blank=True)
    validation_overrides = models.JSONField(default=dict, blank=True, help_text="Overrides validation rules for this form.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("form", "section_name", "display_order")
        constraints = [
            models.UniqueConstraint(
                fields=["form", "common_field"],
                name="core_form_common_field_unique",
                condition=models.Q(common_field__isnull=False),
            ),
        ]

    def __str__(self) -> str:
        field_name = self.common_field.field_key if self.common_field else "Unknown"
        return f"{self.form.form_code} -> {field_name} (Order: {self.display_order})"
