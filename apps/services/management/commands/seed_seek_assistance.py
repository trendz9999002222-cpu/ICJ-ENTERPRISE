from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Deprecated: Seek Assistance form is now static."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Seek Assistance intake form is static. No dynamic seeding required."))

