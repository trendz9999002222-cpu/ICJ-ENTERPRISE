import os
import sys
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.membership_onboarding.models import (
    MembershipType,
    MembershipForm,
    MembershipStep,
    MembershipStepField,Legal
)

def create_membership_form_and_fields():
    print("Creating Membership Type and Form...")
    # 1. Ensure a MembershipType exists
    m_type, _ = MembershipType.objects.get_or_create(
        slug="standard",
        defaults={
            "name": "Standard Membership",
            "description": "Default membership type",
            "is_active": True,
        }
    )

    # 2. Ensure a MembershipForm exists
    form, created = MembershipForm.objects.get_or_create(
        membership_type=m_type,
        version=1,
        defaults={
            "title": "Membership Application Form",
            "is_active": True,
        }
    )

    if not created:
        print(f"Form '{form}' already exists. Clearing existing steps and fields to recreate...")
        form.steps.all().delete()

    print("Creating Steps...")
    # 3. Create Steps
    step1 = MembershipStep.objects.create(
        form=form,
        name="Personal Details",
        slug="personal_details",
        title="Personal Details",
        display_order=1,
    )
    
    step2 = MembershipStep.objects.create(
        form=form,
        name="Professional Details",
        slug="professional_details",
        title="Professional Details",
        display_order=2,
    )

    print("Creating Fields...")
    # 4. Create Fields
    # Format: (step, field_key, label, field_type, is_required, display_order, options_list)
    fields_data = [
        # Step 1: Personal Details
        (step1, "full_name", "Full Name", "text", True, 1),
        (step1, "fathers_name", "Father's Name", "text", True, 2),
        (step1, "dob", "Date of Birth", "date", True, 3),
        (step1, "gender", "Gender", "select", True, 4, [
            {"label": "Male", "value": "male"}, 
            {"label": "Female", "value": "female"}, 
            {"label": "Other", "value": "other"}
        ]),
        (step1, "mobile", "Mobile Number", "phone", True, 5),
        (step1, "email", "Email Address", "email", True, 6),
        (step1, "address", "Permanent Address", "textarea", True, 7),
        (step1, "state", "State", "text", True, 8),
        (step1, "city", "City/District", "text", True, 9),
        (step1, "pincode", "PIN Code", "text", True, 10),
        (step1, "profile_picture", "Profile Picture", "image", False, 11),
        
        # Step 2: Professional Details
        (step2, "occupation", "Occupation", "text", True, 1),
        (step2, "qualification", "Highest Qualification", "text", True, 2),
        (step2, "organization", "Organization / Practice Name", "text", False, 3),
        (step2, "experience_years", "Years of Experience", "number", False, 4),
        (step2, "id_proof", "ID Proof Document (Aadhar/PAN)", "file", True, 5),
    ]

    for data in fields_data:
        step = data[0]
        field_key = data[1]
        label = data[2]
        field_type = data[3]
        required = data[4]
        order = data[5]
        options = data[6] if len(data) > 6 else []

        MembershipStepField.objects.create(
            step=step,
            name=label,
            field_key=field_key,
            label=label,
            field_type=field_type,
            is_required=required,
            display_order=order,
            is_active=True,
            validation_config={"options": options} if options else {}
        )

    print("✅ Membership Onboarding Form, Steps, and Fields created successfully!")

if __name__ == "__main__":
    create_membership_form_and_fields()
