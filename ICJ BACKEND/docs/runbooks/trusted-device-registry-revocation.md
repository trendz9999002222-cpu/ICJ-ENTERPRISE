# Trusted Device Registry and Revocation Runbook

## Scope

This runbook covers TODO 04 implementation:

- Trusted device inventory tracking
- Trust lifecycle transitions
- User and admin revoke workflows
- Device-linked session remote logout
- Device audit telemetry and RBAC guardrails

## Configuration

Configured in:

- `src/config/auth.config.js`
- `.env.example`

Flags:

- `VITE_ENABLE_DEVICE_REGISTRY`
- `VITE_ENABLE_DEVICE_REMOTE_LOGOUT`
- `VITE_AUTH_DEVICE_STALE_DAYS`

## Data Model

Migration:

- `supabase/migrations/20260730233000_add_device_registry_and_trusted_revocation.sql`

Tables:

- `auth_trusted_devices`
- `auth_session_inventory` (extended with device linkage columns)

Tracked trusted device fields include:

- `device_reference`
- `user_id`, `email`
- `device_name`, `device_type`, `browser_name`, `os_name`
- `trust_status`, `risk_status`
- `first_login_at`, `last_login_at`, `last_activity_at`
- `revoked_at`, `revoked_by`, `revoke_reason`
- `ip_address`, `client_fingerprint`, `user_agent`, `platform`

## Trust Lifecycle

- `TRUSTED`
- `UNTRUSTED`
- `REVOKED`

## Service Methods

In `src/services/authService.js`:

- `getMyTrustedDevices(filters)`
- `getTrustedDevicesForAdmin(filters)`
- `revokeOwnTrustedDevice(deviceReference, reason)`
- `revokeTrustedDeviceAsAdmin(deviceReference, reason)`

## RBAC Permissions

Catalog entries:

- `device.view.own`
- `device.revoke.own`
- `device.view.all`
- `device.revoke.any`

Behavior:

- Users can view and revoke only their own trusted devices.
- Admin-capable roles can view and revoke trusted devices across users.

## UI Coverage

- Profile page shows trusted devices with self-revoke controls.
- Administration page shows enterprise trusted devices with admin revoke controls.

## Remote Logout Cascade

When device remote logout is enabled:

- Revoking a trusted device also revokes active sessions linked by `device_reference`.
- Cascade behavior is controlled by `VITE_ENABLE_DEVICE_REMOTE_LOGOUT`.

## Audit Events

- `device_registered`
- `device_activity`
- `device_revoked_user`
- `device_revoked_admin`
- `device_remote_logout`

## Validation Steps

1. Login from a device and verify trusted device registration.
2. Confirm profile page shows the trusted device entry.
3. Login from a second device and verify both entries appear.
4. Revoke one device from profile and verify trust status changes to `REVOKED`.
5. Verify linked active sessions are revoked when remote logout is enabled.
6. Revoke another device from administration page as admin.
7. Confirm relevant events are inserted into `auth_audit_logs`.
8. Confirm `npm run lint` and `npm run build` pass.
