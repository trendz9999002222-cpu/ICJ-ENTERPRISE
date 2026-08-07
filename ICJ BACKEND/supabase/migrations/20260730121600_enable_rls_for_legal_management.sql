-- ============================================================
-- ICJ Enterprise Platform
-- Migration: RLS and policies for legal management extension
-- Date: 2026-07-30
-- ============================================================

alter table if exists public.legal_clients enable row level security;
alter table if exists public.legal_courts enable row level security;
alter table if exists public.legal_advocates enable row level security;
alter table if exists public.legal_notices enable row level security;
alter table if exists public.legal_hearings enable row level security;
alter table if exists public.legal_timelines enable row level security;
alter table if exists public.legal_case_links enable row level security;

-- Clients

drop policy if exists legal_clients_select_all on public.legal_clients;
create policy legal_clients_select_all on public.legal_clients
for select using (auth.role() = 'authenticated');

drop policy if exists legal_clients_write_staff on public.legal_clients;
create policy legal_clients_write_staff on public.legal_clients
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Courts

drop policy if exists legal_courts_select_all on public.legal_courts;
create policy legal_courts_select_all on public.legal_courts
for select using (auth.role() = 'authenticated');

drop policy if exists legal_courts_write_staff on public.legal_courts;
create policy legal_courts_write_staff on public.legal_courts
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Advocates

drop policy if exists legal_advocates_select_all on public.legal_advocates;
create policy legal_advocates_select_all on public.legal_advocates
for select using (auth.role() = 'authenticated');

drop policy if exists legal_advocates_write_staff on public.legal_advocates;
create policy legal_advocates_write_staff on public.legal_advocates
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Notices

drop policy if exists legal_notices_select_all on public.legal_notices;
create policy legal_notices_select_all on public.legal_notices
for select using (auth.role() = 'authenticated');

drop policy if exists legal_notices_write_staff on public.legal_notices;
create policy legal_notices_write_staff on public.legal_notices
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Hearings

drop policy if exists legal_hearings_select_all on public.legal_hearings;
create policy legal_hearings_select_all on public.legal_hearings
for select using (auth.role() = 'authenticated');

drop policy if exists legal_hearings_write_staff on public.legal_hearings;
create policy legal_hearings_write_staff on public.legal_hearings
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Timelines

drop policy if exists legal_timelines_select_all on public.legal_timelines;
create policy legal_timelines_select_all on public.legal_timelines
for select using (auth.role() = 'authenticated');

drop policy if exists legal_timelines_write_staff on public.legal_timelines;
create policy legal_timelines_write_staff on public.legal_timelines
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Case Links

drop policy if exists legal_case_links_select_all on public.legal_case_links;
create policy legal_case_links_select_all on public.legal_case_links
for select using (auth.role() = 'authenticated');

drop policy if exists legal_case_links_write_staff on public.legal_case_links;
create policy legal_case_links_write_staff on public.legal_case_links
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));
