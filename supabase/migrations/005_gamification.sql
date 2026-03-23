-- ─────────────────────────────────────────────────────────────────────────────
--  005_gamification — XP, trophies, achievements
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend users table with XP columns
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS xp_total        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_level        INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS weekly_xp       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_xp_best  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_xp_reset_date DATE;

-- Trophies earned by users (one row per tier per trophy)
CREATE TABLE IF NOT EXISTS public.user_trophies (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  trophy_id  TEXT        NOT NULL,
  tier       TEXT        NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, trophy_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_user_trophies_user_id ON public.user_trophies(user_id);

-- Achievements earned by users
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id TEXT        NOT NULL,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
