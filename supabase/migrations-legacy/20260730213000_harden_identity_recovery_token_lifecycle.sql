-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Harden identity recovery token lifecycle
-- Date: 2026-07-30
-- ============================================================

create table if not exists public.auth_recovery_tokens (
  id bigserial primary key,
  request_no text not null references public.auth_recovery_requests(request_no) on delete cascade,
  request_type text not null,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  mobile text,
  preferred_channel text not null default 'email',
  token_reference text unique not null,
  token_hash text not null,
  status text not null default 'ACTIVE',
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.auth_recovery_tokens
  drop constraint if exists auth_recovery_tokens_request_type_chk;

alter table public.auth_recovery_tokens
  add constraint auth_recovery_tokens_request_type_chk
  check (request_type in ('FORGOT_USER_ID', 'FORGOT_PASSWORD', 'ACCOUNT_RECOVERY'));

alter table public.auth_recovery_tokens
  drop constraint if exists auth_recovery_tokens_preferred_channel_chk;

alter table public.auth_recovery_tokens
  add constraint auth_recovery_tokens_preferred_channel_chk
  check (preferred_channel in ('email', 'sms', 'whatsapp'));

alter table public.auth_recovery_tokens
  drop constraint if exists auth_recovery_tokens_status_chk;

alter table public.auth_recovery_tokens
  add constraint auth_recovery_tokens_status_chk
  check (status in ('ACTIVE', 'EXPIRED', 'REVOKED', 'CONSUMED', 'FAILED'));

create index if not exists auth_recovery_tokens_request_no_idx
  on public.auth_recovery_tokens(request_no);
create index if not exists auth_recovery_tokens_status_idx
  on public.auth_recovery_tokens(status);
create index if not exists auth_recovery_tokens_expires_at_idx
  on public.auth_recovery_tokens(expires_at);

alter table public.auth_recovery_tokens enable row level security;

alter table public.auth_recovery_requests
  drop constraint if exists auth_recovery_requests_status_chk;

alter table public.auth_recovery_requests
  add constraint auth_recovery_requests_status_chk
  check (status in ('REQUESTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'));

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_recovery_tokens' and policyname = 'auth_recovery_tokens_insert_public'
  ) then
    create policy auth_recovery_tokens_insert_public on public.auth_recovery_tokens
      for insert
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_recovery_tokens' and policyname = 'auth_recovery_tokens_select_own_or_staff'
  ) then
    create policy auth_recovery_tokens_select_own_or_staff on public.auth_recovery_tokens
      for select
      using (
        auth.uid() = user_id
        or (auth.jwt() ->> 'role') in ('admin', 'employee')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_recovery_tokens' and policyname = 'auth_recovery_tokens_update_staff'
  ) then
    create policy auth_recovery_tokens_update_staff on public.auth_recovery_tokens
      for update
      using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
      with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));
  end if;
end $$;
