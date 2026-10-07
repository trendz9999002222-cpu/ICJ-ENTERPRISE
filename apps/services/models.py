import uuid

from django.db import models
from django.utils.text import slugify


class ServiceCategory(models.Model):
    """
    Categories for justice services.
    Examples: Specialized Law, Citizen Assistance, Dispute Resolution, etc.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    value = models.CharField(
        max_length=60,
        unique=True,
        help_text="Machine-readable key, e.g. 'specialized_law', 'assistance'.",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")
        indexes = [
            models.Index(fields=["is_active", "display_order"]),
        ]
        verbose_name_plural = "service categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class JusticeService(models.Model):
    """
    Individual justice service offered by ICJ.
    All list fields (who_it_is_for, how_icj_helps, etc.) are stored as JSON arrays.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    title = models.CharField(max_length=200)
    short_description = models.TextField()
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.PROTECT,
        related_name="services",
    )
    icon_name = models.CharField(
        max_length=60,
        blank=True,
        help_text="MUI icon name, e.g. 'HomeWork', 'Security'.",
    )
    who_it_is_for = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of strings describing target audience.",
    )
    how_icj_helps = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of strings describing how ICJ assists.",
    )
    available_assistance = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of assistance types offered.",
    )
    next_steps = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of procedural next steps.",
    )
    related_professionals = models.JSONField(
        default=list,
        blank=True,
        help_text="JSON array of related professional types.",
    )
    is_featured = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "title")
        indexes = [
            models.Index(fields=["is_active", "display_order"]),
            models.Index(fields=["is_active", "is_featured"]),
            models.Index(fields=["category", "is_active"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title
