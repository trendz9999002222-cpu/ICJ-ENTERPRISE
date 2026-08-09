# ICJ Enterprise Platform - Staging Deployment Checklist

## 1. Environment Variables
- [ ] Create `.env.staging` from `.env.example`.
- [ ] Set `VITE_APP_BASE_PATH` to `/` or staging subpath (for example `/icj/`).
- [ ] Set `VITE_BUILD_SOURCEMAP=false` (or `true` only if required for debugging).
- [ ] Set `VITE_ENABLE_SUPABASE=true`.
- [ ] Set `VITE_SUPABASE_URL` with staging Supabase project URL.
- [ ] Set `VITE_SUPABASE_PUBLISHABLE_KEY` with staging publishable key.
- [ ] Set `VITE_ENABLE_MOCK_AUTH=false`.
- [ ] Set `VITE_AUTH_STRICT_MODE=true`.

## 2. Build and Routing
- [ ] Confirm `vite.config.js` base path resolves from `VITE_APP_BASE_PATH`.
- [ ] Confirm router basename uses `import.meta.env.BASE_URL`.
- [ ] Run `npm run lint` and ensure no errors.
- [ ] Run `npm run build` and ensure successful output in `dist/`.

## 3. Assets and Static Delivery
- [ ] Ensure static host rewrites all app routes to `index.html`.
- [ ] Ensure `dist/assets/` files are served with correct cache headers.
- [ ] Verify `index.html` and hashed assets are uploaded from latest build.

## 4. Database and Migrations
- [ ] Verify all required migration files exist in `supabase/migrations/`.
- [ ] Apply migrations to staging Supabase environment.
- [ ] Confirm RLS/policy migrations are applied for core, token, legal, and document tables.
- [ ] Validate expected tables: members, wallets, tokens, donations, legal_cases, documents, reports, system_settings.

## 5. Authentication and Session
- [ ] Validate Supabase auth provider is active in staging.
- [ ] Verify login/register flow with staging users.
- [ ] Verify session restore and logout behavior.
- [ ] Confirm no mock accounts are auto-seeded in staging.
- [ ] Verify identity recovery requests can be submitted from `/login` and `/account-recovery`.
- [ ] Confirm recovery requests are persisted in `auth_recovery_requests`.
- [ ] Confirm recovery token lifecycle rows are persisted in `auth_recovery_tokens`.
- [ ] Validate admin review actions (`IN_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`) in `/administration`.
- [ ] Confirm auth audit rows exist for recovery events in `auth_audit_logs`.
- [ ] Confirm OTP providers remain disabled unless governance approval enables env flags.
- [ ] Verify registration rate limiting thresholds and block responses.
- [ ] Verify login rate limiting thresholds and block responses.
- [ ] Verify brute-force detection and account lockout behavior.
- [ ] Verify account unlock action in `/administration` clears lockout state.
- [ ] Confirm anti-abuse control rows exist in `auth_security_controls`.
- [ ] Confirm anti-abuse security events exist in `auth_audit_logs`.
- [ ] Verify active sessions are persisted in `auth_session_inventory` after login.
- [ ] Verify user can view own sessions in `/profile`.
- [ ] Verify user can revoke individual own session.
- [ ] Verify user can logout all other devices.
- [ ] Verify admin can view all active sessions in `/administration`.
- [ ] Verify admin can revoke any active session from session inventory.
- [ ] Confirm session lifecycle events exist in `auth_audit_logs`.
- [ ] Verify trusted devices are persisted in `auth_trusted_devices` after login/session restore.
- [ ] Verify user can view own trusted devices in `/profile`.
- [ ] Verify user can revoke own trusted device from `/profile`.
- [ ] Verify admin can view trusted devices in `/administration`.
- [ ] Verify admin can revoke any trusted device from `/administration`.
- [ ] Verify remote logout cascade revokes active device-linked sessions when a device is revoked.
- [ ] Confirm trusted-device lifecycle events exist in `auth_audit_logs`.

## 6. Services and API Readiness
- [ ] Verify `SUPABASE_ENABLED` resolves `true` at runtime.
- [ ] Verify service calls in membership/finance/wallet/token/legal/documents/reports use staging database.
- [ ] Verify AI foundation remains in internal-foundation mode (no external provider calls).

## 7. Pre-Deployment Validation Commands
- [ ] `npm ci` (clean install in CI environment).
- [ ] `npm run lint`
- [ ] `npm run build`

## 8. Deployment Completion Gate
- [ ] Staging URL loads without console/runtime errors.
- [ ] Route refresh works for nested paths.
- [ ] Core modules authenticate and load data from staging Supabase.
- [ ] Deployment artifacts and environment variables are documented.
