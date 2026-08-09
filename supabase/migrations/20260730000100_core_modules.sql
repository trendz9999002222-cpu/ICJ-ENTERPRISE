-- ICJ Enterprise Platform: Core modules schema
-- Safe to run on Supabase Postgres

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'employee', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  member_id text unique,
  name text not null,
  email text,
  mobile text,
  whatsapp text,
  member_type text,
  profession text,
  organisation text,
  gender text,
  dob date,
  aadhar text,
  pan text,
  gst text,
  address text,
  city text,
  district text,
  state text,
  pincode text,
  verification_status text not null default 'Pending',
  member_level text,
  registration_date timestamptz default now(),
  valid_till timestamptz,
  remarks text,
  experience text,
  wallet_balance numeric(14,2) not null default 0,
  token_balance numeric(14,2) not null default 0,
  status text not null default 'Active',
  profile_photo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id bigint primary key,
  member_id text,
  balance numeric(14,2) not null default 0,
  currency text not null default 'INR',
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.tokens (
  id bigint primary key,
  token_no text unique,
  member_id text,
  amount numeric(14,2) not null default 0,
  type text not null default 'Credit',
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id bigint primary key,
  receipt_no text unique,
  donor_name text,
  member_id text,
  amount numeric(14,2) not null default 0,
  payment_mode text,
  status text not null default 'Received',
  created_at timestamptz not null default now()
);

create table if not exists public.legal_cases (
  id bigint primary key,
  case_number text unique,
  title text not null,
  client_name text,
  advocate_name text,
  court_name text,
  status text not null default 'Pending',
  next_hearing date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id bigint primary key,
  document_no text unique,
  title text not null,
  category text,
  owner text,
  file_name text,
  file_type text,
  file_path text,
  file_url text,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id bigint primary key,
  title text not null,
  message text,
  type text not null default 'Info',
  status text not null default 'Unread',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id bigint primary key,
  report_no text unique,
  title text not null,
  category text,
  description text,
  created_by text,
  status text not null default 'Generated',
  created_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  id bigint primary key,
  enable_notifications boolean not null default true,
  enable_audit_log boolean not null default true,
  compact_view boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Optional helper indexes
create index if not exists idx_members_created_at on public.members(created_at desc);
create index if not exists idx_legal_cases_created_at on public.legal_cases(created_at desc);
create index if not exists idx_documents_created_at on public.documents(created_at desc);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.wallets enable row level security;
alter table public.tokens enable row level security;
alter table public.donations enable row level security;
alter table public.legal_cases enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.system_settings enable row level security;

-- Basic authenticated policies (tighten for production org hierarchy)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own'
  ) then
    create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_upsert_own'
  ) then
    create policy profiles_upsert_own on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'members' and policyname = 'members_authenticated_all'
  ) then
    create policy members_authenticated_all on public.members for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'wallets' and policyname = 'wallets_authenticated_all'
  ) then
    create policy wallets_authenticated_all on public.wallets for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'tokens' and policyname = 'tokens_authenticated_all'
  ) then
    create policy tokens_authenticated_all on public.tokens for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'donations' and policyname = 'donations_authenticated_all'
  ) then
    create policy donations_authenticated_all on public.donations for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'legal_cases' and policyname = 'legal_cases_authenticated_all'
  ) then
    create policy legal_cases_authenticated_all on public.legal_cases for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents' and policyname = 'documents_authenticated_all'
  ) then
    create policy documents_authenticated_all on public.documents for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_authenticated_all'
  ) then
    create policy notifications_authenticated_all on public.notifications for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reports' and policyname = 'reports_authenticated_all'
  ) then
    create policy reports_authenticated_all on public.reports for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'system_settings' and policyname = 'system_settings_authenticated_all'
  ) then
    create policy system_settings_authenticated_all on public.system_settings for all to authenticated using (true) with check (true);
  end if;
end $$;
