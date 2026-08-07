-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Session inventory and global revoke foundation
-- Date: 2026-07-30
-- ============================================================

create table if not exists public.auth_session_inventory (
  id bigserial primary key,
  session_reference text unique not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  status text not null default 'ACTIVE',
  login_at timestamptz not null default timezone('utc'::text, now()),
  last_activity_at timestamptz not null default timezone('utc'::text, now()),
  logout_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revoke_reason text,
  device_type text,
  browser_name text,
  os_name text,
  user_agent text,
  platform text,
  language text,
  timezone text,
  ip_address text,
  client_fingerprint text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.auth_session_inventory
  drop constraint if exists auth_session_inventory_status_chk;

alter table public.auth_session_inventory
  add constraint auth_session_inventory_status_chk
  check (status in ('ACTIVE', 'REVOKED', 'LOGGED_OUT', 'EXPIRED'));

create index if not exists auth_session_inventory_user_idx
  on public.auth_session_inventory(user_id);
create index if not exists auth_session_inventory_status_idx
  on public.auth_session_inventory(status);
create index if not exists auth_session_inventory_activity_idx
  on public.auth_session_inventory(last_activity_at desc);
create index if not exists auth_session_inventory_email_idx
  on public.auth_session_inventory(lower(email));

alter table public.auth_session_inventory enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_session_inventory' and policyname = 'auth_session_inventory_select_own_or_staff'
  ) then
    create policy auth_session_inventory_select_own_or_staff on public.auth_session_inventory
      for select
      using (
        auth.uid() = user_id
        or (auth.jwt() ->> 'role') in ('admin', 'employee')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_session_inventory' and policyname = 'auth_session_inventory_insert_owner_or_staff'
  ) then
    create policy auth_session_inventory_insert_owner_or_staff on public.auth_session_inventory
      for insert
      with check (
        auth.uid() = user_id
        or (auth.jwt() ->> 'role') in ('admin', 'employee')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_session_inventory' and policyname = 'auth_session_inventory_update_owner_or_staff'
  ) then
    create policy auth_session_inventory_update_owner_or_staff on public.auth_session_inventory
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
    'security_login_success',
    'session_created',
    'session_activity',
    'session_logout',
    'session_revoked_admin',
    'session_revoked_self',
    'session_revoked_others'
  ));
