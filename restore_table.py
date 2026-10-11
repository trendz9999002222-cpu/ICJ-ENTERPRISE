import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from apps.membership_onboarding.models import MembershipApplication

print("Attempting to recreate the MembershipApplication table...")

try:
    with connection.schema_editor() as schema_editor:
        schema_editor.create_model(MembershipApplication)
    print("Table 'membership_onboarding_membershipapplication' recreated successfully!")
except Exception as e:
    print(f"Failed to recreate table: {e}")
