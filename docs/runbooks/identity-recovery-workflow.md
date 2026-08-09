# Identity Recovery Workflow Runbook

## Scope

This runbook covers TODO 01 implementation:

- Forgot User ID
- Forgot Password
- Account Recovery
- Admin review and approval controls
- OTP-provider-disabled operational mode

## User Flows

### 1. Forgot User ID

1. User submits email and/or mobile from login recovery center or `/account-recovery`.
2. System creates recovery request with type `FORGOT_USER_ID`.
3. System issues a secure recovery token lifecycle record (hash only, never plain token).
4. System logs audit event `forgot_user_id_request`.
5. User receives generic success response to avoid account enumeration.

### 2. Forgot Password

1. User submits email and/or mobile.
2. System creates recovery request with type `FORGOT_PASSWORD`.
3. System creates token lifecycle record with expiry and max attempts.
4. System logs audit event `forgot_password_request`.
5. Request moves to admin triage until provider-backed verification/reset is enabled.

### 3. Account Recovery

1. User submits email and/or mobile and optional reason.
2. System creates recovery request with type `ACCOUNT_RECOVERY`.
3. System creates token lifecycle record and audit event `account_recovery_request`.
4. Request is reviewed in admin panel.

## Admin Controls

Admin operations are available in `/administration`:

- Filter requests by status: `ALL`, `REQUESTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`.
- Add operator notes for each request.
- Transition statuses using action buttons.
- Every review operation writes audit metadata.

## Security Controls

- Recovery token records store `token_hash` only.
- Token metadata includes expiry and attempt limit.
- Request submission returns generic responses to minimize user enumeration risk.
- OTP providers are disabled by default and policy-gated.
- Supabase RLS governs `auth_recovery_requests` and `auth_recovery_tokens`.

## OTP Provider State

Current state:

- `VITE_ENABLE_EMAIL_OTP=false`
- `VITE_ENABLE_SMS_OTP=false`
- `VITE_ENABLE_WHATSAPP_OTP=false`

Future integration path:

1. Implement channel provider adapters in OTP service.
2. Map provider response IDs into `otp_reference` and token metadata.
3. Add token verification and password reset completion workflow.
4. Add delivery retries and observability dashboards.

## Migration Order

Apply the following in order:

1. `supabase/migrations/20260730200000_add_identity_recovery_workflows.sql`
2. `supabase/migrations/20260730213000_harden_identity_recovery_token_lifecycle.sql`

## Validation Checklist

- Submit all 3 request types from UI.
- Verify rows in `auth_recovery_requests` and `auth_recovery_tokens`.
- Verify audit events in `auth_audit_logs`.
- Verify status changes and notes from admin page.
- Verify existing login/register/profile flows still work.
