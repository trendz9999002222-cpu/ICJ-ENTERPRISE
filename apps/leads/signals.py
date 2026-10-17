import random
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from apps.services.models import AssistanceRequest


@receiver(post_save, sender=AssistanceRequest)
def create_or_sync_lead_for_assistance(sender, instance, created, **kwargs):
    """
    Ensures every client assistance request creates or maintains an associated
    unpublished Lead record ready for Admin review and safe marketplace publication.
    """
    from apps.leads.models import Lead, LeadCommercialSettings, LeadActivity

    if created:
        year = timezone.now().year
        lead_id = f"ICJ-LEAD-{year}-{random.randint(10000, 99999)}"
        while Lead.objects.filter(lead_id=lead_id).exists():
            lead_id = f"ICJ-LEAD-{year}-{random.randint(10000, 99999)}"

        settings_obj = LeadCommercialSettings.get_settings()
        
        # Build safe anonymized summary
        summary = instance.problem_description.strip()
        if len(summary) > 220:
            summary = summary[:217] + "..."

        lead = Lead.objects.create(
            lead_id=lead_id,
            assistance_request=instance,
            category=instance.category or "General Legal Assistance",
            urgency=instance.urgency or "Medium",
            state_name=instance.state_name or "Not Specified",
            city_name=instance.city_name or "Not Specified",
            anonymized_summary=summary,
            full_description=instance.problem_description,
            price_paise=settings_obj.default_lead_price_paise,
            tax_percentage=settings_obj.tax_percentage,
            status=Lead.Status.PENDING_REVIEW,
        )

        LeadActivity.objects.create(
            lead=lead,
            action="CREATED_FROM_ASSISTANCE",
            description=f"Marketplace lead {lead_id} auto-created from assistance request {instance.reference_id}.",
            metadata={"assistance_reference": instance.reference_id},
        )
