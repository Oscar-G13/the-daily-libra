// ─────────────────────────────────────────────────────────────────────────────
//  Gamification Engine — server-side XP award + achievement/trophy checking
// ─────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GamificationResult, XPAction, TrophyTier } from "@/types";
import { getLevelFromXP } from "./levels";
import { computeAchievements, getNewlyUnlocked, ACHIEVEMENTS } from "./achievements";
import { getNewlyEarnedTiers, TROPHIES } from "./trophies";
import type { AchievementStats } from "./achievements";
import type { TrophyStats } from "./trophies";

export const XP_VALUES: Record<XPAction, number> = {
  reading: 50,
  journal: 30,
  mood: 20,
  companion: 10,
  ritual: 15,
  streak_bonus: 5,
};

// ─── Main function ────────────────────────────────────────────────────────────

export async function awardXP(
  userId: string,
  action: XPAction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): Promise<GamificationResult> {
  const xpAwarded = XP_VALUES[action];

  // 1. Fetch current user XP + level
  const { data: user } = await supabase
    .from("users")
    .select("xp_total, xp_level, weekly_xp, weekly_xp_best, weekly_xp_reset_date, app_streak")
    .eq("id", userId)
    .single();

  const currentXP = user?.xp_total ?? 0;
  const levelBefore = user?.xp_level ?? getLevelFromXP(currentXP);
  const newTotal = currentXP + xpAwarded;
  const levelAfter = getLevelFromXP(newTotal);
  const leveledUp = levelAfter > levelBefore;

  // Weekly XP reset logic
  const weekStart = getWeekStart();
  let weeklyXP = user?.weekly_xp ?? 0;
  let weeklyXPBest = user?.weekly_xp_best ?? 0;
  if (!user?.weekly_xp_reset_date || user.weekly_xp_reset_date < weekStart) {
    if (weeklyXP > weeklyXPBest) weeklyXPBest = weeklyXP;
    weeklyXP = 0;
  }
  weeklyXP += xpAwarded;
  if (weeklyXP > weeklyXPBest) weeklyXPBest = weeklyXP;

  // 2. Update user XP
  await supabase
    .from("users")
    .update({
      xp_total: newTotal,
      xp_level: levelAfter,
      weekly_xp: weeklyXP,
      weekly_xp_best: weeklyXPBest,
      weekly_xp_reset_date: weekStart,
    })
    .eq("id", userId);

  // 3. Fetch stats needed for achievements + trophies
  const [
    { count: readingCount },
    { count: journalCount },
    { count: moodLogTotal },
    { data: moodLogs },
    { data: readings },
    { data: aiMemory },
    { data: birthProfile },
    { data: libraProfile },
    { data: earnedAchievements },
    { data: earnedTrophyRows },
    { data: journalDates },
    { data: moodDates },
  ] = await Promise.all([
    supabase
      .from("daily_readings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase.from("mood_logs").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("mood_logs").select("mood_score, log_date").eq("user_id", userId),
    supabase.from("daily_readings").select("category, tone").eq("user_id", userId),
    supabase.from("ai_memory").select("id").eq("user_id", userId).limit(20),
    supabase.from("birth_profiles").select("id").eq("user_id", userId).single(),
    supabase.from("libra_profiles").select("primary_archetype").eq("user_id", userId).single(),
    supabase.from("user_achievements").select("achievement_id, earned_at").eq("user_id", userId),
    supabase.from("user_trophies").select("trophy_id, tier").eq("user_id", userId),
    supabase.from("journal_entries").select("created_at").eq("user_id", userId),
    supabase.from("mood_logs").select("log_date").eq("user_id", userId),
  ]);

  const categoriesUsed = [
    ...new Set((readings ?? []).map((r: { category: string }) => r.category)),
  ];
  const tonesUsed = [
    ...new Set((readings ?? []).map((r: { tone: string }) => r.tone).filter(Boolean)),
  ];
  const moodScoresLogged = [
    ...new Set((moodLogs ?? []).map((m: { mood_score: number }) => m.mood_score).filter(Boolean)),
  ];
  const existingAchievementIds = (earnedAchievements ?? []).map(
    (a: { achievement_id: string }) => a.achievement_id
  );

  // Soul sync days: days with both journal + mood
  const journalDaySet = new Set(
    (journalDates ?? []).map((j: { created_at: string }) => j.created_at.split("T")[0])
  );
  const moodDaySet = new Set((moodDates ?? []).map((m: { log_date: string }) => m.log_date));
  const soulSyncDays = [...journalDaySet].filter((d) => moodDaySet.has(d)).length;

  // Unique mood log days
  const moodLogDays = moodDaySet.size;
  const appStreak = user?.app_streak ?? 0;

  const achStats: AchievementStats = {
    readingCount: readingCount ?? 0,
    journalCount: journalCount ?? 0,
    moodLogDays,
    appStreak,
    hasCompanionMessages: (aiMemory?.length ?? 0) > 0,
    companionMessageCount: aiMemory?.length ?? 0,
    hasBirthChart: !!birthProfile,
    onboardingComplete: true,
    assessmentComplete: !!libraProfile?.primary_archetype,
    archetypeKnown: !!libraProfile?.primary_archetype,
    categoriesUsed,
    tonesUsed,
    moodScoresLogged,
    moodLogTotal: moodLogTotal ?? 0,
    hasShadowReading: categoriesUsed.includes("shadow"),
    hasWeeklyReading: categoriesUsed.includes("weekly"),
    hasMonthlyReading: categoriesUsed.includes("monthly"),
    soulSyncDays,
    xpLevel: levelAfter,
    unlockedAchievementIds: existingAchievementIds,
  };

  const computedAchievements = computeAchievements(achStats);
  const newlyUnlockedAchievements = getNewlyUnlocked(computedAchievements, existingAchievementIds);

  // 4. Persist newly unlocked achievements
  if (newlyUnlockedAchievements.length > 0) {
    await supabase.from("user_achievements").upsert(
      newlyUnlockedAchievements.map((a) => ({
        user_id: userId,
        achievement_id: a.id,
        earned_at: new Date().toISOString(),
      })),
      { onConflict: "user_id,achievement_id", ignoreDuplicates: true }
    );
  }

  // 5. Trophy checking
  const earnedTierMap: Record<string, TrophyTier[]> = {};
  for (const row of earnedTrophyRows ?? []) {
    const r = row as { trophy_id: string; tier: TrophyTier };
    if (!earnedTierMap[r.trophy_id]) earnedTierMap[r.trophy_id] = [];
    earnedTierMap[r.trophy_id].push(r.tier);
  }

  const allAchievementsUnlocked =
    existingAchievementIds.length + newlyUnlockedAchievements.length >= ACHIEVEMENTS.length;

  const trophyStats: TrophyStats = {
    readingCount: readingCount ?? 0,
    shadowReadingCount: (readings ?? []).filter(
      (r: { category: string }) => r.category === "shadow"
    ).length,
    loveReadingCount: (readings ?? []).filter((r: { category: string }) => r.category === "love")
      .length,
    careerReadingCount: (readings ?? []).filter(
      (r: { category: string }) => r.category === "career"
    ).length,
    healingReadingCount: (readings ?? []).filter(
      (r: { category: string }) => r.category === "healing"
    ).length,
    journalCount: journalCount ?? 0,
    moodLogTotal: moodLogTotal ?? 0,
    appStreak,
    appDaysActive: moodLogDays,
    companionMessageCount: aiMemory?.length ?? 0,
    chartViewCount: 0, // tracked separately
    xpLevel: levelAfter,
    xpTotal: newTotal,
    weeklyXP,
    categoriesUsed,
    tonesUsed,
    soulSyncDays,
    weeklyXPBest,
    allAchievementsUnlocked,
    isCosmicAligned: levelAfter >= 10 && appStreak >= 7 && (readingCount ?? 0) >= 30,
  };

  const newlyEarnedTiers = getNewlyEarnedTiers(trophyStats, earnedTierMap);

  // 6. Persist newly earned trophy tiers
  if (newlyEarnedTiers.length > 0) {
    await supabase.from("user_trophies").upsert(
      newlyEarnedTiers.map(({ trophyId, tier }) => ({
        user_id: userId,
        trophy_id: trophyId,
        tier,
        earned_at: new Date().toISOString(),
      })),
      { onConflict: "user_id,trophy_id,tier", ignoreDuplicates: true }
    );
  }

  const newTrophies = newlyEarnedTiers.map(({ trophyId, tier }) => ({
    trophy: TROPHIES.find((t) => t.id === trophyId)!,
    tier,
  }));

  return {
    xpAwarded,
    newTotal,
    levelBefore,
    levelAfter,
    leveledUp,
    newAchievements: newlyUnlockedAchievements,
    newTrophies,
  };
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}
