from django.core.management.base import BaseCommand

from apps.membership_onboarding.models import (
    MembershipDocument,
    MembershipFieldOption,
    MembershipForm,
    MembershipStep,
    MembershipStepField,
    MembershipType,
)


class Command(BaseCommand):
    help = "Seed membership types, form, steps, fields, and documents."

    def handle(self, *args, **options):
        if MembershipType.objects.filter(slug="professional-membership").exists():
            self.stdout.write(self.style.WARNING("Membership seed already applied — skipping."))
            return

        mtype = MembershipType.objects.create(
            name="Professional Membership",
            slug="professional-membership",
            description="For advocates, jurists, and legal professionals.",
            display_order=1,
        )
        form = MembershipForm.objects.create(
            membership_type=mtype,
            title="Professional Membership Application",
            version=1,
            is_active=True,
        )

        steps_data = [
            ("personal", "Personal Information", 1),
            ("contact", "Contact Information", 2),
            ("professional", "Professional Information", 3),
            ("declaration", "Declaration", 4),
        ]
        steps = []
        for slug, title, order in steps_data:
            steps.append(
                MembershipStep.objects.create(
                    form=form,
                    name=title,
                    slug=slug,
                    title=title,
                    display_order=order,
                )
            )

        def field(step, key, label, ftype, order, required=False):
            return MembershipStepField.objects.create(
                step=step,
                name=label,
                field_key=key,
                field_type=ftype,
                label=label,
                is_required=required,
                display_order=order,
            )

        field(steps[0], "full_name", "Full Legal Name", MembershipStepField.FieldType.TEXT, 1, True)
        field(steps[0], "date_of_birth", "Date of Birth", MembershipStepField.FieldType.DATE, 2)
        field(steps[1], "email", "Email Address", MembershipStepField.FieldType.EMAIL, 1, True)
        field(steps[1], "mobile", "Mobile Number", MembershipStepField.FieldType.PHONE, 2, True)
        field(steps[2], "profession", "Profession / Designation", MembershipStepField.FieldType.TEXT, 1)
        field(steps[2], "enrolment_id", "Statutory Enrolment ID", MembershipStepField.FieldType.TEXT, 2)
        decl = field(
            steps[3],
            "declaration_accepted",
            "I accept the ICJ Code of Conduct",
            MembershipStepField.FieldType.CHECKBOX,
            1,
            True,
        )
        MembershipFieldOption.objects.create(step_field=decl, value="yes", label="I accept", display_order=1)

        MembershipDocument.objects.create(
            form=form,
            name="Government ID Proof",
            document_key="government_id",
            is_required=False,
            allowed_extensions=["pdf", "jpg", "jpeg", "png"],
            display_order=1,
        )

        self.stdout.write(self.style.SUCCESS("Membership onboarding seed complete."))
