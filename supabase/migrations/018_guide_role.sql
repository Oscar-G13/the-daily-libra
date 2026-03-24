-- Migration 018: Add guide_role to guide_profiles
-- Allows guides to identify as High Priestess or High Priest
-- Billing tier stays 'high_priestess' for both — only display label changes

ALTER TABLE guide_profiles
  ADD COLUMN IF NOT EXISTS guide_role TEXT
    CHECK (guide_role IN ('high_priestess', 'high_priest'))
    DEFAULT 'high_priestess';

-- Backfill existing rows
UPDATE guide_profiles SET guide_role = 'high_priestess' WHERE guide_role IS NULL;
