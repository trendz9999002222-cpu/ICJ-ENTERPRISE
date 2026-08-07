-- ============================================================
-- ICJ Enterprise Platform
-- Migration: Add core foreign key integrity constraints (non-breaking)
-- Date: 2026-07-31
-- ============================================================

-- Use NOT VALID so existing historical records do not block deployment.
-- A later data-cleanup migration can run VALIDATE CONSTRAINT safely.

create index if not exists wallets_member_id_idx on public.wallets(member_id);
create index if not exists tokens_member_id_idx on public.tokens(member_id);
create index if not exists donations_member_id_idx on public.donations(member_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wallets_member_id_fkey'
  ) THEN
    ALTER TABLE public.wallets
      ADD CONSTRAINT wallets_member_id_fkey
      FOREIGN KEY (member_id)
      REFERENCES public.members(member_id)
      ON UPDATE CASCADE
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tokens_member_id_fkey'
  ) THEN
    ALTER TABLE public.tokens
      ADD CONSTRAINT tokens_member_id_fkey
      FOREIGN KEY (member_id)
      REFERENCES public.members(member_id)
      ON UPDATE CASCADE
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'donations_member_id_fkey'
  ) THEN
    ALTER TABLE public.donations
      ADD CONSTRAINT donations_member_id_fkey
      FOREIGN KEY (member_id)
      REFERENCES public.members(member_id)
      ON UPDATE CASCADE
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;
