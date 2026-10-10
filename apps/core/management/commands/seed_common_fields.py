from django.core.management.base import BaseCommand
from apps.core.models.common_field import CommonField

class Command(BaseCommand):
    help = "Seeds standard common fields."

    def handle(self, *args, **options):
        fields_to_seed = [
            {
                "field_key": "full_name",
                "name": "Full Name",
                "label": "Full Name",
                "field_type": CommonField.FieldType.TEXT,
                "is_system_field": True,
            },
            {
                "field_key": "email",
                "name": "Email Address",
                "label": "Email ID",
                "field_type": CommonField.FieldType.EMAIL,
                "is_system_field": True,
            },
            {
                "field_key": "mobile_number",
                "name": "Mobile Number",
                "label": "Mobile Number",
                "field_type": CommonField.FieldType.PHONE,
                "is_system_field": True,
            },
            {
                "field_key": "date_of_birth",
                "name": "Date of Birth",
                "label": "Date of Birth",
                "field_type": CommonField.FieldType.DATE,
                "is_system_field": False,
            },
            {
                "field_key": "gender",
                "name": "Gender",
                "label": "Gender",
                "field_type": CommonField.FieldType.SELECT,
                "options": [
                    {"label": "Male", "value": "M"},
                    {"label": "Female", "value": "F"},
                    {"label": "Other", "value": "O"}
                ],
                "is_system_field": False,
            },
        ]

        for field_data in fields_to_seed:
            obj, created = CommonField.objects.update_or_create(
                field_key=field_data["field_key"],
                defaults={
                    "name": field_data["name"],
                    "label": field_data["label"],
                    "field_type": field_data["field_type"],
                    "options": field_data.get("options", []),
                    "is_system_field": field_data["is_system_field"],
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Seeded common field: {obj.field_key}"))
            else:
                self.stdout.write(self.style.WARNING(f"Updated common field: {obj.field_key}"))
        
        self.stdout.write(self.style.SUCCESS("Common fields seeded successfully."))
