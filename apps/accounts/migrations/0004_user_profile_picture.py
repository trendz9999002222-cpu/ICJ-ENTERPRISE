from django.db import migrations, models

import apps.accounts.models.user


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_normalize_platform_roles"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="profile_picture",
            field=models.FileField(
                blank=True,
                null=True,
                upload_to=apps.accounts.models.user.user_profile_picture_upload_to,
            ),
        ),
    ]
