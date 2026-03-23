// ─────────────────────────────────────────────────────────────────────────────
//  Achievement definitions — 32 achievements across 5 categories
// ─────────────────────────────────────────────────────────────────────────────

import type { AchievementDef, AchievementStatus } from "@/types";

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Explorer ──────────────────────────────────────────────────────────────
  {
    id: "first_light",
    label: "First Light",
    icon: "✦",
    description: "Received your first reading",
    category: "explorer",
  },
  {
    id: "first_journal",
    label: "First Page",
    icon: "📖",
    description: "Wrote your first journal entry",
    category: "explorer",
  },
  {
    id: "birth_chart_viewer",
    label: "Night Chart",
    icon: "🌙",
    description: "Viewed your birth chart",
    category: "explorer",
  },
  {
    id: "companion_starter",
    label: "Mirror Work",
    icon: "🪞",
    description: "Had your first companion conversation",
    category: "explorer",
  },
  {
    id: "full_profile",
    label: "In Balance",
    icon: "⚖️",
    description: "Completed onboarding",
    category: "explorer",
  },
  {
    id: "reading_explorer",
    label: "Category Explorer",
    icon: "🗺️",
    description: "Tried 5 different reading categories",
    category: "explorer",
  },
  {
    id: "tone_master",
    label: "Tone Master",
    icon: "🎭",
    description: "Used all 5 reading tones",
    category: "explorer",
  },
  {
    id: "shadow_reader",
    label: "Shadow Reader",
    icon: "🌑",
    description: "Completed a shadow work reading",
    category: "explorer",
  },
  {
    id: "weekly_reader",
    label: "Weekly Seer",
    icon: "📅",
    description: "Received a weekly forecast",
    category: "explorer",
  },
  {
    id: "monthly_reader",
    label: "Lunar Calendar",
    icon: "🗓️",
    description: "Received a monthly overview",
    category: "explorer",
  },

  // ── Ritual ────────────────────────────────────────────────────────────────
  {
    id: "daily_ritual_3",
    label: "The Ritual Begins",
    icon: "🕯️",
    description: "Received 3 daily readings",
    category: "ritual",
  },
  {
    id: "daily_ritual_10",
    label: "Daily Ritual",
    icon: "🔥",
    description: "Received 10 daily readings",
    category: "ritual",
  },
  {
    id: "daily_ritual_30",
    label: "Devoted",
    icon: "💫",
    description: "Received 30 daily readings",
    category: "ritual",
  },
  {
    id: "streak_week",
    label: "Week of Grace",
    icon: "🌿",
    description: "7-day app streak",
    category: "ritual",
  },
  {
    id: "streak_fortnight",
    label: "Fortnight Flame",
    icon: "🔥",
    description: "14-day app streak",
    category: "ritual",
  },
  {
    id: "streak_month",
    label: "Eternal Flame",
    icon: "♾️",
    description: "30-day app streak",
    category: "ritual",
  },

  // ── Emotional ─────────────────────────────────────────────────────────────
  {
    id: "mood_week",
    label: "Mood Tracker",
    icon: "☁️",
    description: "Logged mood for 7 consecutive days",
    category: "emotional",
  },
  {
    id: "mood_month",
    label: "Emotional Sage",
    icon: "🌊",
    description: "Logged mood for 30 days",
    category: "emotional",
  },
  {
    id: "mood_master",
    label: "Mood Master",
    icon: "🎚️",
    description: "Logged mood for 60 days total",
    category: "emotional",
  },
  {
    id: "journal_week",
    label: "The Writer",
    icon: "✍️",
    description: "7 journal entries",
    category: "emotional",
  },
  {
    id: "journal_month",
    label: "The Scribe",
    icon: "📜",
    description: "25 journal entries",
    category: "emotional",
  },
  {
    id: "emotional_range",
    label: "Full Spectrum",
    icon: "🌈",
    description: "Logged all 5 mood states",
    category: "emotional",
  },
  {
    id: "mood_journal_combo",
    label: "Soul Sync",
    icon: "🔗",
    description: "Logged mood AND journaled on the same day",
    category: "emotional",
  },

  // ── Cosmic ────────────────────────────────────────────────────────────────
  {
    id: "deep_diver",
    label: "Deep Diver",
    icon: "🌑",
    description: "Completed the psyche assessment",
    category: "cosmic",
  },
  {
    id: "archetype_known",
    label: "Know Thyself",
    icon: "🔮",
    description: "Your archetype has been revealed",
    category: "cosmic",
  },
  {
    id: "all_categories",
    label: "Cosmic Scholar",
    icon: "🌌",
    description: "Used all reading categories",
    category: "cosmic",
  },
  {
    id: "companion_depth",
    label: "Soul Conversations",
    icon: "💬",
    description: "10+ companion messages",
    category: "cosmic",
  },
  {
    id: "birth_time_set",
    label: "Chart Complete",
    icon: "⭐",
    description: "Birth chart with exact time set",
    category: "cosmic",
  },
  {
    id: "level_five",
    label: "Chart Reader",
    icon: "🌠",
    description: "Reached level 5",
    category: "cosmic",
  },
  {
    id: "level_ten",
    label: "Astral Voyager",
    icon: "🚀",
    description: "Reached level 10",
    category: "cosmic",
  },

  // ── Libra ─────────────────────────────────────────────────────────────────
  {
    id: "collector",
    label: "The Collector",
    icon: "💎",
    description: "Unlocked 15 achievements",
    category: "libra",
  },
  {
    id: "all_achievements",
    label: "Libra Rising",
    icon: "♎",
    description: "Unlocked every achievement",
    category: "libra",
  },
];

// ─── Stats shape for checking achievements ────────────────────────────────────

export interface AchievementStats {
  readingCount: number;
  journalCount: number;
  moodLogDays: number;
  appStreak: number;
  hasCompanionMessages: boolean;
  companionMessageCount: number;
  hasBirthChart: boolean;
  onboardingComplete: boolean;
  assessmentComplete: boolean;
  archetypeKnown: boolean;
  categoriesUsed: string[];
  tonesUsed: string[];
  moodScoresLogged: number[]; // all unique mood values ever logged
  moodLogTotal: number;
  hasShadowReading: boolean;
  hasWeeklyReading: boolean;
  hasMonthlyReading: boolean;
  soulSyncDays: number; // days with both mood + journal
  xpLevel: number;
  unlockedAchievementIds: string[];
}

export function computeAchievements(stats: AchievementStats): AchievementStatus[] {
  const unlocked = new Set(stats.unlockedAchievementIds);

  function check(
    id: string,
    condition: boolean,
    progress?: { current: number; required: number }
  ): AchievementStatus {
    const def = ACHIEVEMENTS.find((a) => a.id === id)!;
    return { ...def, unlocked: unlocked.has(id) || condition, progress };
  }

  const results: AchievementStatus[] = [
    check("first_light", stats.readingCount >= 1, {
      current: Math.min(stats.readingCount, 1),
      required: 1,
    }),
    check("first_journal", stats.journalCount >= 1, {
      current: Math.min(stats.journalCount, 1),
      required: 1,
    }),
    check("birth_chart_viewer", stats.hasBirthChart),
    check("companion_starter", stats.hasCompanionMessages),
    check("full_profile", stats.onboardingComplete),
    check("reading_explorer", stats.categoriesUsed.length >= 5, {
      current: Math.min(stats.categoriesUsed.length, 5),
      required: 5,
    }),
    check("tone_master", stats.tonesUsed.length >= 5, {
      current: Math.min(stats.tonesUsed.length, 5),
      required: 5,
    }),
    check("shadow_reader", stats.hasShadowReading),
    check("weekly_reader", stats.hasWeeklyReading),
    check("monthly_reader", stats.hasMonthlyReading),
    check("daily_ritual_3", stats.readingCount >= 3, {
      current: Math.min(stats.readingCount, 3),
      required: 3,
    }),
    check("daily_ritual_10", stats.readingCount >= 10, {
      current: Math.min(stats.readingCount, 10),
      required: 10,
    }),
    check("daily_ritual_30", stats.readingCount >= 30, {
      current: Math.min(stats.readingCount, 30),
      required: 30,
    }),
    check("streak_week", stats.appStreak >= 7, {
      current: Math.min(stats.appStreak, 7),
      required: 7,
    }),
    check("streak_fortnight", stats.appStreak >= 14, {
      current: Math.min(stats.appStreak, 14),
      required: 14,
    }),
    check("streak_month", stats.appStreak >= 30, {
      current: Math.min(stats.appStreak, 30),
      required: 30,
    }),
    check("mood_week", stats.moodLogDays >= 7, {
      current: Math.min(stats.moodLogDays, 7),
      required: 7,
    }),
    check("mood_month", stats.moodLogDays >= 30, {
      current: Math.min(stats.moodLogDays, 30),
      required: 30,
    }),
    check("mood_master", stats.moodLogTotal >= 60, {
      current: Math.min(stats.moodLogTotal, 60),
      required: 60,
    }),
    check("journal_week", stats.journalCount >= 7, {
      current: Math.min(stats.journalCount, 7),
      required: 7,
    }),
    check("journal_month", stats.journalCount >= 25, {
      current: Math.min(stats.journalCount, 25),
      required: 25,
    }),
    check("emotional_range", stats.moodScoresLogged.length >= 5, {
      current: Math.min(stats.moodScoresLogged.length, 5),
      required: 5,
    }),
    check("mood_journal_combo", stats.soulSyncDays >= 1),
    check("deep_diver", stats.assessmentComplete),
    check("archetype_known", stats.archetypeKnown),
    check("all_categories", stats.categoriesUsed.length >= 10, {
      current: Math.min(stats.categoriesUsed.length, 10),
      required: 10,
    }),
    check("companion_depth", stats.companionMessageCount >= 10, {
      current: Math.min(stats.companionMessageCount, 10),
      required: 10,
    }),
    check("birth_time_set", stats.hasBirthChart),
    check("level_five", stats.xpLevel >= 5, { current: Math.min(stats.xpLevel, 5), required: 5 }),
    check("level_ten", stats.xpLevel >= 10, { current: Math.min(stats.xpLevel, 10), required: 10 }),
  ];

  // Meta achievements
  const currentlyUnlocked = results.filter((a) => a.unlocked).length;
  results.push(
    check("collector", currentlyUnlocked >= 15, {
      current: Math.min(currentlyUnlocked, 15),
      required: 15,
    }),
    check("all_achievements", currentlyUnlocked >= ACHIEVEMENTS.length - 1)
  );

  return results;
}

/** Returns IDs of achievements that are now newly unlocked (condition true but not in DB yet) */
export function getNewlyUnlocked(
  computed: AchievementStatus[],
  existingIds: string[]
): AchievementStatus[] {
  const existing = new Set(existingIds);
  return computed.filter((a) => a.unlocked && !existing.has(a.id));
}
