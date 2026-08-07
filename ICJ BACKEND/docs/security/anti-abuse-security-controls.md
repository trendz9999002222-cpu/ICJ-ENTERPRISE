# Anti-Abuse Security Controls Runbook

## Scope

This runbook documents TODO 02 implementation:

- Registration rate limiting
- Login rate limiting
- Brute-force protection
- Configurable account lockout
- Adaptive risk scoring
- Security event audit logging
- Admin unlock controls

## Implementation Components

### 1. Configuration

Configured in:

- `src/config/auth.config.js`
- `.env.example`

Feature flags:

- `VITE_ENABLE_REGISTRATION_RATE_LIMIT`
- `VITE_ENABLE_LOGIN_RATE_LIMIT`
- `VITE_ENABLE_BRUTE_FORCE_PROTECTION`
- `VITE_ENABLE_ACCOUNT_LOCKOUT`
- `VITE_ENABLE_ADAPTIVE_RISK_SCORING`
- `VITE_ENABLE_ADAPTIVE_RISK_BLOCK`

Thresholds:

- `VITE_AUTH_REGISTRATION_MAX_ATTEMPTS`
- `VITE_AUTH_REGISTRATION_WINDOW_MINUTES`
- `VITE_AUTH_LOGIN_MAX_ATTEMPTS`
- `VITE_AUTH_LOGIN_WINDOW_MINUTES`
- `VITE_AUTH_BRUTE_FORCE_MAX_FAILED_ATTEMPTS`
- `VITE_AUTH_BRUTE_FORCE_WINDOW_MINUTES`
- `VITE_AUTH_ACCOUNT_LOCK_FAILED_ATTEMPTS`
- `VITE_AUTH_ACCOUNT_LOCK_DURATION_MINUTES`
- `VITE_AUTH_RISK_BLOCK_THRESHOLD`

### 2. Service Layer

Primary orchestration:

- `src/services/authService.js`

Behavior:

- Preserves existing `register` and `login` method contracts.
- Applies pre-auth checks for rate limits and lockout state.
- Applies post-failure brute-force counters and lockout activation.
- Applies risk scoring and optional risk blocking.
- Provides admin APIs:
  - `getLockedAccounts()`
  - `unlockLockedAccount(identity, adminNotes)`

### 3. Audit Logging

Audit service:

- `src/services/auditLogService.js`

Security actions logged:

- `security_registration_rate_limited`
- `security_login_rate_limited`
- `security_bruteforce_detected`
- `security_account_lockout`
- `security_account_unlocked`
- `security_risk_scored`
- `security_login_failed`
- `security_login_success`

## Database Support

Migration:

- `supabase/migrations/20260730223000_add_anti_abuse_security_controls.sql`

Objects added:

- `auth_security_controls` table
- RLS policies for own/staff visibility and updates
- audit action constraint extension for new security events

## Administration Controls

UI location:

- `/administration`

Capabilities:

- View locked identities with lockout expiry and risk indicators
- Add admin notes
- Unlock locked account state

## Backward Compatibility

- Existing auth APIs remain stable.
- Existing login/register flows still function when security controls are disabled.
- Supabase write failures degrade to local-storage fallback state.

## Validation Checklist

- Trigger registration rate limit and verify block.
- Trigger login rate limit and verify block.
- Trigger failed-login threshold and verify lockout.
- Confirm lockout duration expiration behavior.
- Confirm security events in `auth_audit_logs`.
- Unlock from admin UI and verify access restoration.
- Confirm `npm run lint` and `npm run build` pass.
