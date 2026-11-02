from django.core.management.base import BaseCommand

from apps.membership_onboarding.models import (
    MembershipForm,
    MembershipType,
)


class Command(BaseCommand):
    help = "Seed membership types and active form."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Wipe and recreate membership onboarding.",
        )

    def handle(self, *args, **options):
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
        self.stdout.write(self.style.SUCCESS("Membership onboarding seed complete."))
