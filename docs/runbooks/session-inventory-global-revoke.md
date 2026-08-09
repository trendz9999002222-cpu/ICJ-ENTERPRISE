# Session Inventory and Global Revoke Runbook

## Scope

This runbook covers TODO 03 implementation:

- Session inventory tracking
- Active session visibility for administrators
- User self-session controls
- Global revoke workflows
- Session audit telemetry and RBAC guardrails

## Configuration

Configured in:

- `src/config/auth.config.js`
- `.env.example`

Flags:

- `VITE_ENABLE_SESSION_INVENTORY`
- `VITE_ENABLE_SESSION_GLOBAL_REVOKE`
- `VITE_AUTH_SESSION_IDLE_UPDATE_SECONDS`

## Data Model

Migration:

- `supabase/migrations/20260730230000_add_session_inventory_and_global_revoke.sql`

Table:

- `auth_session_inventory`

Tracked fields include:

- `session_reference`
- `user_id`, `email`
- `login_at`, `last_activity_at`
- `status`, `logout_at`, `revoked_at`, `revoked_by`, `revoke_reason`
- `device_type`, `browser_name`, `os_name`, `user_agent`
- `platform`, `language`, `timezone`
- `ip_address` (when available)
- `client_fingerprint`

## Session Status Lifecycle

- `ACTIVE`
- `LOGGED_OUT`
- `REVOKED`
- `EXPIRED`

## Service Methods

In `src/services/authService.js`:

- `getMySessions(filters)`
- `getActiveSessionsForAdmin()`
- `revokeSessionAsAdmin(sessionReference, reason)`
- `revokeOwnSession(sessionReference, reason)`
- `revokeOtherSessions(reason)`

## RBAC Permissions

Catalog entries:

- `session.view.own`
- `session.revoke.own`
- `session.revoke.others`
- `session.view.all`
- `session.revoke.any`

Behavior:

- Users can view/revoke only own sessions.
- Admin-capable roles can view/revoke any active session.

## UI Coverage

- Administration page shows enterprise active session inventory with revoke controls.
- Profile page shows user session inventory with individual revoke and logout-other-devices actions.

## Audit Events

- `session_created`
- `session_activity`
- `session_logout`
- `session_revoked_admin`
- `session_revoked_self`
- `session_revoked_others`

## Validation Steps

1. Login from one browser profile and verify `session_created`.
2. Login from another profile and verify second active session.
3. Open profile page and verify own sessions list.
4. Revoke one own session and verify status transition to `REVOKED`.
5. Use logout-all-other-devices and verify remaining sessions are revoked.
6. Open administration page as admin and verify active sessions table.
7. Revoke a user session from admin and verify audit event.
8. Confirm `npm run lint` and `npm run build` pass.
