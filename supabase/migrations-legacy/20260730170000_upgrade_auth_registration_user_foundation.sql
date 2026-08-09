-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Upgrade registration, authentication, and user foundation
-- Date: 2026-07-30
-- ============================================================

create extension if not exists "pgcrypto";

create sequence if not exists public.icj_user_id_seq start with 1 increment by 1;

create or replace function public.generate_icj_user_id()
returns text
language plpgsql
as $$
declare
  seq_value bigint;
begin
  seq_value := nextval('public.icj_user_id_seq');
  return 'ICJ-' || to_char(now(), 'YYYY') || '-' || lpad(seq_value::text, 6, '0');
end;
$$;

alter table public.profiles
  add column if not exists user_id text,
  add column if not exists profile_photo text,
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists pin_code text,
  add column if not exists referral_code text,
  add column if not exists referred_by text,
  add column if not exists status text default 'Pending';

alter table public.profiles
  alter column mobile_verified set default false,
  alter column email_verified set default false,
  alter column is_mobile_verified set default false,
  alter column is_email_verified set default false,
  alter column status set default 'Pending';

-- Populate missing profile rows for users created before this migration.
insert into public.profiles (
  id,
  user_id,
  member_id,
  full_name,
  email,
  mobile,
  member_type,
  role,
  role_code,
  role_category,
  legacy_role,
  status,
  verification_status,
  mobile_verified,
  email_verified,
  is_mobile_verified,
  is_email_verified,
  created_at,
  updated_at
)
select
  u.id,
  public.generate_icj_user_id(),
  null,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(coalesce(u.email, ''), '@', 1)),
  lower(u.email),
  nullif(regexp_replace(coalesce(u.raw_user_meta_data ->> 'mobile', ''), '\\D', '', 'g'), ''),
  coalesce(u.raw_user_meta_data ->> 'member_type', 'Individual'),
  coalesce(u.raw_user_meta_data ->> 'role', 'member'),
  coalesce(u.raw_user_meta_data ->> 'role_code', 'member'),
  coalesce(u.raw_user_meta_data ->> 'role_category', 'community'),
  coalesce(u.raw_user_meta_data ->> 'legacy_role', 'member'),
  'Pending',
  'Pending',
  false,
  false,
  false,
  false,
  coalesce(u.created_at, timezone('utc'::text, now())),
  timezone('utc'::text, now())
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Normalize existing profile fields without breaking prior data.
update public.profiles p
set
  email = coalesce(nullif(lower(p.email), ''), lower(u.email)),
  mobile = case
    when p.mobile is null then null
    when length(regexp_replace(p.mobile, '\\D', '', 'g')) = 12 and regexp_replace(p.mobile, '\\D', '', 'g') like '91%' then substr(regexp_replace(p.mobile, '\\D', '', 'g'), 3, 10)
    when length(regexp_replace(p.mobile, '\\D', '', 'g')) = 11 and regexp_replace(p.mobile, '\\D', '', 'g') like '0%' then substr(regexp_replace(p.mobile, '\\D', '', 'g'), 2, 10)
    else nullif(regexp_replace(p.mobile, '\\D', '', 'g'), '')
  end,
  full_name = coalesce(nullif(p.full_name, ''), u.raw_user_meta_data ->> 'full_name'),
  country = coalesce(nullif(p.country, ''), 'India'),
  user_id = coalesce(nullif(p.user_id, ''), public.generate_icj_user_id()),
  member_id = coalesce(nullif(p.member_id, ''), nullif(p.user_id, ''), public.generate_icj_user_id()),
  status = case
    when p.status is null or btrim(p.status) = '' then 'Pending'
    when lower(p.status) = 'active' then 'Active'
    when lower(p.status) = 'pending' then 'Pending'
    when lower(p.status) = 'suspended' then 'Suspended'
    when lower(p.status) = 'rejected' then 'Rejected'
    else 'Pending'
  end,
  verification_status = coalesce(nullif(p.verification_status, ''), 'Pending'),
  mobile_verified = coalesce(p.mobile_verified, p.is_mobile_verified, false),
  email_verified = coalesce(p.email_verified, p.is_email_verified, false),
  is_mobile_verified = coalesce(p.is_mobile_verified, p.mobile_verified, false),
  is_email_verified = coalesce(p.is_email_verified, p.email_verified, false),
  updated_at = timezone('utc'::text, now())
from auth.users u
where u.id = p.id;

update public.profiles
set member_id = user_id
where (member_id is null or btrim(member_id) = '')
  and user_id is not null
  and btrim(user_id) <> '';

-- Table constraints for enterprise user status and profile identity.
alter table public.profiles
  drop constraint if exists profiles_status_chk;

alter table public.profiles
  add constraint profiles_status_chk
  check (status in ('Pending', 'Active', 'Suspended', 'Rejected'));

create unique index if not exists profiles_user_id_unique_idx
  on public.profiles(user_id)
  where user_id is not null and btrim(user_id) <> '';

-- Enforce unique email only when no duplicate legacy emails exist.
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'profiles_email_unique_idx'
  ) then
    if not exists (
      select 1
      from public.profiles
      where email is not null and btrim(email) <> ''
      group by lower(email)
      having count(*) > 1
    ) then
      execute $sql$
        create unique index profiles_email_unique_idx
        on public.profiles(lower(email))
        where email is not null and btrim(email) <> ''
      $sql$;
    end if;
  end if;
end $$;

-- Keep mobile uniqueness from previous migration, fallback if not present yet.
create unique index if not exists profiles_mobile_unique_idx
  on public.profiles(mobile)
  where mobile is not null and btrim(mobile) <> '';

create or replace function public.normalize_profile_identity()
returns trigger
language plpgsql
as $$
begin
  if new.email is not null then
    new.email := lower(btrim(new.email));
  end if;

  if new.mobile is not null then
    new.mobile := regexp_replace(new.mobile, '\\D', '', 'g');
    if length(new.mobile) = 12 and new.mobile like '91%' then
      new.mobile := substr(new.mobile, 3, 10);
    elsif length(new.mobile) = 11 and new.mobile like '0%' then
      new.mobile := substr(new.mobile, 2, 10);
    end if;
  end if;

  if new.status is null or btrim(new.status) = '' then
    new.status := 'Pending';
  else
    new.status := initcap(lower(new.status));
  end if;

  if new.status not in ('Pending', 'Active', 'Suspended', 'Rejected') then
    raise exception 'Invalid profile status: %', new.status;
  end if;

  new.mobile_verified := coalesce(new.mobile_verified, new.is_mobile_verified, false);
  new.email_verified := coalesce(new.email_verified, new.is_email_verified, false);
  new.is_mobile_verified := coalesce(new.is_mobile_verified, new.mobile_verified, false);
  new.is_email_verified := coalesce(new.is_email_verified, new.email_verified, false);

  if new.user_id is null or btrim(new.user_id) = '' then
    new.user_id := public.generate_icj_user_id();
  end if;

  if new.member_id is null or btrim(new.member_id) = '' then
    new.member_id := new.user_id;
  end if;

  if new.updated_at is null then
    new.updated_at := timezone('utc'::text, now());
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_identity_normalization on public.profiles;
create trigger trg_profiles_identity_normalization
before insert or update on public.profiles
for each row
execute function public.normalize_profile_identity();

create or replace function public.handle_auth_user_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_mobile text;
  generated_user_id text;
begin
  normalized_mobile := nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'mobile', ''), '\\D', '', 'g'), '');
  if normalized_mobile is not null and length(normalized_mobile) = 12 and normalized_mobile like '91%' then
    normalized_mobile := substr(normalized_mobile, 3, 10);
  elsif normalized_mobile is not null and length(normalized_mobile) = 11 and normalized_mobile like '0%' then
    normalized_mobile := substr(normalized_mobile, 2, 10);
  end if;

  generated_user_id := public.generate_icj_user_id();

  insert into public.profiles (
    id,
    user_id,
    member_id,
    full_name,
    email,
    mobile,
    member_type,
    role,
    role_code,
    role_category,
    legacy_role,
    referral_code,
    referred_by,
    profile_photo,
    date_of_birth,
    gender,
    address,
    city,
    state,
    country,
    pin_code,
    status,
    verification_status,
    mobile_verified,
    email_verified,
    is_mobile_verified,
    is_email_verified,
    created_at,
    updated_at
  )
  values (
    new.id,
    generated_user_id,
    generated_user_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    lower(new.email),
    normalized_mobile,
    coalesce(new.raw_user_meta_data ->> 'member_type', 'Individual'),
    coalesce(new.raw_user_meta_data ->> 'role', 'member'),
    coalesce(new.raw_user_meta_data ->> 'role_code', 'member'),
    coalesce(new.raw_user_meta_data ->> 'role_category', 'community'),
    coalesce(new.raw_user_meta_data ->> 'legacy_role', coalesce(new.raw_user_meta_data ->> 'role', 'member')),
    nullif(new.raw_user_meta_data ->> 'referral_code', ''),
    nullif(new.raw_user_meta_data ->> 'referred_by', ''),
    nullif(new.raw_user_meta_data ->> 'profile_photo', ''),
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date,
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    nullif(new.raw_user_meta_data ->> 'address', ''),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    nullif(new.raw_user_meta_data ->> 'state', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'country', ''), 'India'),
    nullif(new.raw_user_meta_data ->> 'pin_code', ''),
    'Pending',
    'Pending',
    false,
    false,
    false,
    false,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  on conflict (id) do update
  set
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    email = coalesce(nullif(public.profiles.email, ''), excluded.email),
    mobile = coalesce(nullif(public.profiles.mobile, ''), excluded.mobile),
    user_id = coalesce(nullif(public.profiles.user_id, ''), excluded.user_id),
    member_id = coalesce(nullif(public.profiles.member_id, ''), excluded.user_id),
    status = coalesce(nullif(public.profiles.status, ''), 'Pending'),
    mobile_verified = coalesce(public.profiles.mobile_verified, false),
    email_verified = coalesce(public.profiles.email_verified, false),
    is_mobile_verified = coalesce(public.profiles.is_mobile_verified, false),
    is_email_verified = coalesce(public.profiles.is_email_verified, false),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_registration();

create table if not exists public.auth_audit_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  action text not null,
  status text not null default 'success',
  source text not null default 'web',
  metadata jsonb not null default '{}'::jsonb,
  event_time timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.auth_audit_logs
  drop constraint if exists auth_audit_logs_action_chk;

alter table public.auth_audit_logs
  add constraint auth_audit_logs_action_chk
  check (action in ('registration', 'login', 'logout', 'password_change', 'profile_update'));

create index if not exists auth_audit_logs_user_idx on public.auth_audit_logs(user_id);
create index if not exists auth_audit_logs_action_idx on public.auth_audit_logs(action);
create index if not exists auth_audit_logs_event_time_idx on public.auth_audit_logs(event_time desc);

alter table public.auth_audit_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'auth_audit_logs' and policyname = 'auth_audit_logs_select_own'
  ) then
    create policy auth_audit_logs_select_own on public.auth_audit_logs
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'auth_audit_logs' and policyname = 'auth_audit_logs_insert_own'
  ) then
    create policy auth_audit_logs_insert_own on public.auth_audit_logs
      for insert with check (auth.uid() = user_id or user_id is null);
  end if;
end $$;

create table if not exists public.auth_channel_settings (
  id int primary key,
  enable_sms_otp boolean not null default false,
  enable_whatsapp_otp boolean not null default false,
  enable_email_otp boolean not null default false,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.auth_channel_settings (id, enable_sms_otp, enable_whatsapp_otp, enable_email_otp)
values (1, false, false, false)
on conflict (id) do update
set
  enable_sms_otp = excluded.enable_sms_otp,
  enable_whatsapp_otp = excluded.enable_whatsapp_otp,
  enable_email_otp = excluded.enable_email_otp,
  updated_at = timezone('utc'::text, now());

create table if not exists public.otp_verification_requests (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  channel text not null,
  recipient text not null,
  status text not null default 'queued',
  otp_reference text,
  attempts int not null default 0,
  expires_at timestamptz,
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.otp_verification_requests
  drop constraint if exists otp_verification_requests_channel_chk;

alter table public.otp_verification_requests
  add constraint otp_verification_requests_channel_chk
  check (channel in ('sms', 'whatsapp', 'email'));

create index if not exists otp_verification_requests_user_idx on public.otp_verification_requests(user_id);
create index if not exists otp_verification_requests_channel_idx on public.otp_verification_requests(channel);

create table if not exists public.notification_channel_settings (
  id int primary key,
  enable_email boolean not null default false,
  enable_sms boolean not null default false,
  enable_whatsapp boolean not null default false,
  enable_inapp boolean not null default false,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.notification_channel_settings (id, enable_email, enable_sms, enable_whatsapp, enable_inapp)
values (1, false, false, false, false)
on conflict (id) do update
set
  enable_email = excluded.enable_email,
  enable_sms = excluded.enable_sms,
  enable_whatsapp = excluded.enable_whatsapp,
  enable_inapp = excluded.enable_inapp,
  updated_at = timezone('utc'::text, now());

create table if not exists public.notification_delivery_queue (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  channel text not null,
  recipient text,
  template_key text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.notification_delivery_queue
  drop constraint if exists notification_delivery_queue_channel_chk;

alter table public.notification_delivery_queue
  add constraint notification_delivery_queue_channel_chk
  check (channel in ('email', 'sms', 'whatsapp', 'inapp'));

create index if not exists notification_delivery_queue_user_idx on public.notification_delivery_queue(user_id);
create index if not exists notification_delivery_queue_status_idx on public.notification_delivery_queue(status);
