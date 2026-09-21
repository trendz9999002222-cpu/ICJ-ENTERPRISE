from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("professional_onboarding", "0007_registration_submission"),
    ]

    operations = [
        migrations.AddField(
            model_name="professionalregistrationsubmission",
            name="selected_category_ids",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="professionalregistrationsubmission",
            name="selected_group_ids",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="professionalregistrationsubmission",
            name="selected_profession_ids",
            field=models.JSONField(default=list),
        ),
    ]
