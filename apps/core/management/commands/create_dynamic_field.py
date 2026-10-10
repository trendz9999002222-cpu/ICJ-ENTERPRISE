import argparse
from django.core.management.base import BaseCommand
from apps.core.models.additional_onboarding_formfields import AdditionalOnboardingFormfields
from apps.core.models.common_field import CommonField
from apps.core.models.form_field_config import FormFieldConfig

class Command(BaseCommand):
    help = "Creates a new dynamic field and maps it to a specific form."

    def add_arguments(self, parser):
        parser.add_argument("--form", type=str, required=True, help="Form code (e.g. PROFESSIONAL)")
        parser.add_argument("--key", type=str, required=True, help="Field key (e.g. aadhar_number)")
        parser.add_argument("--label", type=str, required=True, help="Display label")
        parser.add_argument("--type", type=str, required=True, help="Field type (text, number, etc.)")
        parser.add_argument("--required", action=argparse.BooleanOptionalAction, default=False, help="Is required?")
        parser.add_argument("--section", type=str, default="Additional Information", help="Section name")

    def handle(self, *args, **options):
        form_code = options["form"]
        key = options["key"]
        label = options["label"]
        field_type = options["type"]
        is_required = options["required"]
        section = options["section"]

        # 1. Validate Form
        try:
            form = AdditionalOnboardingFormfields.objects.get(form_code=form_code)
        except AdditionalOnboardingFormfields.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Form {form_code} does not exist."))
            return

        # 2. Validate Type
        if field_type not in CommonField.FieldType.values:
            self.stdout.write(self.style.ERROR(f"Invalid type '{field_type}'. Allowed: {CommonField.FieldType.values}"))
            return

        # 3. Create or get Common Field
        cf, created = CommonField.objects.get_or_create(
            field_key=key,
            defaults={
                "name": label,
                "label": label,
                "field_type": field_type,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created new CommonField: {key}"))
        else:
            self.stdout.write(self.style.WARNING(f"CommonField {key} already exists. Using existing."))

        # 4. Map to Form
        config, mapped = FormFieldConfig.objects.update_or_create(
            form=form,
            common_field=cf,
            defaults={
                "section_name": section,
                "is_required": is_required,
                "is_visible": True,
            }
        )
        
        if mapped:
            self.stdout.write(self.style.SUCCESS(f"Successfully mapped '{key}' to form '{form_code}'."))
        else:
            self.stdout.write(self.style.WARNING(f"Mapping updated for '{key}' in form '{form_code}'."))
