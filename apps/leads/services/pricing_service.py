from decimal import Decimal
from django.utils import timezone
from apps.leads.models import Lead, LeadCommercialSettings, LeadPricingRule


class PricingService:
    @staticmethod
    def get_effective_price_paise(lead: Lead) -> int:
        """
        Calculates active price for a lead based on matching active pricing rules,
        falling back to lead.price_paise or system default.
        """
        now = timezone.now()
        rule = (
            LeadPricingRule.objects.filter(is_active=True, effective_from__lte=now)
            .filter(category__in=["", lead.category])
            .filter(urgency__in=["", lead.urgency])
            .order_by("-effective_from")
            .first()
        )
        if rule:
            return rule.base_price_paise

        if lead.price_paise:
            return lead.price_paise

        settings = LeadCommercialSettings.get_settings()
        return settings.default_lead_price_paise

    @staticmethod
    def calculate_total_with_tax(base_paise: int, tax_percentage: Decimal | None = None) -> tuple[int, int]:
        """
        Returns (tax_amount_paise, total_amount_paise)
        """
        if tax_percentage is None:
            settings = LeadCommercialSettings.get_settings()
            tax_percentage = settings.tax_percentage

        tax_paise = int(round(base_paise * (float(tax_percentage) / 100.0)))
        total_paise = base_paise + tax_paise
        return tax_paise, total_paise
