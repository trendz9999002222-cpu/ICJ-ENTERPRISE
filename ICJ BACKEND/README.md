# ICJ Enterprise Platform

ICJ Enterprise Platform is a modular React + Supabase application for legal, membership,
wallet/finance, document, and governance workflows.

## Identity Recovery Workflows (TODO 01)

Implemented foundation includes:

- Forgot User ID request workflow with audited submission.
- Forgot Password request workflow with audited submission.
- Account Recovery request workflow with admin review lifecycle.
- Secure recovery token lifecycle support:
	- Token reference and SHA-256 token hash persistence.
	- Token expiry window and attempt-limits for future verification controls.
	- Dedicated recovery token storage in Supabase with RLS policies.
- Admin recovery controls in Administration UI:
	- Filter by status.
	- Transition requests through `IN_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`.
	- Save operator notes per request.
- Dedicated public recovery page at `/account-recovery`.
- Backward-compatible fallback to local storage if Supabase write fails.

## Anti-Abuse Security Controls (TODO 02)

Implemented foundation includes:

- Registration rate limiting with configurable max attempts and window.
- Login rate limiting with configurable max attempts and window.
- Brute-force detection on failed credential attempts.
- Configurable account lockout threshold and lock duration.
- Adaptive risk scoring framework with risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- Security event logging for every anti-abuse decision.
- Admin lockout controls to view locked identities and unlock accounts.
- Backward-compatible auth API behavior (no breaking changes to login/register signatures).

Auth service additions:

- `getLockedAccounts()`
- `unlockLockedAccount(identity, adminNotes)`

Security feature flags:

- `VITE_ENABLE_REGISTRATION_RATE_LIMIT`
- `VITE_ENABLE_LOGIN_RATE_LIMIT`
- `VITE_ENABLE_BRUTE_FORCE_PROTECTION`
- `VITE_ENABLE_ACCOUNT_LOCKOUT`
- `VITE_ENABLE_ADAPTIVE_RISK_SCORING`
- `VITE_ENABLE_ADAPTIVE_RISK_BLOCK`

Security thresholds:

- `VITE_AUTH_REGISTRATION_MAX_ATTEMPTS`
- `VITE_AUTH_REGISTRATION_WINDOW_MINUTES`
- `VITE_AUTH_LOGIN_MAX_ATTEMPTS`
- `VITE_AUTH_LOGIN_WINDOW_MINUTES`
- `VITE_AUTH_BRUTE_FORCE_MAX_FAILED_ATTEMPTS`
- `VITE_AUTH_BRUTE_FORCE_WINDOW_MINUTES`
- `VITE_AUTH_ACCOUNT_LOCK_FAILED_ATTEMPTS`
- `VITE_AUTH_ACCOUNT_LOCK_DURATION_MINUTES`
- `VITE_AUTH_RISK_BLOCK_THRESHOLD`

## Session Inventory and Global Revoke (TODO 03)

Implemented foundation includes:

- Enterprise session inventory with active-session lifecycle tracking.
- Session metadata capture: login time, last activity, device, browser, OS, platform, user-agent, and optional IP.
- Administrator visibility of active sessions in administration panel.
- Administrator global revoke for any active session.
- User self-service session inventory in profile page.
- User ability to revoke individual own sessions.
- User ability to logout all other devices.
- Session operation RBAC enforcement in auth service methods.
- Session event audit logging:
	- `session_created`
	- `session_activity`
	- `session_logout`
	- `session_revoked_admin`
	- `session_revoked_self`
	- `session_revoked_others`

Auth service additions:

- `getMySessions(filters)`
- `getActiveSessionsForAdmin()`
- `revokeSessionAsAdmin(sessionReference, reason)`
- `revokeOwnSession(sessionReference, reason)`
- `revokeOtherSessions(reason)`

Session feature flags:

- `VITE_ENABLE_SESSION_INVENTORY`
- `VITE_ENABLE_SESSION_GLOBAL_REVOKE`
- `VITE_AUTH_SESSION_IDLE_UPDATE_SECONDS`

## Device Registry and Trusted Device Revocation (TODO 04)

Implemented foundation includes:

- Trusted-device registry linked to authenticated session lifecycle.
- Deterministic per-user device reference generation and persistence.
- Device trust lifecycle (`TRUSTED`, `UNTRUSTED`, `REVOKED`) and risk status metadata.
- Device activity tracking with stale-device marker based on configurable inactivity threshold.
- User self-service trusted device inventory and revoke controls in profile page.
- Administrator enterprise trusted device inventory and revoke controls in administration page.
- Optional remote logout cascade for active sessions linked to revoked devices.
- Device operation RBAC enforcement in auth service methods.
- Device event audit logging:
	- `device_registered`
	- `device_activity`
	- `device_revoked_user`
	- `device_revoked_admin`
	- `device_remote_logout`

Auth service additions:

- `getMyTrustedDevices(filters)`
- `getTrustedDevicesForAdmin(filters)`
- `revokeOwnTrustedDevice(deviceReference, reason)`
- `revokeTrustedDeviceAsAdmin(deviceReference, reason)`

Device feature flags:

- `VITE_ENABLE_DEVICE_REGISTRY`
- `VITE_ENABLE_DEVICE_REMOTE_LOGOUT`
- `VITE_AUTH_DEVICE_STALE_DAYS`

## OTP Provider Policy State

OTP dispatch providers are intentionally disabled by default and remain policy-gated.

Environment flags:

- `VITE_ENABLE_EMAIL_OTP=false`
- `VITE_ENABLE_SMS_OTP=false`
- `VITE_ENABLE_WHATSAPP_OTP=false`

The workflow still captures preferred channel metadata (`email`, `sms`, `whatsapp`) so
future adapter integrations can be added without changing request contracts.

## Recovery Entry Points

- Login page recovery center: `/login`
- Full-page recovery workflow: `/account-recovery`
- Admin review controls: `/administration`

## Migrations

Relevant migrations for identity recovery:

- `supabase/migrations/20260730200000_add_identity_recovery_workflows.sql`
- `supabase/migrations/20260730213000_harden_identity_recovery_token_lifecycle.sql`

Relevant migration for anti-abuse controls:

- `supabase/migrations/20260730223000_add_anti_abuse_security_controls.sql`

Relevant migration for session inventory:

- `supabase/migrations/20260730230000_add_session_inventory_and_global_revoke.sql`

Relevant migration for trusted device registry:

- `supabase/migrations/20260730233000_add_device_registry_and_trusted_revocation.sql`

## Developer Commands

- `npm run dev`
- `npm run lint`
- `npm run build`
