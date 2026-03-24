-- ─────────────────────────────────────────────────────────────────────────────
--  019_aether_system — Aether currency, shop catalog, and user shop state
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Aether balance on users ───────────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS aether_balance INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cosmic_title TEXT,
  ADD COLUMN IF NOT EXISTS aura_color TEXT NOT NULL DEFAULT 'violet',
  ADD COLUMN IF NOT EXISTS oracle_voice_pack TEXT NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS name_change_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inviter_removed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS streak_shield_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transit_shield_expires_at TIMESTAMPTZ;

-- ── Aether transaction ledger ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.aether_transactions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount           INTEGER     NOT NULL,  -- positive = earn, negative = spend
  transaction_type TEXT        NOT NULL,
  description      TEXT,
  metadata         JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aether_tx_user_id   ON public.aether_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_aether_tx_created   ON public.aether_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_aether_tx_type      ON public.aether_transactions(transaction_type);

ALTER TABLE public.aether_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own aether transactions"
  ON public.aether_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ── Shop item catalog ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_items (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  aether_price    INTEGER,                -- NULL = not purchasable with Aether
  usd_price_cents INTEGER,                -- NULL = not purchasable with USD
  category        TEXT        NOT NULL,   -- identity | boost | cosmetic | protection | mystery
  emoji           TEXT        NOT NULL,
  is_limited_time BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  max_per_user    INTEGER,                -- NULL = unlimited
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop items are publicly readable"
  ON public.shop_items FOR SELECT
  USING (TRUE);

-- ── User purchases ledger ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_shop_purchases (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id       TEXT        NOT NULL REFERENCES public.shop_items(id),
  aether_spent  INTEGER,
  usd_cents_paid INTEGER,
  metadata      JSONB,
  purchased_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_purchases_user_id ON public.user_shop_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_item_id ON public.user_shop_purchases(item_id);

ALTER TABLE public.user_shop_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchases"
  ON public.user_shop_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- ── Seed shop catalog ─────────────────────────────────────────────────────────
INSERT INTO public.shop_items
  (id, name, description, aether_price, usd_price_cents, category, emoji, max_per_user, sort_order)
VALUES
  ('profile_name_change', 'Profile Name Change',
   'Change your display name. First change is always free.',
   120, 499, 'identity', '✏️', NULL, 10),

  ('remove_inviter', 'Remove Inviter',
   'Permanently remove the person who invited you from your profile display.',
   480, 1999, 'identity', '🔗', 1, 20),

  ('fate_reroll', 'Fate Reroll',
   'Instantly reroll your daily tarot, oracle, or transit reading once.',
   45, NULL, 'boost', '🎲', NULL, 30),

  ('cosmic_title', 'Cosmic Title',
   'Add a special flair title to your username (e.g. Lunar Mystic, Retrograde Warrior).',
   95, NULL, 'cosmetic', '👑', NULL, 40),

  ('aura_color', 'Aura Color Change',
   'Change the color of your personal aura visualization on the dashboard.',
   65, NULL, 'cosmetic', '🌈', NULL, 50),

  ('transit_shield', 'Transit Shield',
   'Soften challenging planetary readings for 7 days.',
   220, NULL, 'protection', '🛡️', NULL, 60),

  ('journal_theme', 'Journal Theme Unlock',
   'Premium aesthetic themes for your spiritual journal: starry night, crystal grid, golden hour.',
   85, NULL, 'cosmetic', '📔', NULL, 70),

  ('mystery_blessing', 'Mystery Blessing Pack',
   'A mystery reveal: random rare collectible card, cosmic title, or bonus Aether.',
   150, NULL, 'mystery', '🎁', NULL, 80),

  ('oracle_voice_pack', 'Oracle Voice Pack',
   'Change the tone of AI oracle responses: wise elder, mystical whisper, cosmic echo.',
   130, NULL, 'cosmetic', '🔮', NULL, 90),

  ('streak_protector', 'Streak Protector',
   'Save your streak once if you miss a day. Expires after one use.',
   150, 299, 'protection', '🔥', NULL, 100)
ON CONFLICT (id) DO NOTHING;

-- ── Grant 75 Aether signup bonus to all existing onboarded users ──────────────
UPDATE public.users
SET aether_balance = 75
WHERE onboarding_completed = TRUE
  AND aether_balance = 0;

-- Record the signup bonus transaction for existing users (best-effort)
INSERT INTO public.aether_transactions (user_id, amount, transaction_type, description)
SELECT id, 75, 'signup_bonus', 'Welcome gift — 75 Aether to start your journey'
FROM public.users
WHERE onboarding_completed = TRUE
  AND id NOT IN (
    SELECT DISTINCT user_id FROM public.aether_transactions
    WHERE transaction_type = 'signup_bonus'
  );
