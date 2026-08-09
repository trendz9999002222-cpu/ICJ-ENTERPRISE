-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Identity recovery workflow foundation
-- Date: 2026-07-30
-- ============================================================

create table if not exists public.auth_recovery_requests (
  id bigserial primary key,
  request_no text unique not null,
  request_type text not null,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  mobile text,
  preferred_channel text not null default 'email',
  status text not null default 'REQUESTED',
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  otp_channel text,
  otp_reference text,
  otp_status text not null default 'NOT_TRIGGERED',
  otp_provider text,
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  admin_notes text,
  resolution_payload jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.auth_recovery_requests
  drop constraint if exists auth_recovery_requests_type_chk;

alter table public.auth_recovery_requests
  add constraint auth_recovery_requests_type_chk
  check (request_type in ('FORGOT_USER_ID', 'FORGOT_PASSWORD', 'ACCOUNT_RECOVERY'));

alter table public.auth_recovery_requests
  drop constraint if exists auth_recovery_requests_status_chk;

alter table public.auth_recovery_requests
  add constraint auth_recovery_requests_status_chk
  check (status in ('REQUESTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'));

alter table public.auth_recovery_requests
  drop constraint if exists auth_recovery_requests_channel_chk;

alter table public.auth_recovery_requests
  add constraint auth_recovery_requests_channel_chk
  check (preferred_channel in ('email', 'sms', 'whatsapp'));

alter table public.auth_recovery_requests
  drop constraint if exists auth_recovery_requests_otp_status_chk;

alter table public.auth_recovery_requests
  add constraint auth_recovery_requests_otp_status_chk
  check (otp_status in ('NOT_TRIGGERED', 'DISABLED', 'QUEUED', 'SENT', 'VERIFIED', 'FAILED'));

create index if not exists auth_recovery_requests_type_idx
  on public.auth_recovery_requests(request_type);
create index if not exists auth_recovery_requests_status_idx
  on public.auth_recovery_requests(status);
create index if not exists auth_recovery_requests_email_idx
  on public.auth_recovery_requests(lower(email));
create index if not exists auth_recovery_requests_mobile_idx
  on public.auth_recovery_requests(mobile);
create index if not exists auth_recovery_requests_requested_at_idx
  on public.auth_recovery_requests(requested_at desc);

alter table public.auth_recovery_requests enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_recovery_requests' and policyname = 'auth_recovery_requests_insert_public'
  ) then
    create policy auth_recovery_requests_insert_public on public.auth_recovery_requests
      for insert
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_recovery_requests' and policyname = 'auth_recovery_requests_select_own_or_staff'
  ) then
    create policy auth_recovery_requests_select_own_or_staff on public.auth_recovery_requests
      for select
      using (
        auth.uid() = user_id
        or (auth.jwt() ->> 'role') in ('admin', 'employee')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_recovery_requests' and policyname = 'auth_recovery_requests_update_staff'
  ) then
    create policy auth_recovery_requests_update_staff on public.auth_recovery_requests
      for update
      using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
      with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));
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
    'recovery_rejected'
  ));
