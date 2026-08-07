-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Trusted device registry and revocation controls
-- Date: 2026-07-30
-- ============================================================

create table if not exists public.auth_trusted_devices (
  id bigserial primary key,
  device_reference text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  device_name text,
  browser_name text,
  os_name text,
  device_type text,
  first_login_at timestamptz not null default timezone('utc'::text, now()),
  last_login_at timestamptz not null default timezone('utc'::text, now()),
  last_activity_at timestamptz not null default timezone('utc'::text, now()),
  trust_status text not null default 'TRUSTED',
  risk_status text not null default 'LOW',
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revoke_reason text,
  user_agent text,
  platform text,
  language text,
  timezone text,
  ip_address text,
  client_fingerprint text,
  mfa_required boolean not null default false,
  mfa_enrolled boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique(device_reference, user_id)
);

alter table public.auth_trusted_devices
  drop constraint if exists auth_trusted_devices_trust_status_chk;

alter table public.auth_trusted_devices
  add constraint auth_trusted_devices_trust_status_chk
  check (trust_status in ('TRUSTED', 'UNTRUSTED', 'REVOKED'));

alter table public.auth_trusted_devices
  drop constraint if exists auth_trusted_devices_risk_status_chk;

alter table public.auth_trusted_devices
  add constraint auth_trusted_devices_risk_status_chk
  check (risk_status in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

create index if not exists auth_trusted_devices_user_idx
  on public.auth_trusted_devices(user_id);
create index if not exists auth_trusted_devices_reference_idx
  on public.auth_trusted_devices(device_reference);
create index if not exists auth_trusted_devices_activity_idx
  on public.auth_trusted_devices(last_activity_at desc);
create index if not exists auth_trusted_devices_trust_idx
  on public.auth_trusted_devices(trust_status);
create index if not exists auth_trusted_devices_email_idx
  on public.auth_trusted_devices(lower(email));

alter table public.auth_trusted_devices enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_trusted_devices' and policyname = 'auth_trusted_devices_select_own_or_staff'
  ) then
    create policy auth_trusted_devices_select_own_or_staff on public.auth_trusted_devices
      for select
      using (
        auth.uid() = user_id
        or (auth.jwt() ->> 'role') in ('admin', 'employee')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_trusted_devices' and policyname = 'auth_trusted_devices_insert_owner_or_staff'
  ) then
    create policy auth_trusted_devices_insert_owner_or_staff on public.auth_trusted_devices
      for insert
      with check (
        auth.uid() = user_id
        or (auth.jwt() ->> 'role') in ('admin', 'employee')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_trusted_devices' and policyname = 'auth_trusted_devices_update_owner_or_staff'
  ) then
    create policy auth_trusted_devices_update_owner_or_staff on public.auth_trusted_devices
      for update
      using (
        auth.uid() = user_id
        or (auth.jwt() ->> 'role') in ('admin', 'employee')
      )
      with check (
        auth.uid() = user_id
        or (auth.jwt() ->> 'role') in ('admin', 'employee')
      );
  end if;
end $$;

alter table public.auth_session_inventory
  add column if not exists device_reference text;

alter table public.auth_session_inventory
  add column if not exists device_name text;

alter table public.auth_session_inventory
  add column if not exists device_trust_status text not null default 'TRUSTED';

alter table public.auth_session_inventory
  add column if not exists device_risk_status text not null default 'LOW';

create index if not exists auth_session_inventory_device_reference_idx
  on public.auth_session_inventory(device_reference);

alter table public.auth_session_inventory
  drop constraint if exists auth_session_inventory_device_trust_status_chk;

alter table public.auth_session_inventory
  add constraint auth_session_inventory_device_trust_status_chk
  check (device_trust_status in ('TRUSTED', 'UNTRUSTED', 'REVOKED'));

alter table public.auth_session_inventory
  drop constraint if exists auth_session_inventory_device_risk_status_chk;

alter table public.auth_session_inventory
  add constraint auth_session_inventory_device_risk_status_chk
  check (device_risk_status in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

alter table public.auth_audit_logs
  drop constraint if exists auth_audit_logs_action_chk;

alter table public.auth_audit_logs
  add constraint auth_audit_logs_action_chk
  check (action in (
    'registration',
    'login',
    'logout',
    'password_change',
    'profile_update',
    'forgot_user_id_request',
    'forgot_password_request',
    'account_recovery_request',
    'recovery_review',
    'recovery_approved',
    'recovery_rejected',
    'security_registration_rate_limited',
    'security_login_rate_limited',
    'security_bruteforce_detected',
    'security_account_lockout',
    'security_account_unlocked',
    'security_risk_scored',
    'security_login_failed',
    'security_login_success',
    'session_created',
    'session_activity',
    'session_logout',
    'session_revoked_admin',
    'session_revoked_self',
    'session_revoked_others',
    'device_registered',
    'device_activity',
    'device_revoked_user',
    'device_revoked_admin',
    'device_remote_logout'
  ));
