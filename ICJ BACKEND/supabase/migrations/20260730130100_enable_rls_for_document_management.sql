-- ============================================================
-- ICJ Enterprise Platform
-- Migration: RLS policies for Document Management MVP tables
-- Date: 2026-07-30
-- ============================================================

alter table if exists public.document_categories enable row level security;
alter table if exists public.document_tags enable row level security;
alter table if exists public.document_versions enable row level security;
alter table if exists public.document_audit_logs enable row level security;
alter table if exists public.document_links enable row level security;
alter table if exists public.document_tag_map enable row level security;

-- Categories

drop policy if exists document_categories_select_all on public.document_categories;
create policy document_categories_select_all on public.document_categories
for select using (auth.role() = 'authenticated');

drop policy if exists document_categories_write_staff on public.document_categories;
create policy document_categories_write_staff on public.document_categories
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Tags

drop policy if exists document_tags_select_all on public.document_tags;
create policy document_tags_select_all on public.document_tags
for select using (auth.role() = 'authenticated');

drop policy if exists document_tags_write_staff on public.document_tags;
create policy document_tags_write_staff on public.document_tags
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Versions

drop policy if exists document_versions_select_all on public.document_versions;
create policy document_versions_select_all on public.document_versions
for select using (auth.role() = 'authenticated');

drop policy if exists document_versions_write_staff on public.document_versions;
create policy document_versions_write_staff on public.document_versions
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Audit Logs

drop policy if exists document_audit_logs_select_all on public.document_audit_logs;
create policy document_audit_logs_select_all on public.document_audit_logs
for select using (auth.role() = 'authenticated');

drop policy if exists document_audit_logs_write_system on public.document_audit_logs;
create policy document_audit_logs_write_system on public.document_audit_logs
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Links

drop policy if exists document_links_select_all on public.document_links;
create policy document_links_select_all on public.document_links
for select using (auth.role() = 'authenticated');

drop policy if exists document_links_write_staff on public.document_links;
create policy document_links_write_staff on public.document_links
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Tag Map

drop policy if exists document_tag_map_select_all on public.document_tag_map;
create policy document_tag_map_select_all on public.document_tag_map
for select using (auth.role() = 'authenticated');

drop policy if exists document_tag_map_write_staff on public.document_tag_map;
create policy document_tag_map_write_staff on public.document_tag_map
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));
