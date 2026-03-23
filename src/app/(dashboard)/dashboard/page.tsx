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
import { formatDate } from "@/lib/utils";
import type { NatalChart } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Date range for mood trend (last 14 days)
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);

  const [
    { data: userData },
    { data: birthProfile },
    { data: libraProfile },
    { data: todaysMood },
    { data: latestReading },
    { data: assessmentProfile },
    { data: moodLogs },
    { data: topTraits },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("display_name, tone_preference, subscription_tier")
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
      .gte("log_date", twoWeeksAgo.toISOString().split("T")[0])
      .order("log_date", { ascending: true }),
    supabase
      .from("user_profile_traits")
      .select("trait_key, normalized_score, percentile_band")
      .eq("user_id", user!.id)
      .order("normalized_score", { ascending: false })
      .limit(10),
  ]);

  const chart = birthProfile?.natal_chart_json as NatalChart | null;

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
        {/* Daily reading — spans 2 cols */}
        <div className="lg:col-span-2">
          <DailyReadingCard
            userId={user!.id}
            tone={userData?.tone_preference ?? "gentle"}
            existingReading={latestReading?.output_text ?? null}
            readingDate={latestReading?.reading_date ?? null}
          />
        </div>

        {/* Moon phase */}
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

      {/* Secondary grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ChartSnapshot chart={chart} />
        {topTraits && topTraits.length > 0 && (
          <ArchetypeCard
            archetype={libraProfile?.primary_archetype ?? null}
            modifier={libraProfile?.secondary_modifier ?? null}
          />
        )}
        <RitualCard userId={user!.id} />
      </div>

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
