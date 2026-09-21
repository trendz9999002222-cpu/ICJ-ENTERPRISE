import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("professional_onboarding", "0008_submission_multi_selection"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProfessionalRegistrationReferenceCounter",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("year", models.PositiveIntegerField(unique=True)),
                ("last_value", models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.AddField(
            model_name="professionalregistrationsubmission",
            name="idempotency_key",
            field=models.CharField(blank=True, db_index=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name="professionalregistrationsubmission",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="professional_registration_submissions",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddIndex(
            model_name="professionalregistrationsubmission",
            index=models.Index(fields=["user", "created_at"], name="professiona_user_id_6f0a2a_idx"),
        ),
        migrations.AddConstraint(
            model_name="professionalregistrationsubmission",
            constraint=models.UniqueConstraint(
                condition=models.Q(("idempotency_key__isnull", False), ("user__isnull", False)),
                fields=("user", "idempotency_key"),
                name="professional_onboarding_submission_user_idempotency",
            ),
        ),
    ]
