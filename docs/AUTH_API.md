# ICJ Authentication API (`/api/v1/auth/`)

Common JWT authentication for all roles. Admin access is enforced by **role** on protected admin APIs (not by email).

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/login/` | No |
| POST | `/logout/` | Bearer + refresh body |
| POST | `/forgot-password/` | No |
| POST | `/reset-password/` | No |
| POST | `/change-password/` | Bearer |
| POST | `/refresh/` | Refresh token |
| GET | `/me/` | Bearer |

## Response envelope

```json
{ "success": true, "message": "...", "data": {} }
```

Login also returns top-level `access`, `refresh`, `user`, `requires_password_change`.

## Forgot / reset flow

1. `POST /forgot-password/` with `{ "email": "..." }` — always same generic message (no enumeration).
2. Email contains link: `{FRONTEND_PASSWORD_RESET_URL}?token=...`
3. `POST /reset-password/` with `token`, `new_password`, `confirm_password`.
4. Token is single-use, hashed in DB, expires per `PASSWORD_RESET_TIMEOUT_SECONDS`.

## Bootstrap

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py create_default_admin
```

## Tests

```bash
pytest apps/accounts/tests/test_auth.py
```
