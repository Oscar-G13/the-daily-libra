-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — Public Guide Profiles
--  Migration: 014_guide_public_profiles.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table guide_profiles
  add column if not exists public_enabled boolean not null default true,
  add column if not exists profile_theme text not null default 'gold',
  add column if not exists profile_layout text not null default 'editorial',
  add column if not exists welcome_headline text,
  add column if not exists cta_label text;

alter table guide_profiles
  drop constraint if exists guide_profiles_profile_theme_check;

alter table guide_profiles
  add constraint guide_profiles_profile_theme_check
  check (profile_theme in ('gold', 'plum', 'rose'));

alter table guide_profiles
  drop constraint if exists guide_profiles_profile_layout_check;

alter table guide_profiles
  add constraint guide_profiles_profile_layout_check
  check (profile_layout in ('editorial', 'spotlight', 'portrait'));
