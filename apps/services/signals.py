import random
from decimal import Decimal
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from apps.services.models import AssistanceRequest, LeadCommercialSettings, MarketplaceLead


@receiver(post_save, sender=AssistanceRequest)
def create_or_sync_lead_for_assistance(sender, instance, created, **kwargs):
    """
    Ensures every citizen seek-assistance intake creates and maintains an associated
    MarketplaceLead record (status: pending_review) ready for Admin review,
    dynamic field inspection, and safe marketplace publication.
    Safe against duplicate signals and race conditions.
    """
    if not created:
        return

    if MarketplaceLead.objects.filter(assistance_request=instance).exists():
        return

    try:
        year = timezone.now().year
        lead_id = f"LEAD-{year}-{random.randint(10000, 99999)}"
        while MarketplaceLead.objects.filter(lead_id=lead_id).exists():
            lead_id = f"LEAD-{year}-{random.randint(10000, 99999)}"

        settings_obj = LeadCommercialSettings.objects.first()
        default_price = settings_obj.default_lead_price_paise if settings_obj else 50000
        tax = settings_obj.tax_percentage if settings_obj else Decimal("18.00")

        summary = (instance.problem_description or "").strip()
        if len(summary) > 220:
            summary = summary[:217] + "..."

        urgency_raw = (instance.urgency or "medium").lower()
        if "high" in urgency_raw or "critical" in urgency_raw:
            urgency_clean = "high"
        elif "low" in urgency_raw:
            urgency_clean = "low"
        else:
            urgency_clean = "medium"

        MarketplaceLead.objects.get_or_create(
            assistance_request=instance,
            defaults={
                "lead_id": lead_id,
                "category": instance.category or "General Legal Assistance",
                "urgency": urgency_clean,
                "state_name": instance.state_name or "",
                "city_name": instance.city_name or "",
                "anonymized_summary": summary or f"Assistance request for {instance.category or 'General Legal Assistance'}",
                "full_description": instance.problem_description or "",
                "price_paise": default_price,
                "tax_percentage": tax,
                "status": MarketplaceLead.Status.PENDING_REVIEW,
                "client_name": instance.full_name or "",
                "client_email": instance.email or "",
                "client_mobile": instance.mobile or "",
                "client_preferred_contact": instance.preferred_contact or "Phone",
            }
        )
    except Exception:
        # Prevent lead generation issues from breaking assistance submission
        pass
