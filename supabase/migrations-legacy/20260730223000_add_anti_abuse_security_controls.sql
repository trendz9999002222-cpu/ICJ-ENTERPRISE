-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Anti-abuse security controls foundation
-- Date: 2026-07-30
-- ============================================================

create table if not exists public.auth_security_controls (
  id bigserial primary key,
  identity_key text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  mobile text,
  registration_attempt_count integer not null default 0,
  registration_window_started_at timestamptz,
  login_attempt_count integer not null default 0,
  login_window_started_at timestamptz,
  failed_login_attempt_count integer not null default 0,
  failed_window_started_at timestamptz,
  lockout_until timestamptz,
  last_risk_score integer not null default 0,
  last_risk_level text not null default 'LOW',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.auth_security_controls
  drop constraint if exists auth_security_controls_risk_level_chk;

alter table public.auth_security_controls
  add constraint auth_security_controls_risk_level_chk
  check (last_risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

create index if not exists auth_security_controls_user_idx
  on public.auth_security_controls(user_id);
create index if not exists auth_security_controls_lockout_idx
  on public.auth_security_controls(lockout_until desc);
create index if not exists auth_security_controls_email_idx
  on public.auth_security_controls(lower(email));

alter table public.auth_security_controls enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_security_controls' and policyname = 'auth_security_controls_select_own_or_staff'
  ) then
    create policy auth_security_controls_select_own_or_staff on public.auth_security_controls
      for select
      using (
        auth.uid() = user_id
        or (auth.jwt() ->> 'role') in ('admin', 'employee')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_security_controls' and policyname = 'auth_security_controls_insert_public'
  ) then
    create policy auth_security_controls_insert_public on public.auth_security_controls
      for insert
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_security_controls' and policyname = 'auth_security_controls_update_staff_or_owner'
  ) then
    create policy auth_security_controls_update_staff_or_owner on public.auth_security_controls
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
    'security_login_success'
  ));
