-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Mobile uniqueness and verification foundation
-- Date: 2026-07-30
-- ============================================================

alter table public.profiles
  add column if not exists mobile_verified boolean default false,
  add column if not exists email_verified boolean default false;

-- Keep compatibility with earlier verification fields used by existing modules.
update public.profiles
set
  mobile_verified = coalesce(mobile_verified, is_mobile_verified, false),
  email_verified = coalesce(email_verified, is_email_verified, false),
  is_mobile_verified = coalesce(is_mobile_verified, mobile_verified, false),
  is_email_verified = coalesce(is_email_verified, email_verified, false)
where true;

-- Ensure mobile is unique when present.
create unique index if not exists profiles_mobile_unique_idx
  on public.profiles(mobile)
  where mobile is not null and btrim(mobile) <> '';

-- Enforce Indian mobile format for new/updated rows while preserving legacy rows.
alter table public.profiles
  drop constraint if exists profiles_mobile_indian_format_chk;

alter table public.profiles
  add constraint profiles_mobile_indian_format_chk
  check (mobile is null or mobile ~ '^[6-9][0-9]{9}$') not valid;
