from django.core.management.base import BaseCommand
from apps.core.models import AdditionalOnboardingFormfields, CommonField, FormFieldConfig


class Command(BaseCommand):
    help = "Seeds all standard Common Fields for Member Onboarding and maps them to both PROFESSIONAL and MEMBERSHIP forms."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Reset display order and required status to match standard defaults.",
        )

    def handle(self, *args, **options):
        reset_orders = options.get("reset", False)
        # 1. Ensure Onboarding Forms exist
        prof_form, _ = AdditionalOnboardingFormfields.objects.get_or_create(
            form_code=AdditionalOnboardingFormfields.FormCode.PROFESSIONAL,
            defaults={
                "form_name": "Member Onboarding",
                "description": "Onboarding flow for ICJ Members & Professionals.",
            },
        )
        mem_form, _ = AdditionalOnboardingFormfields.objects.get_or_create(
            form_code=AdditionalOnboardingFormfields.FormCode.MEMBERSHIP,
            defaults={
                "form_name": "Member Onboarding",
                "description": "Onboarding flow for ICJ Members.",
            },
        )

        # 1. Clean up duplicate first_name and last_name common fields & configs
        FormFieldConfig.objects.filter(common_field__field_key__in=["first_name", "last_name"]).delete()
        del_count, _ = CommonField.objects.filter(field_key__in=["first_name", "last_name"]).delete()
        if del_count:
            self.stdout.write(self.style.WARNING(f"Cleaned up {del_count} duplicate first_name / last_name fields."))

        # 2. Master Common Fields definition matching exact user requirements
        fields_to_seed = [
            {
                "field_key": "full_name",
                "name": "Full Name",
                "label": "Full Name",
                "field_type": CommonField.FieldType.TEXT,
                "placeholder": "Enter full legal name",
                "is_system_field": False,
                "is_required": True,
                "display_order": 10,
            },
            {
                "field_key": "email",
                "name": "Email Address",
                "label": "Registered Email Address",
                "field_type": CommonField.FieldType.EMAIL,
                "placeholder": "name@example.com",
                "is_system_field": True,
                "is_required": True,
                "display_order": 20,
            },
            {
                "field_key": "mobile_number",
                "name": "Mobile / WhatsApp Number",
                "label": "Mobile / WhatsApp Number",
                "field_type": CommonField.FieldType.PHONE,
                "placeholder": "9876543210",
                "is_system_field": True,
                "is_required": True,
                "display_order": 30,
            },
            {
                "field_key": "date_of_birth",
                "name": "Date of Birth",
                "label": "Date of Birth",
                "field_type": CommonField.FieldType.DATE,
                "is_system_field": False,
                "is_required": False,
                "display_order": 40,
            },
            {
                "field_key": "gender",
                "name": "Gender",
                "label": "Gender",
                "field_type": CommonField.FieldType.SELECT,
                "options": [
                    {"label": "Male", "value": "Male"},
                    {"label": "Female", "value": "Female"},
                    {"label": "Other", "value": "Other"},
                    {"label": "Prefer not to disclose", "value": "Prefer not to disclose"},
                ],
                "is_system_field": False,
                "is_required": False,
                "display_order": 50,
            },
            {
                "field_key": "state_name",
                "name": "State / Union Territory",
                "label": "State / Union Territory",
                "field_type": CommonField.FieldType.SELECT,
                "options": [
                    {"label": "Delhi", "value": "Delhi"},
                    {"label": "Maharashtra", "value": "Maharashtra"},
                    {"label": "Uttar Pradesh", "value": "Uttar Pradesh"},
                    {"label": "Haryana", "value": "Haryana"},
                    {"label": "Karnataka", "value": "Karnataka"},
                    {"label": "Tamil Nadu", "value": "Tamil Nadu"},
                    {"label": "West Bengal", "value": "West Bengal"},
                    {"label": "Gujarat", "value": "Gujarat"},
                    {"label": "Rajasthan", "value": "Rajasthan"},
                    {"label": "Punjab", "value": "Punjab"},
                    {"label": "Bihar", "value": "Bihar"},
                    {"label": "Madhya Pradesh", "value": "Madhya Pradesh"},
                    {"label": "Kerala", "value": "Kerala"},
                    {"label": "Telangana", "value": "Telangana"},
                    {"label": "Andhra Pradesh", "value": "Andhra Pradesh"},
                    {"label": "Other State / Union Territory", "value": "Other State / Union Territory"},
                ],
                "is_system_field": False,
                "is_required": False,
                "display_order": 40,
            },
            {
                "field_key": "city_name",
                "name": "City / District",
                "label": "City / District",
                "field_type": CommonField.FieldType.TEXT,
                "placeholder": "e.g. New Delhi",
                "is_system_field": False,
                "is_required": False,
                "display_order": 45,
            },
            {
                "field_key": "district",
                "name": "District",
                "label": "District",
                "field_type": CommonField.FieldType.CITY,
                "placeholder": "e.g. South Delhi",
                "is_system_field": False,
                "is_required": False,
                "display_order": 48,
            },
            {
                "field_key": "pincode",
                "name": "Postal Code (PIN)",
                "label": "Postal Code (PIN)",
                "field_type": CommonField.FieldType.PINCODE,
                "placeholder": "e.g. 110001",
                "is_system_field": False,
                "is_required": False,
                "display_order": 50,
            },
            {
                "field_key": "address",
                "name": "Residential / Office Address",
                "label": "Residential / Office Address",
                "field_type": CommonField.FieldType.TEXTAREA,
                "placeholder": "House/Chamber No., Street, Locality or Landmark",
                "is_system_field": False,
                "is_required": False,
                "display_order": 55,
            },
        ]

        # 3. Upsert CommonField and FormFieldConfig for both forms
        for item in fields_to_seed:
            cf, created = CommonField.objects.update_or_create(
                field_key=item["field_key"],
                defaults={
                    "name": item["name"],
                    "label": item["label"],
                    "field_type": item["field_type"],
                    "placeholder": item.get("placeholder", ""),
                    "options": item.get("options", []),
                    "is_system_field": item["is_system_field"],
                    "is_active": True,
                },
            )
            status_text = "Created" if created else "Updated"
            self.stdout.write(f"  [{status_text}] CommonField: {cf.field_key}")

            for target_form in [prof_form, mem_form]:
                config, cfg_created = FormFieldConfig.objects.get_or_create(
                    form=target_form,
                    common_field=cf,
                    defaults={
                        "section_name": "Personal Particulars" if item["display_order"] < 30 else "Contact & Location",
                        "display_order": item["display_order"],
                        "is_required": item["is_required"],
                        "is_visible": True,
                    },
                )
                if not cfg_created:
                    if reset_orders:
                        config.is_visible = True
                        config.display_order = item["display_order"]
                        config.is_required = item["is_required"]
                        config.save(update_fields=["is_visible", "display_order", "is_required"])
                    elif not config.is_visible:
                        config.is_visible = True
                        config.save(update_fields=["is_visible"])

        self.stdout.write(self.style.SUCCESS("All Member Onboarding common fields seeded and mapped successfully!"))
