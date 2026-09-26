from django.apps import AppConfig


class PersonConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.person"
    label = "person"
    verbose_name = "Person master profile"
