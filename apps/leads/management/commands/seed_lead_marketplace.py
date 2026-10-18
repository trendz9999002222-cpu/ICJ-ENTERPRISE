from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.leads.models import LeadCreditPlan, LeadCommercialSettings, Lead, LeadActivity
from apps.services.models import AssistanceRequest


class Command(BaseCommand):
    help = "Seeds default Lead Credit Plans and syncs existing Assistance Requests to marketplace leads."

    def handle(self, *args, **options):
        # 1. Commercial Settings
        settings = LeadCommercialSettings.get_settings()
        self.stdout.write(self.style.SUCCESS(f"Commercial settings verified: Default price INR {settings.default_lead_price_paise / 100:.2f}"))

        # 2. Seed Default Plans
        plans_data = [
            {
                "name": "Single Lead",
                "code": "single-lead",
                "price_paise": 100000,
                "credits_granted": 1,
                "validity_days": 365,
                "display_order": 1,
                "description": "1 exclusive verified legal assistance lead.",
            },
            {
                "name": "Starter",
                "code": "starter",
                "price_paise": 500000,
                "credits_granted": 5,
                "validity_days": 365,
                "display_order": 2,
                "description": "5 legal leads pack for growing independent practitioners.",
            },
            {
                "name": "Professional",
                "code": "professional",
                "price_paise": 1000000,
                "credits_granted": 10,
                "validity_days": 365,
                "display_order": 3,
                "description": "10 legal leads pack with priority assistance support.",
            },
            {
                "name": "Business",
                "code": "business",
                "price_paise": 2000000,
                "credits_granted": 20,
                "validity_days": 365,
                "display_order": 4,
                "description": "20 legal leads pack for established law chambers and firms.",
            },
        ]

        for pdata in plans_data:
            plan, created = LeadCreditPlan.objects.get_or_create(
                code=pdata["code"],
                defaults=pdata,
            )
            action = "Created" if created else "Exists"
            self.stdout.write(f"  Plan: {plan.name} ({action})")

        # 3. Sync any existing AssistanceRequest without a Lead
        existing_reqs = AssistanceRequest.objects.filter(marketplace_lead__isnull=True)
        synced_count = 0
        import random
        from django.utils import timezone

        for req in existing_reqs:
            year = timezone.now().year
            lead_id = f"ICJ-LEAD-{year}-{random.randint(10000, 99999)}"
            while Lead.objects.filter(lead_id=lead_id).exists():
                lead_id = f"ICJ-LEAD-{year}-{random.randint(10000, 99999)}"

            summary = req.problem_description.strip()
            if len(summary) > 220:
                summary = summary[:217] + "..."

            lead = Lead.objects.create(
                lead_id=lead_id,
                assistance_request=req,
                category=req.category or "General Legal Assistance",
                urgency=req.urgency or "Medium",
                state_name=req.state_name or "Not Specified",
                city_name=req.city_name or "Not Specified",
                anonymized_summary=summary,
                full_description=req.problem_description,
                price_paise=settings.default_lead_price_paise,
                tax_percentage=settings.tax_percentage,
                status=Lead.Status.PENDING_REVIEW,
            )
            LeadActivity.objects.create(
                lead=lead,
                action="INITIAL_SYNC",
                description=f"Marketplace lead {lead_id} initialized from existing assistance request {req.reference_id}.",
            )
            synced_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully synced {synced_count} assistance requests to marketplace leads."))
