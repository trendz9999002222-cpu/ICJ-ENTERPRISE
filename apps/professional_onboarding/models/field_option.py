import uuid

from django.core.exceptions import ValidationError
from django.db import models

from apps.professional_onboarding.models.common_field import CommonField
from apps.professional_onboarding.models.profession_field import ProfessionField

OPTION_FIELD_TYPES = {
    CommonField.FieldType.SELECT,
    CommonField.FieldType.RADIO,
    CommonField.FieldType.CHECKBOX,
}


class FieldOption(models.Model):
    """Selectable choices for CommonField or ProfessionField (select / radio / checkbox)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    common_field = models.ForeignKey(
        CommonField,
        on_delete=models.CASCADE,
        related_name="options",
        null=True,
        blank=True,
    )
    profession_field = models.ForeignKey(
        ProfessionField,
        on_delete=models.CASCADE,
        related_name="options",
        null=True,
        blank=True,
    )
    value = models.CharField(max_length=120)
    label = models.CharField(max_length=200)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "label")
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(common_field__isnull=False, profession_field__isnull=True)
                    | models.Q(common_field__isnull=True, profession_field__isnull=False)
                ),
                name="professional_onboarding_fieldoption_exactly_one_parent",
            ),
            models.UniqueConstraint(
                fields=("common_field", "value"),
                condition=models.Q(common_field__isnull=False),
                name="professional_onboarding_fieldoption_unique_value_per_common_field",
            ),
            models.UniqueConstraint(
                fields=("profession_field", "value"),
                condition=models.Q(profession_field__isnull=False),
                name="professional_onboarding_fieldoption_unique_value_per_profession_field",
            ),
        ]
        indexes = [
            models.Index(fields=["common_field", "display_order"]),
            models.Index(fields=["profession_field", "display_order"]),
            models.Index(fields=["common_field", "is_active", "display_order"]),
            models.Index(fields=["profession_field", "is_active", "display_order"]),
        ]

    def clean(self) -> None:
        has_common = self.common_field_id is not None
        has_profession = self.profession_field_id is not None

        if has_common == has_profession:
            raise ValidationError(
                "An option must belong to exactly one CommonField or one ProfessionField."
            )

        parent = self.common_field if has_common else self.profession_field
        if parent.field_type not in OPTION_FIELD_TYPES:
            raise ValidationError(
                {
                    "field_type": (
                        "Options are only allowed for field types: select, radio, checkbox."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        parent = self.common_field or self.profession_field
        parent_label = getattr(parent, "field_key", str(parent))
        return f"{parent_label}: {self.label} ({self.value})"
