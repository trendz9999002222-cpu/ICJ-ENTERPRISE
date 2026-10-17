from django.core.management.base import BaseCommand
from apps.core.models import AdditionalOnboardingFormfields, CommonField, FormFieldConfig

class Command(BaseCommand):
    help = "Configures the Membership Onboarding form by mapping common fields."

    def handle(self, *args, **options):
        membership_form, _ = AdditionalOnboardingFormfields.objects.get_or_create(
            form_code=AdditionalOnboardingFormfields.FormCode.MEMBERSHIP,
            defaults={
                "form_name": "Trustee Membership",
                "description": "Application flow for Trustee Membership.",
            }
        )

        fields_to_map = [
            {"key": "full_name", "section": "Personal Details", "order": 10, "required": True},
            {"key": "email", "section": "Personal Details", "order": 20, "required": True},
            {"key": "mobile_number", "section": "Personal Details", "order": 30, "required": True},
        ]

        for mapping in fields_to_map:
            try:
                cf = CommonField.objects.get(field_key=mapping["key"])
                config, created = FormFieldConfig.objects.update_or_create(
                    form=membership_form,
                    common_field=cf,
                    defaults={
                        "section_name": mapping["section"],
                        "display_order": mapping["order"],
                        "is_required": mapping["required"],
                        "is_visible": True,
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Mapped {cf.field_key} to MEMBERSHIP form."))
                else:
                    self.stdout.write(self.style.WARNING(f"Updated mapping for {cf.field_key}."))
            except CommonField.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Common field {mapping['key']} not found."))

        self.stdout.write(self.style.SUCCESS("Membership form configuration complete."))
