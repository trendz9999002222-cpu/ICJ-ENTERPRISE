from django.core.management.base import BaseCommand
from apps.core.models.additional_onboarding_formfields import AdditionalOnboardingFormfields

class Command(BaseCommand):
    help = "Initializes the basic onboarding forms."

    def handle(self, *args, **options):
        forms_to_create = [
            {
                "form_code": AdditionalOnboardingFormfields.FormCode.PROFESSIONAL,
                "form_name": "Professional Registration",
                "description": "Direct registration flow for professionals.",
            },
            {
                "form_code": AdditionalOnboardingFormfields.FormCode.MEMBERSHIP,
                "form_name": "Trustee Membership",
                "description": "Application flow for Trustee Membership.",
            },
            {
                "form_code": AdditionalOnboardingFormfields.FormCode.SEEKER_ASSISTANT,
                "form_name": "Seeker Assistant",
                "description": "Application flow for Client Seekers and Lead Generation.",
            },
        ]

        for form_data in forms_to_create:
            obj, created = AdditionalOnboardingFormfields.objects.get_or_create(
                form_code=form_data["form_code"],
                defaults={
                    "form_name": form_data["form_name"],
                    "description": form_data["description"],
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created form: {obj.form_code}"))
            else:
                self.stdout.write(self.style.WARNING(f"Form already exists: {obj.form_code}"))
        
        self.stdout.write(self.style.SUCCESS("Onboarding forms initialization complete."))
