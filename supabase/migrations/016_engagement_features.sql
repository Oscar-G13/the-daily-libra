-- ─────────────────────────────────────────────────────────────────────────────
--  016 — Advanced Engagement Features
--  - Three-slot daily rituals (morning / midday / evening)
--  - Cosmic events + user participation
--  - Cosmic outlook cache
--  - Leaderboard snapshots
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── RITUALS: add slot column ─────────────────────────────────────────────────

DROP INDEX IF EXISTS idx_rituals_user_date;

ALTER TABLE public.rituals
  ADD COLUMN IF NOT EXISTS ritual_slot TEXT DEFAULT 'morning'
    CHECK (ritual_slot IN ('morning', 'midday', 'evening')),
  ADD COLUMN IF NOT EXISTS all_complete_bonus_awarded BOOLEAN DEFAULT FALSE;

-- Back-fill existing rows to morning slot
UPDATE public.rituals SET ritual_slot = 'morning' WHERE ritual_slot IS NULL;

ALTER TABLE public.rituals ALTER COLUMN ritual_slot SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rituals_user_date_slot
  ON public.rituals(user_id, ritual_date, ritual_slot);

-- ─── COSMIC EVENTS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cosmic_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name       TEXT NOT NULL,
  event_type       TEXT NOT NULL CHECK (event_type IN (
                     'eclipse', 'retrograde', 'new_moon', 'full_moon', 'stellium', 'ingress'
                   )),
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  description      TEXT,
  exclusive_content_key TEXT,  -- reading category key unlocked during this event
  badge_id         TEXT,       -- achievement_id awarded on participation
  is_active        BOOLEAN GENERATED ALWAYS AS (current_date BETWEEN start_date AND end_date) STORED
);

ALTER TABLE public.cosmic_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cosmic_events_read_all" ON public.cosmic_events
  FOR SELECT USING (true);

-- ─── USER EVENT PARTICIPATION ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_event_participation (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_id      UUID REFERENCES public.cosmic_events(id) ON DELETE CASCADE NOT NULL,
  completed_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  badge_awarded BOOLEAN DEFAULT FALSE,
  UNIQUE (user_id, event_id)
);

ALTER TABLE public.user_event_participation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uep_own" ON public.user_event_participation
  FOR ALL USING (auth.uid() = user_id);

-- ─── COSMIC OUTLOOK CACHE ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cosmic_outlook_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  forecast_date   DATE NOT NULL,
  transit_summary TEXT NOT NULL,
  energy_score    SMALLINT CHECK (energy_score BETWEEN 1 AND 10),
  highlight_type  TEXT CHECK (highlight_type IN ('best_window', 'challenge', 'neutral')),
  generated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, forecast_date)
);

ALTER TABLE public.cosmic_outlook_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outlook_own" ON public.cosmic_outlook_cache
  FOR ALL USING (auth.uid() = user_id);

-- ─── LEADERBOARD SNAPSHOTS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type  TEXT NOT NULL CHECK (leaderboard_type IN (
                      'streak', 'weekly_xp', 'journal_count', 'referral'
                    )),
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  rankings          JSONB NOT NULL,
  generated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leaderboard_read_all" ON public.leaderboard_snapshots
  FOR SELECT USING (true);

-- ─── SEED: 2026 ASTROLOGICAL EVENTS ─────────────────────────────────────────

INSERT INTO public.cosmic_events (event_name, event_type, start_date, end_date, description, exclusive_content_key, badge_id)
VALUES
  ('Mercury Retrograde in Aries',   'retrograde', '2026-03-15', '2026-04-07',
   'Mercury stations retrograde in fiery Aries — communication, contracts, and first impressions need extra care. Libras may feel the tension between self-expression and diplomacy.',
   'retrograde_reading', 'mercury_retrograde_survivor'),

  ('Total Lunar Eclipse in Libra',  'eclipse',    '2026-04-03', '2026-04-04',
   'A rare total lunar eclipse in your own sign — a powerful culmination point for Libra identity, relationships, and long-held patterns. Expect emotional revelations.',
   'eclipse_reading', 'eclipse_witness'),

  ('Venus Enters Taurus',           'ingress',    '2026-04-06', '2026-05-04',
   'Venus moves into her home sign of Taurus — sensuality, material comfort, and slow love are favored. Your Venusian nature feels fully expressed.',
   'love_reading', 'venus_in_taurus'),

  ('Jupiter–Neptune Conjunction',   'stellium',   '2026-05-10', '2026-05-17',
   'A rare Jupiter–Neptune alignment amplifies spiritual insight and creative vision. Dreams feel vivid and meaningful for all signs, especially air signs.',
   'healing_reading', 'jupiter_neptune_dreamer'),

  ('New Moon in Gemini',            'new_moon',   '2026-05-27', '2026-05-28',
   'The Gemini new moon invites fresh starts in communication, learning, and local connections. Set intentions around how you want to share your voice.',
   'daily_reading', NULL),

  ('Mercury Retrograde in Virgo',   'retrograde', '2026-07-18', '2026-08-11',
   'Mercury retrograde in analytical Virgo — details, health routines, and work processes deserve a second look. Libras benefit from reviewing agreements made in June.',
   'retrograde_reading', 'mercury_retrograde_survivor'),

  ('Full Moon in Libra',            'full_moon',  '2026-09-20', '2026-09-21',
   'The annual full moon in Libra illuminates your core identity, desires, and the balance between self and others. A powerful night for ritual and release.',
   'shadow_reading', 'full_moon_libra'),

  ('Venus Retrograde in Scorpio',   'retrograde', '2026-10-03', '2026-11-13',
   'Venus turns retrograde in Scorpio — a deep, sometimes uncomfortable review of desire, worth, and intimate bonds. What you truly value will become clear.',
   'love_reading', 'venus_retrograde_alchemist'),

  ('Solar Eclipse in Libra',        'eclipse',    '2026-10-17', '2026-10-18',
   'A solar eclipse in Libra seeds powerful new beginnings around identity and relationships. Eclipse energy lasts six months — plant wisely.',
   'eclipse_reading', 'eclipse_witness'),

  ('Jupiter Enters Cancer',         'ingress',    '2026-11-20', '2027-12-10',
   'Jupiter moves into nurturing Cancer — a year-long expansion of home, family, emotional security, and intuition. Libras benefit from exploring their domestic foundations.',
   'healing_reading', 'jupiter_in_cancer'),

  ('New Moon in Sagittarius',       'new_moon',   '2026-11-25', '2026-11-26',
   'The Sagittarius new moon ignites wanderlust and philosophical growth. An excellent time to set intentions around travel, education, or belief systems.',
   'daily_reading', NULL),

  ('Full Moon in Gemini',           'full_moon',  '2026-12-06', '2026-12-07',
   'A Gemini full moon brings mental clarity and the desire to share what you have learned. Ideas crystallize and conversations reach meaningful conclusions.',
   'daily_reading', NULL)

ON CONFLICT DO NOTHING;
