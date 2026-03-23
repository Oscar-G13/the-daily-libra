-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — Subscription Conflict Fix
--  Migration: 013_subscription_conflict_fix.sql
-- ─────────────────────────────────────────────────────────────────────────────

drop index if exists public.subscriptions_stripe_subscription_id_unique;

create unique index if not exists subscriptions_stripe_subscription_id_unique
  on public.subscriptions (stripe_subscription_id);
