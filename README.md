# ICJ Django Backend

Admin authentication foundation (JWT), User Management, and Dynamic Professional Onboarding System.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py create_default_admin
python manage.py runserver 8000
```

If `migrate` fails with inconsistent migration history (old DB), use a fresh database or reset migrations on a dev DB only.

## API Documentation

For the complete reference of all REST API endpoints (Auth, Admin User Management, Public Onboarding, Admin Onboarding Hierarchy & Registrations), see:
- [API Documentation (API_README.md)](API_README.md)
- [Auth API Docs](docs/AUTH_API.md)

## API Base URLs

- Health Check: `http://localhost:8000/api/v1/health/`
- Authentication: `http://localhost:8000/api/v1/auth/`
- Admin User Management: `http://localhost:8000/api/v1/admin/users/`
- Public Onboarding: `http://localhost:8000/api/v1/professional-onboarding/`
- Admin Onboarding & Registrations: `http://localhost:8000/api/v1/admin/professional-onboarding/`

## Tests

```bash
pytest apps/accounts/tests/test_auth.py
```
