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

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Wipe and recreate membership onboarding steps and fields.",
        )

    def handle(self, *args, **options):
        form = MembershipForm.objects.filter(is_active=True).first()
        if not form:
            mtype, _ = MembershipType.objects.get_or_create(
                slug="membership",
                defaults={
                    "name": "Membership",
                    "description": "Default membership application",
                    "display_order": 1,
                    "is_active": True,
                },
            )
            form, _ = MembershipForm.objects.get_or_create(
                membership_type=mtype,
                defaults={
                    "title": "Membership Application",
                    "version": 1,
                    "is_active": True,
                },
            )

        if options.get("clear"):
            MembershipStep.objects.filter(form=form).delete()
            MembershipDocument.objects.filter(form=form).delete()

        # Clean up only legacy obsolete steps (do not touch additional-details or additional-fields)
        MembershipStep.objects.filter(
            form=form,
            slug__in=["personal", "contact", "declaration", "personal_details", "personal-details"],
        ).delete()

        self.stdout.write(self.style.SUCCESS("Membership onboarding seed complete."))
