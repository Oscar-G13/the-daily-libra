import { createClient } from "@/lib/supabase/server";
import { DailyReadingCard } from "@/components/dashboard/daily-reading-card";
import { ArchetypeCard } from "@/components/dashboard/archetype-card";
import { ChartSnapshot } from "@/components/dashboard/chart-snapshot";
import { MoodCheckin } from "@/components/dashboard/mood-checkin";
import { RitualCard } from "@/components/dashboard/ritual-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AssessmentCTA } from "@/components/dashboard/assessment-cta";
import { AssessmentProfileCard } from "@/components/dashboard/assessment-profile-card";
import { MoonPhaseCard } from "@/components/dashboard/moon-phase-card";
import { MoodTrendCard } from "@/components/dashboard/mood-trend-card";
import { TraitPulseCard } from "@/components/dashboard/trait-pulse-card";
import { StreakCard } from "@/components/dashboard/streak-card";
import { AchievementsStrip } from "@/components/dashboard/achievements-strip";
import { ReadingHistoryStrip } from "@/components/dashboard/reading-history-strip";
import { CosmicRankCard } from "@/components/gamification/cosmic-rank-card";
import { DailyChallenges } from "@/components/challenges/daily-challenges";
import { CosmicWeatherCard } from "@/components/dashboard/cosmic-weather-card";
import { HarmonyScoreCard } from "@/components/dashboard/harmony-score-card";
import { VenusTrackerCard } from "@/components/dashboard/venus-tracker-card";
import { formatDate } from "@/lib/utils";
import { computeAchievements } from "@/lib/gamification/achievements";
import { computeAllTrophies, TROPHIES } from "@/lib/gamification/trophies";
import { getCurrentTransits } from "@/lib/astrology/transits";
import { computeHarmonyScore } from "@/lib/astrology/harmony";
import { getVenusStatus, getVenusHouseInsight } from "@/lib/astrology/venus";
import type { NatalChart, TrophyTier } from "@/types";
import type { ZodiacSign } from "@/lib/astrology/transits";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 14-day window for mood trend
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
  const twoWeeksAgoStr = twoWeeksAgo.toISOString().split("T")[0];

  const [
    { data: userData },
    { data: birthProfile },
    { data: libraProfile },
    { data: todaysMood },
    { data: latestReading },
    { data: assessmentProfile },
    { data: moodLogs },
    { data: topTraits },
    { count: journalCount },
    { count: moodDayCount },
    { count: readingCount },
    { data: aiMemory },
    { data: journalDates },
    { data: recentReadings },
    { data: allReadings },
    { data: earnedAchievementsRows },
    { data: earnedTrophyRows },
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("users")
      .select(
        "display_name, tone_preference, subscription_tier, app_streak, last_active_date, xp_total, xp_level, weekly_xp, weekly_xp_best"
      )
      .eq("id", user!.id)
      .single() as Promise<{
      data: {
        display_name: string | null;
        tone_preference: string | null;
        subscription_tier: string | null;
        app_streak: number | null;
        last_active_date: string | null;
        xp_total: number | null;
        xp_level: number | null;
        weekly_xp: number | null;
        weekly_xp_best: number | null;
      } | null;
    }>,
    supabase.from("birth_profiles").select("natal_chart_json").eq("user_id", user!.id).single(),
    supabase.from("libra_profiles").select("*").eq("user_id", user!.id).single(),
    supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", user!.id)
      .eq("log_date", new Date().toISOString().split("T")[0])
      .single(),
    supabase
      .from("daily_readings")
      .select("*")
      .eq("user_id", user!.id)
      .eq("category", "daily")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("user_profile_summary")
      .select("archetype_label, archetype_subtitle")
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("mood_logs")
      .select("log_date, mood_score")
      .eq("user_id", user!.id)
      .gte("log_date", twoWeeksAgoStr)
      .order("log_date", { ascending: true }),
    supabase
      .from("user_profile_traits")
      .select("trait_key, normalized_score, percentile_band")
      .eq("user_id", user!.id)
      .order("normalized_score", { ascending: false })
      .limit(10),
    supabase
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("mood_logs")
      .select("log_date", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("daily_readings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase.from("ai_memory").select("id").eq("user_id", user!.id).limit(1),
    supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("daily_readings")
      .select("id, category, tone, reading_date, output_text")
      .eq("user_id", user!.id)
      .order("reading_date", { ascending: false })
      .limit(8),
    supabase.from("daily_readings").select("category, tone").eq("user_id", user!.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("user_achievements")
      .select("achievement_id, earned_at")
      .eq("user_id", user!.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("user_trophies").select("trophy_id, tier").eq("user_id", user!.id),
  ]);

  const chart = birthProfile?.natal_chart_json as NatalChart | null;
  const appStreak = userData?.app_streak ?? 0;

  // ── Gamification ────────────────────────────────────────────────────────────
  const categoriesUsed = Array.from(new Set((allReadings ?? []).map((r) => r.category as string)));
  const tonesUsed = Array.from(
    new Set((allReadings ?? []).map((r) => r.tone as string).filter(Boolean))
  );
  const existingAchievementIds = (earnedAchievementsRows ?? []).map(
    (a: { achievement_id: string }) => a.achievement_id
  );

  const earnedTierMap: Record<string, TrophyTier[]> = {};
  for (const row of earnedTrophyRows ?? []) {
    const r = row as { trophy_id: string; tier: TrophyTier };
    if (!earnedTierMap[r.trophy_id]) earnedTierMap[r.trophy_id] = [];
    earnedTierMap[r.trophy_id].push(r.tier);
  }

  // Journal + mood sync days
  const journalDaySet = new Set((journalDates ?? []).map((j) => j.created_at.split("T")[0]));
  const moodDaySet = new Set((moodLogs ?? []).map((l) => l.log_date));
  const soulSyncDays = Array.from(journalDaySet).filter((d) => moodDaySet.has(d)).length;
  const moodScoresLogged = Array.from(
    new Set((moodLogs ?? []).map((m) => m.mood_score).filter((v): v is number => v != null))
  );
  const xpLevel = userData?.xp_level ?? 1;
  const xpTotal = userData?.xp_total ?? 0;
  const weeklyXP = userData?.weekly_xp ?? 0;
  const weeklyXPBest = userData?.weekly_xp_best ?? 0;

  const computedAchievements = computeAchievements({
    readingCount: readingCount ?? 0,
    journalCount: journalCount ?? 0,
    moodLogDays: moodDayCount ?? 0,
    appStreak,
    hasCompanionMessages: (aiMemory?.length ?? 0) > 0,
    companionMessageCount: aiMemory?.length ?? 0,
    hasBirthChart: !!birthProfile,
    onboardingComplete: true,
    assessmentComplete: !!assessmentProfile,
    archetypeKnown: !!libraProfile?.primary_archetype,
    categoriesUsed,
    tonesUsed,
    moodScoresLogged,
    moodLogTotal: moodDayCount ?? 0,
    hasShadowReading: categoriesUsed.includes("shadow"),
    hasWeeklyReading: categoriesUsed.includes("weekly"),
    hasMonthlyReading: categoriesUsed.includes("monthly"),
    soulSyncDays,
    xpLevel,
    unlockedAchievementIds: existingAchievementIds,
  });

  const allAchievementsUnlocked = existingAchievementIds.length >= 30;
  const computedTrophies = computeAllTrophies(
    {
      readingCount: readingCount ?? 0,
      shadowReadingCount: (allReadings ?? []).filter((r) => r.category === "shadow").length,
      loveReadingCount: (allReadings ?? []).filter((r) => r.category === "love").length,
      careerReadingCount: (allReadings ?? []).filter((r) => r.category === "career").length,
      healingReadingCount: (allReadings ?? []).filter((r) => r.category === "healing").length,
      journalCount: journalCount ?? 0,
      moodLogTotal: moodDayCount ?? 0,
      appStreak,
      appDaysActive: moodDayCount ?? 0,
      companionMessageCount: aiMemory?.length ?? 0,
      chartViewCount: 0,
      xpLevel,
      xpTotal,
      weeklyXP,
      categoriesUsed,
      tonesUsed,
      soulSyncDays,
      weeklyXPBest,
      allAchievementsUnlocked,
      isCosmicAligned: xpLevel >= 10 && appStreak >= 7 && (readingCount ?? 0) >= 30,
    },
    earnedTierMap
  );

  const trophyCount = Array.from(
    new Set((earnedTrophyRows ?? []).map((r: { trophy_id: string }) => r.trophy_id))
  ).length;

  // Compute journal streak from recent entries
  const journalStreak = (() => {
    if (!journalDates || journalDates.length === 0) return 0;
    const dates = Array.from(new Set(journalDates.map((j) => j.created_at.split("T")[0]))).sort(
      (a, b) => b.localeCompare(a)
    );
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (const d of dates) {
      const curStr = cursor.toISOString().split("T")[0];
      if (d === curStr) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  })();

  // Active days for streak card dot grid = days with mood logs (last 7 days)
  const activeDays = (moodLogs ?? [])
    .map((l) => l.log_date)
    .filter((d) => {
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() - 6);
      return d >= cutoff.toISOString().split("T")[0];
    });

  // ── Astrology — Transits, Harmony, Venus ─────────────────────────────────
  const transits = getCurrentTransits();
  const todayMoodScore = todaysMood?.mood_score ?? null;
  const harmony = computeHarmonyScore({
    transits,
    moodScore: todayMoodScore,
    streak: appStreak,
    archetype: libraProfile?.primary_archetype ?? null,
  });

  const natalVenusLong = (() => {
    const venusSign = chart?.venus?.sign as ZodiacSign | undefined;
    const venusDeg = (chart?.venus as { degree?: number })?.degree ?? 0;
    if (!venusSign) return undefined;
    const ZODIAC_ORDER = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    const idx = ZODIAC_ORDER.indexOf(venusSign);
    return idx >= 0 ? idx * 30 + venusDeg : undefined;
  })();

  const venus = getVenusStatus(natalVenusLong);
  const ascendantSign = chart?.ascendant?.sign as ZodiacSign | undefined;
  const houseInsight = ascendantSign ? getVenusHouseInsight(venus.sign, ascendantSign) : undefined;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {formatDate(new Date())}
        </p>
        <h1 className="font-serif text-display-sm text-foreground">
          Good to see you, {userData?.display_name?.split(" ")[0] ?? "Libra"}.
        </h1>
      </div>

      {/* Primary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <DailyReadingCard
            userId={user!.id}
            tone={userData?.tone_preference ?? "gentle"}
            existingReading={latestReading?.output_text ?? null}
            readingDate={latestReading?.reading_date ?? null}
          />
        </div>
        <div>
          <MoonPhaseCard />
        </div>
      </div>

      {/* Cosmic Weather + Harmony + Venus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <CosmicWeatherCard transits={transits} />
        <HarmonyScoreCard harmony={harmony} />
        <VenusTrackerCard venus={venus} houseInsight={houseInsight} />
      </div>

      {/* Traits + mood row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {topTraits && topTraits.length > 0 ? (
          <TraitPulseCard traits={topTraits} />
        ) : (
          <ArchetypeCard
            archetype={libraProfile?.primary_archetype ?? null}
            modifier={libraProfile?.secondary_modifier ?? null}
          />
        )}
        <MoodCheckin userId={user!.id} todaysMood={todaysMood} />
        <MoodTrendCard logs={moodLogs ?? []} />
      </div>

      {/* Streak + chart + ritual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StreakCard appStreak={appStreak} journalStreak={journalStreak} activeDays={activeDays} />
        <ChartSnapshot chart={chart} />
        <RitualCard userId={user!.id} />
      </div>

      {/* Daily Challenges */}
      <DailyChallenges />

      {/* Cosmic Rank */}
      <CosmicRankCard
        initialXP={xpTotal}
        initialLevel={xpLevel}
        weeklyXP={weeklyXP}
        weeklyXPBest={weeklyXPBest}
        appStreak={appStreak}
        trophyCount={trophyCount}
        totalTrophies={TROPHIES.length}
      />

      {/* Archetype card (shown when assessment done) */}
      {topTraits && topTraits.length > 0 && (
        <ArchetypeCard
          archetype={libraProfile?.primary_archetype ?? null}
          modifier={libraProfile?.secondary_modifier ?? null}
        />
      )}

      {/* Reading history */}
      <ReadingHistoryStrip readings={recentReadings ?? []} />

      {/* Achievements + Trophies */}
      <AchievementsStrip achievements={computedAchievements} trophies={computedTrophies} />

      {/* Assessment CTA or profile card */}
      {assessmentProfile ? (
        <AssessmentProfileCard
          archetypeLabel={assessmentProfile.archetype_label}
          archetypeSubtitle={assessmentProfile.archetype_subtitle}
        />
      ) : (
        <AssessmentCTA />
      )}

      {/* Quick actions */}
      <QuickActions tier={userData?.subscription_tier ?? "free"} />
    </div>
  );
}
