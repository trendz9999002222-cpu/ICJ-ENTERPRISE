from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"
    label = "core"

    def ready(self):
        try:
            from django.db import connection
            tables = connection.introspection.table_names()
            if "core_additionalonboardingformfields" in tables:
                from apps.core.models import AdditionalOnboardingFormfields
                forms_to_seed = [
                    (AdditionalOnboardingFormfields.FormCode.PROFESSIONAL, "Professional Registration"),
                    (AdditionalOnboardingFormfields.FormCode.MEMBERSHIP, "Trustee Membership"),
                    (AdditionalOnboardingFormfields.FormCode.SEEKER_ASSISTANT, "Seeker Assistant"),
                    (AdditionalOnboardingFormfields.FormCode.HONORABLE_ADVISORY, "Honorable Advisory Onboarding"),
                ]
                for code, name in forms_to_seed:
                    AdditionalOnboardingFormfields.objects.get_or_create(
                        form_code=code,
                        defaults={"form_name": name, "description": f"Onboarding flow for {name}."}
                    )
        except Exception:
            pass

