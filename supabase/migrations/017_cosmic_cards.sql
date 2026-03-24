-- ─────────────────────────────────────────────────────────────────────────────
--  017 — Cosmic Card Collection
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Card catalog ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cosmic_cards (
  card_key        TEXT PRIMARY KEY,
  card_name       TEXT NOT NULL,
  card_type       TEXT NOT NULL CHECK (card_type IN (
                    'transit', 'archetype', 'milestone', 'event', 'blessing'
                  )),
  rarity          TEXT NOT NULL CHECK (rarity IN (
                    'common', 'uncommon', 'rare', 'ultra_rare', 'legendary'
                  )),
  description     TEXT,
  emoji           TEXT DEFAULT '✦',
  unlock_condition TEXT, -- e.g., 'streak_7', 'archetype_velvet_diplomat', 'eclipse_2026_04'
  available_from  TIMESTAMPTZ,
  available_until TIMESTAMPTZ  -- null = permanent
);

ALTER TABLE public.cosmic_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cosmic_cards_read_all" ON public.cosmic_cards FOR SELECT USING (true);

-- ─── User cards ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_cosmic_cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  card_key    TEXT REFERENCES public.cosmic_cards(card_key) ON DELETE CASCADE NOT NULL,
  earned_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, card_key)
);

ALTER TABLE public.user_cosmic_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_cards_own" ON public.user_cosmic_cards
  FOR ALL USING (auth.uid() = user_id);

-- ─── Seed: card catalog ───────────────────────────────────────────────────────

-- Archetype cards (10) — common, unlocked when archetype is identified
INSERT INTO public.cosmic_cards (card_key, card_name, card_type, rarity, description, emoji, unlock_condition)
VALUES
  ('arch_velvet_diplomat',           'The Velvet Diplomat',          'archetype', 'common', 'You speak truth wrapped in silk. Your diplomacy is your superpower.', '🕊️', 'archetype_velvet_diplomat'),
  ('arch_romantic_strategist',       'The Romantic Strategist',      'archetype', 'common', 'Love and logic dance inside you. You play the long game in all things.', '♟️', 'archetype_romantic_strategist'),
  ('arch_mirror_heart',              'The Mirror Heart',             'archetype', 'common', 'You absorb what others feel. Your empathy is a gift and a challenge.', '🪞', 'archetype_mirror_heart'),
  ('arch_silent_scales',             'The Silent Scales',            'archetype', 'common', 'You weigh in silence. Your stillness holds more than words ever could.', '⚖', 'archetype_silent_scales'),
  ('arch_golden_idealist',           'The Golden Idealist',          'archetype', 'common', 'You see the world as it could be, not just as it is. That vision changes things.', '🌟', 'archetype_golden_idealist'),
  ('arch_aesthetic_oracle',          'The Aesthetic Oracle',         'archetype', 'common', 'Beauty is your language. You read energy through form, color, and presence.', '🎨', 'archetype_aesthetic_oracle'),
  ('arch_people_pleaser_recovery',   'The Recovering Pleaser',       'archetype', 'common', 'You are learning that your needs are not a burden. This is your most powerful chapter.', '🌱', 'archetype_people_pleaser_in_recovery'),
  ('arch_elegant_overthinker',       'The Elegant Overthinker',      'archetype', 'common', 'Your mind is a palace of possibility. You think because you care that much.', '💭', 'archetype_elegant_overthinker'),
  ('arch_soft_power_libra',          'The Soft Power Libra',         'archetype', 'common', 'Your influence is quiet and undeniable. People lean toward you without knowing why.', '🌊', 'archetype_soft_power_libra'),
  ('arch_cosmic_charmer',            'The Cosmic Charmer',           'archetype', 'common', 'You arrived in the room before you did. Your presence is electric.', '✨', 'archetype_cosmic_charmer')
ON CONFLICT DO NOTHING;

-- Milestone cards — streak-based
INSERT INTO public.cosmic_cards (card_key, card_name, card_type, rarity, description, emoji, unlock_condition)
VALUES
  ('streak_7',    'Seven Suns',         'milestone', 'uncommon', 'Seven consecutive days of showing up for yourself. The habit is forming.', '☀️', 'streak_7'),
  ('streak_14',   'Lunar Devotion',     'milestone', 'rare',     'Fourteen days of presence. You are building something real.', '🌙', 'streak_14'),
  ('streak_30',   'Month of the Scale', 'milestone', 'rare',     'Thirty days of daily ritual. You have crossed into devotion.', '⚖', 'streak_30'),
  ('streak_60',   'Venus Cycle',        'milestone', 'ultra_rare','Sixty days of returning. Venus honors your commitment.', '♀', 'streak_60'),
  ('streak_100',  'Century Libra',      'milestone', 'legendary', 'One hundred days. You are now a testament to what consistency creates.', '💫', 'streak_100')
ON CONFLICT DO NOTHING;

-- Reading milestone cards
INSERT INTO public.cosmic_cards (card_key, card_name, card_type, rarity, description, emoji, unlock_condition)
VALUES
  ('readings_10',  'Apprentice Oracle',  'milestone', 'uncommon', 'Ten readings — the chart is becoming a conversation.', '🔮', 'readings_10'),
  ('readings_50',  'Celestial Reader',   'milestone', 'rare',     'Fifty readings. You speak the language of the stars.', '🌠', 'readings_50'),
  ('readings_100', 'Oracle of the Scales','milestone', 'legendary','One hundred readings. Few have walked this deep.', '♎', 'readings_100')
ON CONFLICT DO NOTHING;

-- Transit/event cards — tied to astrological events
INSERT INTO public.cosmic_cards (card_key, card_name, card_type, rarity, description, emoji, unlock_condition, available_from, available_until)
VALUES
  ('event_eclipse_libra_2026',     'Eclipse Witness',     'event', 'ultra_rare', 'You were present during a total lunar eclipse in Libra — a rare and transformative sky.', '🌑', 'eclipse_witness', '2026-04-03', '2026-04-07'),
  ('event_venus_retrograde_2026',  'Venus Alchemist',     'event', 'rare',       'You journeyed through Venus retrograde — desire purified by reflection.', '♀', 'venus_retrograde_alchemist', '2026-10-03', '2026-11-16'),
  ('event_mercury_retro_2026',     'Mercury Survivor',    'event', 'uncommon',   'You navigated Mercury retrograde with grace. Communication, evolved.', '☿', 'mercury_retrograde_survivor', '2026-03-15', '2026-04-10'),
  ('event_jupiter_neptune_2026',   'Dream Architect',     'event', 'legendary',  'You were awake during the Jupiter–Neptune conjunction — a once-in-13-year spiritual peak.', '✦', 'jupiter_neptune_dreamer', '2026-05-10', '2026-05-20'),
  ('event_solar_eclipse_2026',     'Solar Seed',          'event', 'ultra_rare', 'You planted a new beginning during a solar eclipse in Libra. The cosmos marked your intention.', '☀️', NULL, '2026-10-17', '2026-10-20'),
  ('event_full_moon_libra_2026',   'Libra Moon Bearer',   'event', 'rare',       'The annual full moon in Libra illuminated your path. What was revealed?', '🌕', 'full_moon_libra', '2026-09-20', '2026-09-23')
ON CONFLICT DO NOTHING;

-- Blessing cards — for special behaviors
INSERT INTO public.cosmic_cards (card_key, card_name, card_type, rarity, description, emoji, unlock_condition)
VALUES
  ('blessing_first_reading',  'First Breath',       'blessing', 'common',   'Your first reading with the cosmos. Everything begins somewhere.', '🌅', 'first_reading'),
  ('blessing_first_journal',  'First Word',         'blessing', 'common',   'You committed your first thought to paper. The journal remembers.', '📝', 'first_journal'),
  ('blessing_shadow_work',    'Shadow Witness',     'blessing', 'uncommon', 'You looked at what most prefer to ignore. That is rare courage.', '🌑', 'shadow_reading'),
  ('blessing_soul_sync',      'Soul Synced',        'blessing', 'rare',     'Journal and mood logged on the same day — you are in full alignment.', '💫', 'soul_sync_7'),
  ('blessing_oracle_initiate','Oracle Initiate',    'blessing', 'uncommon', 'You asked your first question of the Celestial Oracle.', '🔮', 'first_oracle'),
  ('blessing_all_rituals',    'Triple Crown',       'blessing', 'rare',     'Morning, midday, and evening rituals all completed in a single day.', '👑', 'all_rituals_day')
ON CONFLICT DO NOTHING;
