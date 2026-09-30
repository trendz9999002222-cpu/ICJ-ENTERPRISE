from django.db import migrations, models


def forwards(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(role="advocate").update(role="professional")
    User.objects.filter(role="client").update(role="professional")


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_last_temp_password_alter_user_role"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("super_admin", "Super Admin"),
                    ("admin", "Admin"),
                    ("professional", "Professional"),
                    ("member", "Member"),
                ],
                default="member",
                max_length=32,
            ),
        ),
    ]
