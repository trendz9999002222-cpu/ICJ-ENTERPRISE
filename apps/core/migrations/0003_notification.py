import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_add_honorable_advisory_form_code'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('scope', models.CharField(choices=[('user', 'User Specific'), ('admin', 'Admin Staff'), ('global', 'Global Broadcast')], db_index=True, default='user', max_length=20)),
                ('notification_type', models.CharField(choices=[('info', 'Information'), ('success', 'Success'), ('warning', 'Warning'), ('error', 'Urgent / Action Required'), ('application', 'Empanelment Application'), ('assistance', 'Legal Assistance'), ('membership', 'Membership')], default='info', max_length=30)),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
                ('link', models.CharField(blank=True, default='', max_length=500)),
                ('is_read', models.BooleanField(db_index=True, default=False)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('recipient', models.ForeignKey(blank=True, help_text='Target user. Null when notification is broadcast to all administrators or globally.', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['scope', 'is_read'], name='core_notifi_scope_87cba6_idx'),
                    models.Index(fields=['recipient', 'is_read'], name='core_notifi_recipie_f3b145_idx'),
                    models.Index(fields=['created_at'], name='core_notifi_created_d20739_idx'),
                ],
            },
        ),
    ]
