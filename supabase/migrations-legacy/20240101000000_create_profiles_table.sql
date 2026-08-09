-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Create profiles table
-- Version : 1.0.0
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  member_id text unique not null,
  full_name text,
  mobile text,
  email text,
  state text,
  district text,
  member_type text,
  referral_code text,
  referred_by text,
  wallet_balance numeric default 0,
  token_balance numeric default 0,
  member_level text default 'BASIC',
  verification_status text default 'Pending',
  status text default 'Active',
  is_mobile_verified boolean default false,
  is_email_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for faster lookups
create index profiles_member_id_idx on public.profiles(member_id);
create index profiles_email_idx on public.profiles(email);
create index profiles_mobile_idx on public.profiles(mobile);
create index profiles_referral_code_idx on public.profiles(referral_code);
