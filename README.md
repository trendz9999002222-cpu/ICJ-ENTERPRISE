# ICJ Django Backend

Admin authentication foundation (JWT): login, logout, forgot/reset password.

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

## API base

`http://localhost:8000/api/v1/auth/`

See [docs/AUTH_API.md](docs/AUTH_API.md).

## Tests

```bash
pytest apps/accounts/tests/test_auth.py
```
