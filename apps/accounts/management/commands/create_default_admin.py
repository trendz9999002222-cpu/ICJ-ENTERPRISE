from django.core.management.base import BaseCommand, CommandError

from apps.accounts.services.auth import AuthServiceError, create_default_admin_from_env


class Command(BaseCommand):
    help = "Create default admin user from environment variables (idempotent)."

    def handle(self, *args, **options):
        try:
            user, message = create_default_admin_from_env()
        except AuthServiceError as exc:
            raise CommandError(str(exc)) from exc
        self.stdout.write(self.style.SUCCESS(message))
        if user:
            self.stdout.write(f"Admin email: {user.email}")
