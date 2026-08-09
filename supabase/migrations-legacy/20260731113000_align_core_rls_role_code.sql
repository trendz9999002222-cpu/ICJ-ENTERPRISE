-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Align core module RLS with role_code model
-- Date: 2026-07-31
-- ============================================================

-- Keep broad authenticated read policy as backward-compatible baseline.
-- Tight row-level ownership filters require additional ownership columns
-- and are intentionally deferred to a dedicated data-model migration.

alter table if exists public.members enable row level security;
alter table if exists public.wallets enable row level security;
alter table if exists public.tokens enable row level security;
alter table if exists public.donations enable row level security;
alter table if exists public.legal_cases enable row level security;
alter table if exists public.documents enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.reports enable row level security;
alter table if exists public.system_settings enable row level security;

drop policy if exists members_write_staff on public.members;
drop policy if exists wallets_write_staff on public.wallets;
drop policy if exists tokens_write_staff on public.tokens;
drop policy if exists donations_write_staff on public.donations;
drop policy if exists legal_cases_write_staff on public.legal_cases;
drop policy if exists documents_write_staff on public.documents;
drop policy if exists notifications_write_staff on public.notifications;
drop policy if exists reports_write_staff on public.reports;
drop policy if exists system_settings_write_admin on public.system_settings;

create policy members_write_staff_roles on public.members
for all
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
);

create policy wallets_write_staff_roles on public.wallets
for all
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
);

create policy tokens_write_staff_roles on public.tokens
for all
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
);

create policy donations_write_staff_roles on public.donations
for all
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
);

create policy legal_cases_write_staff_roles on public.legal_cases
for all
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
);

create policy documents_write_staff_roles on public.documents
for all
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
);

create policy notifications_write_staff_roles on public.notifications
for all
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
);

create policy reports_write_staff_roles on public.reports
for all
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'employee', 'admin'
  )
);

create policy system_settings_write_admin_roles on public.system_settings
for all
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin', 'system_admin', 'organization_admin', 'admin'
  )
);
