import uuid

from django.db import models

from .category import Category


class Group(models.Model):
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="groups",
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
                fields=("category", "slug"),
                name="professional_onboarding_group_unique_slug_per_category",
            ),
        ]
        indexes = [
            models.Index(fields=["category", "is_active", "display_order"]),
        ]

    def __str__(self) -> str:
        return f"{self.category.name} → {self.name}"
