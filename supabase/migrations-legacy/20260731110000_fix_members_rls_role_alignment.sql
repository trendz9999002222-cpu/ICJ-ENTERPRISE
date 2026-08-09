-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Fix members RLS role alignment
-- Date: 2026-07-31
-- ============================================================

alter table if exists public.members enable row level security;

drop policy if exists members_select_all on public.members;
create policy members_select_all on public.members
for select using (auth.role() = 'authenticated');

drop policy if exists members_write_staff on public.members;

create policy members_insert_staff_roles on public.members
for insert
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin',
    'system_admin',
    'organization_admin',
    'employee',
    'admin'
  )
);

create policy members_update_staff_roles on public.members
for update
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin',
    'system_admin',
    'organization_admin',
    'employee',
    'admin'
  )
)
with check (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin',
    'system_admin',
    'organization_admin',
    'employee',
    'admin'
  )
);

create policy members_delete_admin_roles on public.members
for delete
using (
  auth.role() = 'authenticated'
  and coalesce(auth.jwt() ->> 'role_code', auth.jwt() ->> 'role', '') in (
    'super_admin',
    'system_admin',
    'organization_admin',
    'admin'
  )
);
