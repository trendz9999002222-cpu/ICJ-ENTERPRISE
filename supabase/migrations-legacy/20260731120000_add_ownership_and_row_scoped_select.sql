-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Add ownership columns and strict row-scoped SELECT policies
-- Date: 2026-07-31
-- ============================================================

-- 1) Ownership columns
alter table if exists public.members add column if not exists owner_user_id uuid;
alter table if exists public.wallets add column if not exists owner_user_id uuid;
alter table if exists public.tokens add column if not exists owner_user_id uuid;
alter table if exists public.donations add column if not exists owner_user_id uuid;
alter table if exists public.legal_cases add column if not exists owner_user_id uuid;
alter table if exists public.documents add column if not exists owner_user_id uuid;
alter table if exists public.notifications add column if not exists owner_user_id uuid;
alter table if exists public.reports add column if not exists owner_user_id uuid;

create index if not exists members_owner_user_id_idx on public.members(owner_user_id);
create index if not exists wallets_owner_user_id_idx on public.wallets(owner_user_id);
create index if not exists tokens_owner_user_id_idx on public.tokens(owner_user_id);
create index if not exists donations_owner_user_id_idx on public.donations(owner_user_id);
create index if not exists legal_cases_owner_user_id_idx on public.legal_cases(owner_user_id);
create index if not exists documents_owner_user_id_idx on public.documents(owner_user_id);
create index if not exists notifications_owner_user_id_idx on public.notifications(owner_user_id);
create index if not exists reports_owner_user_id_idx on public.reports(owner_user_id);

-- 2) Drop broad SELECT policies to enforce row scoping
-- Core tables

drop policy if exists members_select_all on public.members;
drop policy if exists wallets_select_all on public.wallets;
drop policy if exists tokens_select_all on public.tokens;
drop policy if exists donations_select_all on public.donations;
drop policy if exists legal_cases_select_all on public.legal_cases;
drop policy if exists documents_select_all on public.documents;
drop policy if exists notifications_select_all on public.notifications;
drop policy if exists reports_select_all on public.reports;

-- Keep system settings readable only by elevated roles

drop policy if exists system_settings_select_all on public.system_settings;
create policy system_settings_select_admin_roles on public.system_settings
for select using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'admin'
  )
);

-- 3) Strict row-scoped select policies
-- Staff roles can read all.
-- Non-staff users can read own rows via owner_user_id or explicit data ownership fields.

create policy members_select_scoped on public.members
for select using (
  auth.role() = 'authenticated'
  and (
    coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in ('super_admin', 'system_admin', 'organization_admin', 'employee', 'admin')
    or owner_user_id = auth.uid()
    or (
      email is not null
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
);

create policy wallets_select_scoped on public.wallets
for select using (
  auth.role() = 'authenticated'
  and (
    coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in ('super_admin', 'system_admin', 'organization_admin', 'employee', 'admin')
    or owner_user_id = auth.uid()
    or exists (
      select 1
      from public.members m
      where m.member_id = wallets.member_id
        and (
          m.owner_user_id = auth.uid()
          or lower(coalesce(m.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  )
);

create policy tokens_select_scoped on public.tokens
for select using (
  auth.role() = 'authenticated'
  and (
    coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in ('super_admin', 'system_admin', 'organization_admin', 'employee', 'admin')
    or owner_user_id = auth.uid()
    or exists (
      select 1
      from public.members m
      where m.member_id = tokens.member_id
        and (
          m.owner_user_id = auth.uid()
          or lower(coalesce(m.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  )
);

create policy donations_select_scoped on public.donations
for select using (
  auth.role() = 'authenticated'
  and (
    coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in ('super_admin', 'system_admin', 'organization_admin', 'employee', 'admin')
    or owner_user_id = auth.uid()
    or exists (
      select 1
      from public.members m
      where m.member_id = donations.member_id
        and (
          m.owner_user_id = auth.uid()
          or lower(coalesce(m.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  )
);

create policy legal_cases_select_scoped on public.legal_cases
for select using (
  auth.role() = 'authenticated'
  and (
    coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in ('super_admin', 'system_admin', 'organization_admin', 'employee', 'admin')
    or owner_user_id = auth.uid()
  )
);

create policy documents_select_scoped on public.documents
for select using (
  auth.role() = 'authenticated'
  and (
    coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in ('super_admin', 'system_admin', 'organization_admin', 'employee', 'admin')
    or owner_user_id = auth.uid()
    or lower(coalesce(owner, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

create policy notifications_select_scoped on public.notifications
for select using (
  auth.role() = 'authenticated'
  and (
    coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in ('super_admin', 'system_admin', 'organization_admin', 'employee', 'admin')
    or owner_user_id = auth.uid()
  )
);

create policy reports_select_scoped on public.reports
for select using (
  auth.role() = 'authenticated'
  and (
    coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in ('super_admin', 'system_admin', 'organization_admin', 'employee', 'admin')
    or owner_user_id = auth.uid()
  )
);

-- 4) Owner-aware insert policies for end-user row ownership where allowed
-- Staff policies remain in existing migrations.

create policy members_insert_self_owned on public.members
for insert
with check (
  auth.role() = 'authenticated'
  and owner_user_id = auth.uid()
);

create policy documents_insert_self_owned on public.documents
for insert
with check (
  auth.role() = 'authenticated'
  and owner_user_id = auth.uid()
);

create policy notifications_insert_self_owned on public.notifications
for insert
with check (
  auth.role() = 'authenticated'
  and owner_user_id = auth.uid()
);
