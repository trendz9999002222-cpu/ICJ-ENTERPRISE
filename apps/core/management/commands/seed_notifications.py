from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.core.models import Notification

User = get_user_model()


class Command(BaseCommand):
    help = "Seed initial enterprise platform notifications"

    def handle(self, *args, **options):
        # Global notification
        Notification.objects.get_or_create(
            title="Welcome to ICJ Enterprise Portal v2.0",
            defaults={
                "message": "Welcome to the International Consortium of Jurists digital platform. Access legal aid assistance, empanelment pathways, and verified case services.",
                "scope": Notification.Scope.GLOBAL,
                "notification_type": Notification.NotificationType.INFO,
                "link": "/dashboard/member",
                "is_read": False,
            },
        )

        Notification.objects.get_or_create(
            title="Statutory Bar Verification Standards Updated",
            defaults={
                "message": "The Empanelment Directorate has revised documentation guidelines for High Court and State Bar Council practitioners.",
                "scope": Notification.Scope.GLOBAL,
                "notification_type": Notification.NotificationType.WARNING,
                "link": "/dashboard/member",
                "is_read": False,
            },
        )

        # Admin notifications
        Notification.objects.get_or_create(
            title="System Initialization Complete",
            defaults={
                "message": "All database catalogs, category wings, and dynamic field pipelines have been synchronized successfully.",
                "scope": Notification.Scope.ADMIN,
                "notification_type": Notification.NotificationType.SUCCESS,
                "link": "/admin/dashboard",
                "is_read": False,
            },
        )

        Notification.objects.get_or_create(
            title="Scrutiny Queue Pending",
            defaults={
                "message": "Candidate empanelment credentials and public assistance requests await scrutiny review by the board.",
                "scope": Notification.Scope.ADMIN,
                "notification_type": Notification.NotificationType.APPLICATION,
                "link": "/admin/applications",
                "is_read": False,
            },
        )

        self.stdout.write(self.style.SUCCESS("Enterprise notifications seeded successfully."))
