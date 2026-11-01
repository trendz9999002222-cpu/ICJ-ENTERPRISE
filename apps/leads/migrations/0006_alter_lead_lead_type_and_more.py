from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0005_leadacceptance_leads_leada_lead_id_e596c3_idx_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lead',
            name='lead_type',
            field=models.CharField(
                blank=True,
                choices=[
                    ('seek_assistance', 'Seek Assistance'),
                    ('professional_appointment', 'Professional Appointment'),
                    ('service_request', 'Service Request'),
                ],
                db_index=True,
                default='seek_assistance',
                max_length=40,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='lead',
            name='service_name',
            field=models.CharField(blank=True, db_index=True, default='', max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='lead',
            name='target_professional_id',
            field=models.CharField(blank=True, default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='lead',
            name='target_professional_name',
            field=models.CharField(blank=True, default='', max_length=200, null=True),
        ),
    ]
