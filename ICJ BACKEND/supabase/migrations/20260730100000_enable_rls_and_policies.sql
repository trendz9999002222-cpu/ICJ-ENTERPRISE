-- ============================================================
-- ICJ Enterprise Platform
-- Migration: RLS and role-based policies
-- Date: 2026-07-30
-- ============================================================

alter table if exists public.members enable row level security;
alter table if exists public.wallets enable row level security;
alter table if exists public.tokens enable row level security;
alter table if exists public.donations enable row level security;
alter table if exists public.legal_cases enable row level security;
alter table if exists public.documents enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.reports enable row level security;
alter table if exists public.system_settings enable row level security;

-- Members

drop policy if exists members_select_all on public.members;
create policy members_select_all on public.members
for select using (auth.role() = 'authenticated');

drop policy if exists members_write_staff on public.members;
create policy members_write_staff on public.members
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Wallets

drop policy if exists wallets_select_all on public.wallets;
create policy wallets_select_all on public.wallets
for select using (auth.role() = 'authenticated');

drop policy if exists wallets_write_staff on public.wallets;
create policy wallets_write_staff on public.wallets
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Tokens

drop policy if exists tokens_select_all on public.tokens;
create policy tokens_select_all on public.tokens
for select using (auth.role() = 'authenticated');

drop policy if exists tokens_write_staff on public.tokens;
create policy tokens_write_staff on public.tokens
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Donations

drop policy if exists donations_select_all on public.donations;
create policy donations_select_all on public.donations
for select using (auth.role() = 'authenticated');

drop policy if exists donations_write_staff on public.donations;
create policy donations_write_staff on public.donations
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Legal Cases

drop policy if exists legal_cases_select_all on public.legal_cases;
create policy legal_cases_select_all on public.legal_cases
for select using (auth.role() = 'authenticated');

drop policy if exists legal_cases_write_staff on public.legal_cases;
create policy legal_cases_write_staff on public.legal_cases
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Documents

drop policy if exists documents_select_all on public.documents;
create policy documents_select_all on public.documents
for select using (auth.role() = 'authenticated');

drop policy if exists documents_write_staff on public.documents;
create policy documents_write_staff on public.documents
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Notifications

drop policy if exists notifications_select_all on public.notifications;
create policy notifications_select_all on public.notifications
for select using (auth.role() = 'authenticated');

drop policy if exists notifications_write_staff on public.notifications;
create policy notifications_write_staff on public.notifications
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Reports

drop policy if exists reports_select_all on public.reports;
create policy reports_select_all on public.reports
for select using (auth.role() = 'authenticated');

drop policy if exists reports_write_staff on public.reports;
create policy reports_write_staff on public.reports
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- System settings are admin-only write

drop policy if exists system_settings_select_all on public.system_settings;
create policy system_settings_select_all on public.system_settings
for select using (auth.role() = 'authenticated');

drop policy if exists system_settings_write_admin on public.system_settings;
create policy system_settings_write_admin on public.system_settings
for all using ((auth.jwt() ->> 'role') = 'admin')
with check ((auth.jwt() ->> 'role') = 'admin');
