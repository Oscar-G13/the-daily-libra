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
import { formatDate } from "@/lib/utils";
import type { NatalChart } from "@/types";

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
  ] = await Promise.all([
    supabase
      .from("users")
      .select("display_name, tone_preference, subscription_tier, app_streak, last_active_date")
      .eq("id", user!.id)
      .single(),
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
  ]);

  const chart = birthProfile?.natal_chart_json as NatalChart | null;
  const appStreak = userData?.app_streak ?? 0;

  // Compute journal streak from recent entries
  const journalStreak = (() => {
    if (!journalDates || journalDates.length === 0) return 0;
    const dates = Array.from(
      new Set(journalDates.map((j) => j.created_at.split("T")[0])),
    ).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let cursor = new Date();
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

      {/* Archetype card (shown when assessment done) */}
      {topTraits && topTraits.length > 0 && (
        <ArchetypeCard
          archetype={libraProfile?.primary_archetype ?? null}
          modifier={libraProfile?.secondary_modifier ?? null}
        />
      )}

      {/* Achievements */}
      <AchievementsStrip
        readingCount={readingCount ?? 0}
        assessmentComplete={!!assessmentProfile}
        journalCount={journalCount ?? 0}
        moodLogDays={moodDayCount ?? 0}
        hasCompanionMessages={(aiMemory?.length ?? 0) > 0}
        hasBirthChart={!!birthProfile}
        onboardingComplete={true}
      />

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
