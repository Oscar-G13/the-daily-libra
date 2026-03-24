// ─────────────────────────────────────────────────────────────────────────────
//  Cosmic Card Award Logic
// ─────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

export interface CardAwardContext {
  appStreak?: number;
  readingCount?: number;
  archetype?: string;
  hasFirstReading?: boolean;
  hasFirstJournal?: boolean;
  hasShadowReading?: boolean;
  soulSyncDays?: number;
  allRitualsToday?: boolean;
  firstOracle?: boolean;
  eventBadgeId?: string; // awarded from event participation
}

// Map conditions to card_key(s) that should be awarded
const CONDITION_CARDS: Array<{ key: string; check: (ctx: CardAwardContext) => boolean }> = [
  { key: "blessing_first_reading",  check: (c) => c.hasFirstReading === true },
  { key: "blessing_first_journal",  check: (c) => c.hasFirstJournal === true },
  { key: "blessing_shadow_work",    check: (c) => c.hasShadowReading === true },
  { key: "blessing_oracle_initiate",check: (c) => c.firstOracle === true },
  { key: "blessing_all_rituals",    check: (c) => c.allRitualsToday === true },
  { key: "blessing_soul_sync",      check: (c) => (c.soulSyncDays ?? 0) >= 7 },
  { key: "streak_7",    check: (c) => (c.appStreak ?? 0) >= 7 },
  { key: "streak_14",   check: (c) => (c.appStreak ?? 0) >= 14 },
  { key: "streak_30",   check: (c) => (c.appStreak ?? 0) >= 30 },
  { key: "streak_60",   check: (c) => (c.appStreak ?? 0) >= 60 },
  { key: "streak_100",  check: (c) => (c.appStreak ?? 0) >= 100 },
  { key: "readings_10",  check: (c) => (c.readingCount ?? 0) >= 10 },
  { key: "readings_50",  check: (c) => (c.readingCount ?? 0) >= 50 },
  { key: "readings_100", check: (c) => (c.readingCount ?? 0) >= 100 },
];

// Archetype → card_key mapping
const ARCHETYPE_CARDS: Record<string, string> = {
  velvet_diplomat:             "arch_velvet_diplomat",
  romantic_strategist:         "arch_romantic_strategist",
  mirror_heart:                "arch_mirror_heart",
  silent_scales:               "arch_silent_scales",
  golden_idealist:             "arch_golden_idealist",
  aesthetic_oracle:            "arch_aesthetic_oracle",
  people_pleaser_in_recovery:  "arch_people_pleaser_recovery",
  elegant_overthinker:         "arch_elegant_overthinker",
  soft_power_libra:            "arch_soft_power_libra",
  cosmic_charmer:              "arch_cosmic_charmer",
};

export async function awardCosmicCards(
  userId: string,
  ctx: CardAwardContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): Promise<string[]> {
  const toAward: string[] = [];

  // Condition-based cards
  for (const { key, check } of CONDITION_CARDS) {
    if (check(ctx)) toAward.push(key);
  }

  // Archetype card
  if (ctx.archetype && ARCHETYPE_CARDS[ctx.archetype]) {
    toAward.push(ARCHETYPE_CARDS[ctx.archetype]);
  }

  // Event badge cards
  if (ctx.eventBadgeId) {
    // Find card matching this badge_id
    const { data: card } = await supabase
      .from("cosmic_cards")
      .select("card_key")
      .eq("unlock_condition", ctx.eventBadgeId)
      .maybeSingle();
    if (card?.card_key) toAward.push(card.card_key);
  }

  if (toAward.length === 0) return [];

  // Fetch already-owned cards
  const { data: owned } = await supabase
    .from("user_cosmic_cards")
    .select("card_key")
    .eq("user_id", userId);

  const ownedSet = new Set((owned ?? []).map((c: { card_key: string }) => c.card_key));
  const newCards = toAward.filter((k) => !ownedSet.has(k));

  if (newCards.length === 0) return [];

  // Verify these cards exist in the catalog (avoid FK errors)
  const { data: validCards } = await supabase
    .from("cosmic_cards")
    .select("card_key")
    .in("card_key", newCards);

  const validSet = new Set((validCards ?? []).map((c: { card_key: string }) => c.card_key));
  const toInsert = newCards.filter((k) => validSet.has(k));

  if (toInsert.length === 0) return [];

  await supabase.from("user_cosmic_cards").upsert(
    toInsert.map((card_key) => ({ user_id: userId, card_key })),
    { onConflict: "user_id,card_key", ignoreDuplicates: true }
  );

  return toInsert;
}
