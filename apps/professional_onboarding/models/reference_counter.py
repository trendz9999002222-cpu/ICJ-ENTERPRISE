from django.db import models


class ProfessionalRegistrationReferenceCounter(models.Model):
    """Per-year atomic sequence for human-readable reference IDs (PostgreSQL-safe)."""

    year = models.PositiveIntegerField(unique=True)
    last_value = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "professional registration reference counter"

    def __str__(self) -> str:
        return f"{self.year}: {self.last_value}"
