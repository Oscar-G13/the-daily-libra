// ─────────────────────────────────────────────────────────────────────────────
//  Trophy definitions — 20 trophies, up to 4 tiers each
// ─────────────────────────────────────────────────────────────────────────────

import type { TrophyDef, TrophyStatus, TrophyTier } from "@/types";

export const TROPHIES: TrophyDef[] = [
  {
    id: "the_ritual",
    label: "The Ritual",
    icon: "🕯️",
    description: "Accumulate readings. Each one a sacred act.",
    tiers: [
      { tier: "bronze", threshold: 10, label: "10 Readings" },
      { tier: "silver", threshold: 25, label: "25 Readings" },
      { tier: "gold", threshold: 50, label: "50 Readings" },
      { tier: "platinum", threshold: 100, label: "100 Readings" },
    ],
  },
  {
    id: "mood_sage",
    label: "Mood Sage",
    icon: "🌊",
    description: "Track your emotional tides with devotion.",
    tiers: [
      { tier: "bronze", threshold: 14, label: "14 Days Logged" },
      { tier: "silver", threshold: 30, label: "30 Days Logged" },
      { tier: "gold", threshold: 60, label: "60 Days Logged" },
      { tier: "platinum", threshold: 90, label: "90 Days Logged" },
    ],
  },
  {
    id: "soul_writer",
    label: "Soul Writer",
    icon: "📖",
    description: "Pour yourself onto the page.",
    tiers: [
      { tier: "bronze", threshold: 7, label: "7 Entries" },
      { tier: "silver", threshold: 25, label: "25 Entries" },
      { tier: "gold", threshold: 50, label: "50 Entries" },
      { tier: "platinum", threshold: 100, label: "100 Entries" },
    ],
  },
  {
    id: "eternal_flame",
    label: "Eternal Flame",
    icon: "🔥",
    description: "Keep your streak alive. Consistency is power.",
    tiers: [
      { tier: "bronze", threshold: 7, label: "7-Day Streak" },
      { tier: "silver", threshold: 14, label: "14-Day Streak" },
      { tier: "gold", threshold: 30, label: "30-Day Streak" },
      { tier: "platinum", threshold: 60, label: "60-Day Streak" },
    ],
  },
  {
    id: "moon_child",
    label: "Moon Child",
    icon: "🌙",
    description: "Show up for yourself, day after day.",
    tiers: [
      { tier: "bronze", threshold: 7, label: "7 Days Active" },
      { tier: "silver", threshold: 14, label: "14 Days Active" },
      { tier: "gold", threshold: 30, label: "30 Days Active" },
      { tier: "platinum", threshold: 90, label: "90 Days Active" },
    ],
  },
  {
    id: "shadow_hunter",
    label: "Shadow Hunter",
    icon: "🌑",
    description: "Face what others look away from.",
    tiers: [
      { tier: "bronze", threshold: 3, label: "3 Shadow Readings" },
      { tier: "silver", threshold: 7, label: "7 Shadow Readings" },
      { tier: "gold", threshold: 15, label: "15 Shadow Readings" },
      { tier: "platinum", threshold: 30, label: "30 Shadow Readings" },
    ],
  },
  {
    id: "love_seeker",
    label: "Love Seeker",
    icon: "♥️",
    description: "Explore the mysteries of connection.",
    tiers: [
      { tier: "bronze", threshold: 3, label: "3 Love Readings" },
      { tier: "silver", threshold: 7, label: "7 Love Readings" },
      { tier: "gold", threshold: 15, label: "15 Love Readings" },
      { tier: "platinum", threshold: 30, label: "30 Love Readings" },
    ],
  },
  {
    id: "career_oracle",
    label: "Career Oracle",
    icon: "⚡",
    description: "Chart your path with cosmic clarity.",
    tiers: [
      { tier: "bronze", threshold: 3, label: "3 Career Readings" },
      { tier: "silver", threshold: 7, label: "7 Career Readings" },
      { tier: "gold", threshold: 15, label: "15 Career Readings" },
      { tier: "platinum", threshold: 30, label: "30 Career Readings" },
    ],
  },
  {
    id: "companion_keeper",
    label: "Companion Keeper",
    icon: "🪞",
    description: "Your AI companion knows you deeply.",
    tiers: [
      { tier: "bronze", threshold: 5, label: "5 Messages" },
      { tier: "silver", threshold: 20, label: "20 Messages" },
      { tier: "gold", threshold: 50, label: "50 Messages" },
      { tier: "platinum", threshold: 100, label: "100 Messages" },
    ],
  },
  {
    id: "celestial_scholar",
    label: "Celestial Scholar",
    icon: "⭐",
    description: "Study the stars written in your chart.",
    tiers: [
      { tier: "bronze", threshold: 5, label: "5 Chart Views" },
      { tier: "silver", threshold: 15, label: "15 Chart Views" },
      { tier: "gold", threshold: 30, label: "30 Chart Views" },
      { tier: "platinum", threshold: 60, label: "60 Chart Views" },
    ],
  },
  {
    id: "golden_hour",
    label: "Golden Hour",
    icon: "🌟",
    description: "Rise through the cosmic levels.",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Level 5" },
      { tier: "silver", threshold: 10, label: "Level 10" },
      { tier: "gold", threshold: 15, label: "Level 15" },
      { tier: "platinum", threshold: 20, label: "Level 20" },
    ],
  },
  {
    id: "soul_mirror",
    label: "Soul Mirror",
    icon: "🔗",
    description: "Journal and read on the same day — the deepest integration.",
    tiers: [
      { tier: "bronze", threshold: 7, label: "7 Sync Days" },
      { tier: "silver", threshold: 14, label: "14 Sync Days" },
      { tier: "gold", threshold: 30, label: "30 Sync Days" },
      { tier: "platinum", threshold: 60, label: "60 Sync Days" },
    ],
  },
  {
    id: "category_master",
    label: "Category Master",
    icon: "🗺️",
    description: "Explore every dimension of your chart.",
    tiers: [
      { tier: "bronze", threshold: 5, label: "5 Categories" },
      { tier: "silver", threshold: 8, label: "8 Categories" },
      { tier: "gold", threshold: 11, label: "11 Categories" },
      { tier: "platinum", threshold: 13, label: "All Categories" },
    ],
  },
  {
    id: "weekly_warrior",
    label: "Weekly Warrior",
    icon: "⚔️",
    description: "Earn XP in a single week with intensity.",
    tiers: [
      { tier: "bronze", threshold: 100, label: "100 Weekly XP" },
      { tier: "silver", threshold: 300, label: "300 Weekly XP" },
      { tier: "gold", threshold: 500, label: "500 Weekly XP" },
      { tier: "platinum", threshold: 1000, label: "1000 Weekly XP" },
    ],
  },
  {
    id: "mood_detective",
    label: "Mood Detective",
    icon: "🔍",
    description: "Build an emotional data picture.",
    tiers: [
      { tier: "bronze", threshold: 14, label: "14 Mood Entries" },
      { tier: "silver", threshold: 30, label: "30 Mood Entries" },
      { tier: "gold", threshold: 60, label: "60 Mood Entries" },
      { tier: "platinum", threshold: 90, label: "90 Mood Entries" },
    ],
  },
  {
    id: "xp_collector",
    label: "XP Collector",
    icon: "💰",
    description: "Accumulate total XP across your journey.",
    tiers: [
      { tier: "bronze", threshold: 500, label: "500 XP Total" },
      { tier: "silver", threshold: 1500, label: "1500 XP Total" },
      { tier: "gold", threshold: 5000, label: "5000 XP Total" },
      { tier: "platinum", threshold: 15000, label: "15000 XP Total" },
    ],
  },
  {
    id: "tone_explorer",
    label: "Tone Explorer",
    icon: "🎭",
    description: "Every voice of the cosmos speaks through you.",
    tiers: [
      { tier: "bronze", threshold: 2, label: "2 Tones Used" },
      { tier: "silver", threshold: 3, label: "3 Tones Used" },
      { tier: "gold", threshold: 4, label: "4 Tones Used" },
      { tier: "platinum", threshold: 5, label: "All 5 Tones" },
    ],
  },
  {
    id: "healing_light",
    label: "Healing Light",
    icon: "✨",
    description: "Turn toward healing, again and again.",
    tiers: [
      { tier: "bronze", threshold: 3, label: "3 Healing Readings" },
      { tier: "silver", threshold: 7, label: "7 Healing Readings" },
      { tier: "gold", threshold: 15, label: "15 Healing Readings" },
      { tier: "platinum", threshold: 30, label: "30 Healing Readings" },
    ],
  },
  {
    id: "cosmic_aligned",
    label: "Cosmic Aligned",
    icon: "♎",
    description: "Level 10, 7-day streak, and 30+ readings — true dedication.",
    tiers: [{ tier: "platinum", threshold: 1, label: "Cosmic Alignment" }],
  },
  {
    id: "libra_rising",
    label: "Libra Rising",
    icon: "🌅",
    description: "Unlocked all achievements. You are complete.",
    tiers: [{ tier: "platinum", threshold: 1, label: "All Unlocked" }],
  },
];

// ─── Trophy status computation ────────────────────────────────────────────────

export interface TrophyStats {
  readingCount: number;
  shadowReadingCount: number;
  loveReadingCount: number;
  careerReadingCount: number;
  healingReadingCount: number;
  journalCount: number;
  moodLogTotal: number;
  appStreak: number;
  appDaysActive: number;
  companionMessageCount: number;
  chartViewCount: number;
  xpLevel: number;
  xpTotal: number;
  weeklyXP: number;
  categoriesUsed: string[];
  tonesUsed: string[];
  soulSyncDays: number;
  weeklyXPBest: number;
  allAchievementsUnlocked: boolean;
  isCosmicAligned: boolean;
}

const TIER_ORDER: TrophyTier[] = ["bronze", "silver", "gold", "platinum"];

function getProgress(stats: TrophyStats, trophyId: string): number {
  switch (trophyId) {
    case "the_ritual":
      return stats.readingCount;
    case "mood_sage":
      return stats.moodLogTotal;
    case "soul_writer":
      return stats.journalCount;
    case "eternal_flame":
      return stats.appStreak;
    case "moon_child":
      return stats.appDaysActive;
    case "shadow_hunter":
      return stats.shadowReadingCount;
    case "love_seeker":
      return stats.loveReadingCount;
    case "career_oracle":
      return stats.careerReadingCount;
    case "companion_keeper":
      return stats.companionMessageCount;
    case "celestial_scholar":
      return stats.chartViewCount;
    case "golden_hour":
      return stats.xpLevel;
    case "soul_mirror":
      return stats.soulSyncDays;
    case "category_master":
      return stats.categoriesUsed.length;
    case "weekly_warrior":
      return stats.weeklyXPBest;
    case "mood_detective":
      return stats.moodLogTotal;
    case "xp_collector":
      return stats.xpTotal;
    case "tone_explorer":
      return stats.tonesUsed.length;
    case "healing_light":
      return stats.healingReadingCount;
    case "cosmic_aligned":
      return stats.isCosmicAligned ? 1 : 0;
    case "libra_rising":
      return stats.allAchievementsUnlocked ? 1 : 0;
    default:
      return 0;
  }
}

export function computeTrophyStatus(
  trophy: TrophyDef,
  stats: TrophyStats,
  earnedTiers: TrophyTier[]
): TrophyStatus {
  const progress = getProgress(stats, trophy.id);
  const earned = new Set(earnedTiers);

  // Find highest tier where threshold is met
  let earnedTier: TrophyTier | undefined;
  for (const tierDef of trophy.tiers) {
    if (progress >= tierDef.threshold) earnedTier = tierDef.tier;
  }

  // Next tier to unlock
  let nextTier: TrophyTier | undefined;
  let nextTierThreshold = 0;
  for (const tierDef of trophy.tiers) {
    if (!earned.has(tierDef.tier) && progress < tierDef.threshold) {
      nextTier = tierDef.tier;
      nextTierThreshold = tierDef.threshold;
      break;
    }
  }

  if (!nextTier && trophy.tiers.length > 0) {
    // All tiers earned
    nextTierThreshold = trophy.tiers[trophy.tiers.length - 1].threshold;
  }

  return { ...trophy, earnedTier, progress, nextTierThreshold, nextTier };
}

export function computeAllTrophies(
  stats: TrophyStats,
  userEarnedTiers: Record<string, TrophyTier[]>
): TrophyStatus[] {
  return TROPHIES.map((t) => computeTrophyStatus(t, stats, userEarnedTiers[t.id] ?? []));
}

/** Returns newly earned trophy tiers — i.e. progress now meets threshold but wasn't recorded */
export function getNewlyEarnedTiers(
  stats: TrophyStats,
  existingTiers: Record<string, TrophyTier[]>
): { trophyId: string; tier: TrophyTier }[] {
  const result: { trophyId: string; tier: TrophyTier }[] = [];
  for (const trophy of TROPHIES) {
    const progress = getProgress(stats, trophy.id);
    const earned = new Set(existingTiers[trophy.id] ?? []);
    for (const tierDef of trophy.tiers) {
      if (progress >= tierDef.threshold && !earned.has(tierDef.tier)) {
        result.push({ trophyId: trophy.id, tier: tierDef.tier });
      }
    }
  }
  return result;
}

export { TIER_ORDER };
