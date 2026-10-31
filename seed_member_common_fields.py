#!/usr/bin/env python
"""
Standalone script to seed and map all Member Onboarding Common Fields
Run: python seed_member_common_fields.py
"""
import os
import sys
import django

# Setup Django Environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.core.management import call_command

if __name__ == "__main__":
    reset = "--reset" in sys.argv
    print(f"Seeding Member Onboarding Common Fields into database (reset={reset})...")
    call_command("seed_member_common_fields", reset=reset)
    print("Done! Member Onboarding common fields are now active and mapped in both Admin and Public flows.")
