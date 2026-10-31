# ICJ Django Backend

Enterprise Django REST API powering authentication (JWT), dynamic schema-driven form configuration, member registry, citizen legal aid requests, and professional empanelment.

---

## Quick Setup & Database Migrations

```bash
# 1. Environment setup
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 2. Database migrations
python manage.py makemigrations
python manage.py migrate
python manage.py create_default_admin

# 3. Seed Core Onboarding Forms & Master Common Fields
python manage.py init_onboarding_forms
python manage.py seed_common_fields
python manage.py configure_professional_form
python manage.py configure_membership_form

# 4. Seed App-Specific Flows & Catalogs
python manage.py seed_professional_onboarding
python manage.py seed_membership_onboarding
python manage.py seed_services
python manage.py seed_seek_assistance

# 5. Start development server
python manage.py runserver 8000
```

---

## Dynamic Form & Field Architecture (Admin Controllable)

All public forms in the ICJ platform are driven by admin configuration:

### 1. Master Common Fields (`CommonField`)
- Central catalog for shared fields across all forms: Full Name, Email, Mobile, Gender, Date of Birth, State, City, PIN Code, Address.
- Linked to forms via `FormFieldConfig` (`AdditionalOnboardingFormfields.FormCode`).
- Admin toggles: `is_visible`, `is_required`, `display_order`, `label_override`.

### 2. Seek Assistance Desk (`SEEKER_ASSISTANT`)
- **Public Config Endpoint:** `GET /api/v1/services/form-config/`
  Returns active `citizen_fields`, `legal_matter_fields`, and `documents`.
- **Public Submission:** `POST /api/v1/services/seek-assistance/`
  Multipart `FormData` supporting `profile_picture`, case details, and multiple evidence files.
- **Admin Management:**
  - Common Fields: `/admin/services/form-fields/`
  - Re-seed command: `python manage.py seed_seek_assistance`

### 3. Member Onboarding & Registration (`MEMBERSHIP`)
- **Public Registration:** `POST /api/v1/auth/register/`
  Supports `profile_picture` (saved directly to `user.profile_picture`), mobile with international country codes, and email verification.

### 4. Professional Empanelment Roster (`PROFESSIONAL`)
- **Public Config:** `GET /api/v1/onboarding/professional/professions/<id>/configuration/`
- **Role Tabs:**
  - **Legal Professional:** Bar Council Number, State Bar Council, Enrollment Year, Courts of Practice.
  - **Other Professional (CA / CS / Finance):** ICAI / ICSI Number, Firm Name.
  - **Volunteer / Para-legal:** Cause Interest, Social Service Experience.
- Admin customizes fields per profession in Admin Dashboard under *Professional Onboarding*.

---

## Profile Picture / Passport Photo Uploads

Profile picture and passport photograph uploads are universally handled:
- Supported Formats: JPEG, PNG, WEBP (Max 5MB).
- Keys Accepted: `profile_picture`, `photo`, `passport_photo`.
- Automatically assigned to `user.profile_picture` during registration and preserved as `CaseDocument` on citizen legal assistance requests.

---

## API Base Endpoints

- Health Check: `http://localhost:8000/api/v1/health/`
- Auth & Registration: `http://localhost:8000/api/v1/auth/`
- Services & Assistance Config: `http://localhost:8000/api/v1/services/`
- Professional Onboarding: `http://localhost:8000/api/v1/professional-onboarding/`
- Membership Onboarding: `http://localhost:8000/api/v1/membership-onboarding/`
- Honorable Advisory: `http://localhost:8000/api/v1/honorable-advisory/`
