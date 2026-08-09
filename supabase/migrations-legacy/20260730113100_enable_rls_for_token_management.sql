-- ============================================================
-- ICJ Enterprise Platform
-- Migration: RLS policies for token management tables
-- Date: 2026-07-30
-- ============================================================

alter table if exists public.token_masters enable row level security;
alter table if exists public.token_transactions enable row level security;
alter table if exists public.token_allocations enable row level security;
alter table if exists public.token_wallet_links enable row level security;
alter table if exists public.token_reports enable row level security;

-- Token Masters

drop policy if exists token_masters_select_all on public.token_masters;
create policy token_masters_select_all on public.token_masters
for select using (auth.role() = 'authenticated');

drop policy if exists token_masters_write_admin on public.token_masters;
create policy token_masters_write_admin on public.token_masters
for all using ((auth.jwt() ->> 'role') = 'admin')
with check ((auth.jwt() ->> 'role') = 'admin');

-- Token Transactions

drop policy if exists token_transactions_select_all on public.token_transactions;
create policy token_transactions_select_all on public.token_transactions
for select using (auth.role() = 'authenticated');

drop policy if exists token_transactions_write_staff on public.token_transactions;
create policy token_transactions_write_staff on public.token_transactions
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Token Allocations

drop policy if exists token_allocations_select_all on public.token_allocations;
create policy token_allocations_select_all on public.token_allocations
for select using (auth.role() = 'authenticated');

drop policy if exists token_allocations_write_staff on public.token_allocations;
create policy token_allocations_write_staff on public.token_allocations
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Token Wallet Links

drop policy if exists token_wallet_links_select_all on public.token_wallet_links;
create policy token_wallet_links_select_all on public.token_wallet_links
for select using (auth.role() = 'authenticated');

drop policy if exists token_wallet_links_write_staff on public.token_wallet_links;
create policy token_wallet_links_write_staff on public.token_wallet_links
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));

-- Token Reports

drop policy if exists token_reports_select_all on public.token_reports;
create policy token_reports_select_all on public.token_reports
for select using (auth.role() = 'authenticated');

drop policy if exists token_reports_write_staff on public.token_reports;
create policy token_reports_write_staff on public.token_reports
for all using ((auth.jwt() ->> 'role') in ('admin', 'employee'))
with check ((auth.jwt() ->> 'role') in ('admin', 'employee'));
