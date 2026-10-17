from django.core.management.base import BaseCommand
from apps.core.models import AdditionalOnboardingFormfields, CommonField, FormFieldConfig
from apps.services.models import AssistanceFormField, AssistanceDocument


class Command(BaseCommand):
    help = "Seed Seek Assistance onboarding structure: Citizen Details, Legal Matter Information, and Supporting Documents."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Seek Assistance onboarding configuration..."))

        # 1. Ensure the core form exists
        form, _ = AdditionalOnboardingFormfields.objects.get_or_create(
            form_code=AdditionalOnboardingFormfields.FormCode.SEEKER_ASSISTANT,
            defaults={
                "form_name": "Seek Assistance",
                "description": "Citizen Legal Assistance Intake Flow",
            },
        )

        # 2. Master Common Fields for 1. CITIZEN / APPLICANT DETAILS
        citizen_fields = [
            {
                "field_key": "full_name",
                "name": "Full Name",
                "label": "Full Name",
                "field_type": CommonField.FieldType.TEXT,
                "is_system_field": True,
                "order": 10,
                "required": True,
                "placeholder": "Enter full legal name",
            },
            {
                "field_key": "email",
                "name": "Email Address",
                "label": "Email Address",
                "field_type": CommonField.FieldType.EMAIL,
                "is_system_field": True,
                "order": 20,
                "required": True,
                "placeholder": "e.g. name@example.com",
            },
            {
                "field_key": "mobile_number",
                "name": "Mobile / WhatsApp Number",
                "label": "Mobile / WhatsApp Number",
                "field_type": CommonField.FieldType.PHONE,
                "is_system_field": True,
                "order": 30,
                "required": True,
                "placeholder": "10-digit mobile number",
            },
            {
                "field_key": "preferred_contact",
                "name": "Preferred Contact Method",
                "label": "Preferred Contact Method",
                "field_type": CommonField.FieldType.SELECT,
                "is_system_field": False,
                "order": 40,
                "required": False,
                "options": [
                    {"label": "Phone Call", "value": "Phone"},
                    {"label": "WhatsApp", "value": "WhatsApp"},
                    {"label": "Email", "value": "Email"},
                ],
                "placeholder": "Select contact method",
            },
            {
                "field_key": "state",
                "name": "State",
                "label": "State",
                "field_type": CommonField.FieldType.STATE,
                "is_system_field": False,
                "order": 50,
                "required": True,
                "placeholder": "e.g. Delhi, Maharashtra",
            },
            {
                "field_key": "district",
                "name": "District",
                "label": "District",
                "field_type": CommonField.FieldType.CITY,
                "is_system_field": False,
                "order": 60,
                "required": True,
                "placeholder": "e.g. Mumbai, Lucknow",
            },
        ]

        for item in citizen_fields:
            cf, _ = CommonField.objects.update_or_create(
                field_key=item["field_key"],
                defaults={
                    "name": item["name"],
                    "label": item["label"],
                    "field_type": item["field_type"],
                    "placeholder": item.get("placeholder", ""),
                    "options": item.get("options", []),
                    "is_system_field": item.get("is_system_field", False),
                    "is_active": True,
                },
            )
            FormFieldConfig.objects.update_or_create(
                form=form,
                common_field=cf,
                defaults={
                    "section_name": "Citizen / Applicant Details",
                    "display_order": item["order"],
                    "is_required": item["required"],
                    "is_visible": True,
                    "label_override": item["label"],
                    "placeholder_override": item.get("placeholder", ""),
                },
            )
            self.stdout.write(self.style.SUCCESS(f"  [Tab 1] Configured Citizen Field: {cf.field_key}"))

        # 3. Form Fields for 2. LEGAL MATTER INFORMATION
        legal_matter_fields = [
            {
                "field_key": "category",
                "label": "Legal Subject Category",
                "field_type": "select",
                "required": True,
                "display_order": 10,
                "options": [
                    {"label": "Property & Land Disputes", "value": "Property & Land Disputes"},
                    {"label": "Consumer Fraud & Grievances", "value": "Consumer Fraud & Grievances"},
                    {"label": "Family & Matrimonial Issues", "value": "Family & Matrimonial Issues"},
                    {"label": "Cyber Crime & Digital Fraud", "value": "Cyber Crime & Digital Fraud"},
                    {"label": "Civil Recovery & Money Claims", "value": "Civil Recovery & Money Claims"},
                    {"label": "Labour & Employment Injustice", "value": "Labour & Employment Injustice"},
                    {"label": "Criminal Law Information & Bail", "value": "Criminal Law Information & Bail"},
                    {"label": "RTI & Public Governance", "value": "RTI & Public Governance"},
                    {"label": "Government Scheme / Free Legal Aid", "value": "Government Scheme / Free Legal Aid"},
                    {"label": "Other Legal Queries", "value": "Other Legal Queries"},
                ],
            },
            {
                "field_key": "urgency",
                "label": "Urgency Level",
                "field_type": "select",
                "required": False,
                "display_order": 20,
                "options": [
                    {"label": "Low (General Query)", "value": "Low"},
                    {"label": "Medium (Notice Received)", "value": "Medium"},
                    {"label": "High (Court Hearing Pending)", "value": "High"},
                    {"label": "Emergency (Immediate Arrest/Eviction)", "value": "Emergency"},
                ],
            },
            {
                "field_key": "problem_description",
                "label": "Describe Your Legal Problem in Detail",
                "field_type": "textarea",
                "required": True,
                "display_order": 30,
                "options": None,
            },
        ]

        for lmf in legal_matter_fields:
            AssistanceFormField.objects.update_or_create(
                field_key=lmf["field_key"],
                defaults={
                    "label": lmf["label"],
                    "field_type": lmf["field_type"],
                    "required": lmf["required"],
                    "display_order": lmf["display_order"],
                    "options": lmf["options"],
                    "is_active": True,
                },
            )
            self.stdout.write(self.style.SUCCESS(f"  [Tab 2] Configured Legal Matter Field: {lmf['field_key']}"))

        # 4. Documents for 3. SUPPORTING DOCUMENTS (OPTIONAL)
        documents = [
            {
                "document_key": "supporting_documents",
                "name": "Attach notices, agreements, FIRs, or relevant receipts",
                "description": "Attach notices, agreements, FIRs, or relevant receipts",
                "allowed_file_types": ["pdf", "docx", "jpg", "png"],
                "max_file_size_mb": 5,
                "is_required": False,
                "display_order": 10,
                "is_active": True,
            }
        ]

        for doc in documents:
            AssistanceDocument.objects.update_or_create(
                document_key=doc["document_key"],
                defaults={
                    "name": doc["name"],
                    "description": doc["description"],
                    "allowed_file_types": doc["allowed_file_types"],
                    "max_file_size_mb": doc["max_file_size_mb"],
                    "is_required": doc["is_required"],
                    "display_order": doc["display_order"],
                    "is_active": doc["is_active"],
                },
            )
            self.stdout.write(self.style.SUCCESS(f"  [Tab 3] Configured Supporting Document: {doc['document_key']}"))

        self.stdout.write(self.style.SUCCESS("\nSeek Assistance onboarding seeded successfully with 3 sections/tabs."))
