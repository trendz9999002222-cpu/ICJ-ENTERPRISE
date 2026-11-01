import random
from django.db.models.signals import post_save, post_delete
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

        add_fields = instance.additional_fields if isinstance(instance.additional_fields, dict) else {}
        lead_type = add_fields.get("lead_type")
        if not lead_type:
            if add_fields.get("service_name") or add_fields.get("service_slug"):
                lead_type = Lead.LeadType.SERVICE_REQUEST
            elif (
                add_fields.get("professional_name")
                or add_fields.get("practitioner_name")
                or add_fields.get("professional_id")
                or "Appointment" in (instance.category or "")
                or "Consultation" in (instance.help_type or "")
            ):
                lead_type = Lead.LeadType.PROFESSIONAL_APPOINTMENT
            else:
                lead_type = Lead.LeadType.SEEK_ASSISTANCE

        service_name = add_fields.get("service_name") or add_fields.get("service_title", "") or ""
        target_pro_name = add_fields.get("professional_name") or add_fields.get("practitioner_name", "") or ""
        target_pro_id = add_fields.get("professional_id", "") or ""
        lead_type = lead_type or Lead.LeadType.SEEK_ASSISTANCE

        lead = Lead.objects.create(
            lead_id=lead_id,
            assistance_request=instance,
            lead_type=lead_type,
            service_name=service_name,
            target_professional_name=target_pro_name,
            target_professional_id=target_pro_id,
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


@receiver(post_save, sender="leads.Lead")
@receiver(post_delete, sender="leads.Lead")
def invalidate_lead_admin_cache(sender, **kwargs):
    """
    Instantly invalidates cached lead counter statistics whenever any lead is
    created, updated (status change, assignment, etc.), or deleted.
    """
    try:
        from apps.leads.views.admin import _clear_admin_leads_cache
        _clear_admin_leads_cache()
    except Exception:
        pass
