from django.core.management.base import BaseCommand
from apps.core.models.additional_onboarding_formfields import AdditionalOnboardingFormfields
from apps.core.models.common_field import CommonField
from apps.core.models.form_field_config import FormFieldConfig

class Command(BaseCommand):
    help = "Configures the Professional Onboarding form by mapping common fields."

    def handle(self, *args, **options):
        try:
            professional_form = AdditionalOnboardingFormfields.objects.get(
                form_code=AdditionalOnboardingFormfields.FormCode.PROFESSIONAL
            )
        except AdditionalOnboardingFormfields.DoesNotExist:
            self.stdout.write(self.style.ERROR("Professional form not found. Run init_onboarding_forms first."))
            return

        fields_to_map = [
            {"key": "full_name", "section": "Common Information", "order": 10, "required": True},
            {"key": "email", "section": "Common Information", "order": 20, "required": True},
            {"key": "mobile_number", "section": "Common Information", "order": 30, "required": True},
            {"key": "date_of_birth", "section": "Common Information", "order": 40, "required": False},
            {"key": "gender", "section": "Common Information", "order": 50, "required": False},
        ]

        for mapping in fields_to_map:
            try:
                cf = CommonField.objects.get(field_key=mapping["key"])
                config, created = FormFieldConfig.objects.update_or_create(
                    form=professional_form,
                    common_field=cf,
                    defaults={
                        "section_name": mapping["section"],
                        "display_order": mapping["order"],
                        "is_required": mapping["required"],
                        "is_visible": True,
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Mapped {cf.field_key} to PROFESSIONAL form."))
                else:
                    self.stdout.write(self.style.WARNING(f"Updated mapping for {cf.field_key}."))
            except CommonField.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Common field {mapping['key']} not found. Run seed_common_fields first."))

        self.stdout.write(self.style.SUCCESS("Professional form configuration complete."))
