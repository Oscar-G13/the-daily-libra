-- ───────────────────────────────────────────────────────────────────
-- Migration 004: App streak tracking
-- ───────────────────────────────────────────────────────────────────

alter table users
  add column if not exists app_streak integer not null default 0,
  add column if not exists last_active_date date;
