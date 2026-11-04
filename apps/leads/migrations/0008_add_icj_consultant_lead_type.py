from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leads", "0007_merge_20261102"),
    ]

    operations = [
        migrations.AlterField(
            model_name="lead",
            name="lead_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("seek_assistance", "Seek Assistance"),
                    ("professional_appointment", "Professional Appointment"),
                    ("icj_consultant", "ICJ Consultant"),
                    ("service_request", "Service Request"),
                ],
                db_index=True,
                default="seek_assistance",
                max_length=40,
                null=True,
            ),
        ),
    ]
