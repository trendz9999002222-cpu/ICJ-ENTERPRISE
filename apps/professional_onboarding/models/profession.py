import uuid

from django.db import models

from apps.professional_onboarding.models.group import Group


class Profession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="professions",
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")
        constraints = [
            models.UniqueConstraint(
                fields=("group", "slug"),
                name="professional_onboarding_profession_unique_slug_per_group",
            ),
        ]
        indexes = [
            models.Index(fields=["group", "is_active", "display_order"]),
        ]

    def __str__(self) -> str:
        return f"{self.group.name} → {self.name}"
