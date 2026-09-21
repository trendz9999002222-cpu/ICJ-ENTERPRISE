import uuid

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models

from apps.professional_onboarding.models.category import Category
from apps.professional_onboarding.models.group import Group
from apps.professional_onboarding.models.profession import Profession

HEX_COLOR_VALIDATOR = RegexValidator(
    regex=r"^#[0-9A-Fa-f]{6}$",
    message="Color must be a 6-digit HEX value, e.g. #2563EB.",
)


class VisualTheme(models.Model):
    """Reusable visual theme attached to exactly one Category, Group, or Profession."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.OneToOneField(
        Category,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="visual_theme",
    )
    group = models.OneToOneField(
        Group,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="visual_theme",
    )
    profession = models.OneToOneField(
        Profession,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="visual_theme",
    )
    use_parent_theme = models.BooleanField(
        default=False,
        help_text="When true, resolved colors come from the parent entity (group→category, profession→group).",
    )
    primary_color = models.CharField(max_length=7, validators=[HEX_COLOR_VALIDATOR])
    secondary_color = models.CharField(max_length=7, validators=[HEX_COLOR_VALIDATOR])
    accent_color = models.CharField(max_length=7, validators=[HEX_COLOR_VALIDATOR])
    background_color = models.CharField(max_length=7, validators=[HEX_COLOR_VALIDATOR])
    text_color = models.CharField(max_length=7, validators=[HEX_COLOR_VALIDATOR])
    border_color = models.CharField(max_length=7, blank=True, validators=[HEX_COLOR_VALIDATOR])
    icon_color = models.CharField(max_length=7, blank=True, validators=[HEX_COLOR_VALIDATOR])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(category__isnull=False, group__isnull=True, profession__isnull=True)
                    | models.Q(category__isnull=True, group__isnull=False, profession__isnull=True)
                    | models.Q(category__isnull=True, group__isnull=True, profession__isnull=False)
                ),
                name="professional_onboarding_visual_theme_single_owner",
            ),
        ]

    def clean(self) -> None:
        owners = [self.category_id, self.group_id, self.profession_id]
        if sum(1 for o in owners if o) != 1:
            raise ValidationError("Theme must belong to exactly one category, group, or profession.")
        if self.category_id and self.use_parent_theme:
            raise ValidationError({"use_parent_theme": "Categories cannot inherit a parent theme."})
        if self.border_color == "":
            self.border_color = ""
        if self.icon_color == "":
            self.icon_color = ""

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        if self.category_id:
            return f"Theme for category {self.category_id}"
        if self.group_id:
            return f"Theme for group {self.group_id}"
        return f"Theme for profession {self.profession_id}"
