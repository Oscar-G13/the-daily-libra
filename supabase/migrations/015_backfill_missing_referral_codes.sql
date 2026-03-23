-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — Backfill Missing Referral Codes
--  Migration: 015_backfill_missing_referral_codes.sql
-- ─────────────────────────────────────────────────────────────────────────────

update public.users
set referral_code = public.generate_referral_code()
where referral_code is null;
