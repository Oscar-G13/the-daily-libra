import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTransitsForDate } from "@/lib/astrology/transits";
import { hasFullAccess } from "@/lib/premium";

export interface WeeklyOutlook {
  week_start: string;
  week_end: string;
  week_label: string;
  energy_score: number;           // 1-10
  highlight_type: "best_window" | "challenge" | "neutral";
  transit_summary: string;
  retrogrades: string[];
  key_transit: string | null;
  moon_phases: { date: string; phase: string }[];
}

function scoreWeek(
  harmonious: number,
  challenging: number,
  retrogradeCount: number
): { score: number; highlight_type: "best_window" | "challenge" | "neutral" } {
  // Base score from aspect balance
  const total = harmonious + challenging;
  const base = total === 0 ? 5 : Math.round(5 + ((harmonious - challenging) / total) * 4);
  const score = Math.max(1, Math.min(10, base - retrogradeCount));
  return {
    score,
    highlight_type: score >= 7 ? "best_window" : score <= 4 ? "challenge" : "neutral",
  };
}

function moonPhaseName(phase: number): string | null {
  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase > 0.48 && phase < 0.52) return "Full Moon";
  if (phase > 0.22 && phase < 0.27) return "First Quarter";
  if (phase > 0.73 && phase < 0.77) return "Last Quarter";
  return null;
}

function buildWeeklySummary(
  sunSign: string,
  moonSign: string,
  retrogrades: string[],
  harmonious: number,
  challenging: number,
  score: number,
  highlight: string
): string {
  const energyWord = score >= 7 ? "expansive" : score <= 4 ? "tense" : "steady";
  const retro = retrogrades.length > 0 ? ` ${retrogrades.join(" & ")} retrograde keeps energy internalized.` : "";
  const direction = highlight === "best_window"
    ? " Lean into decisions, connections, and forward movement."
    : highlight === "challenge"
    ? " Slow down, review, and allow rather than push."
    : " Balance active and receptive energy through the week.";
  return `Sun in ${sunSign}, Moon moving through ${moonSign}. ${energyWord.charAt(0).toUpperCase() + energyWord.slice(1)} energy this week.${retro}${direction}`;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const isPremium = hasFullAccess(userData?.subscription_tier);

  const { searchParams } = new URL(req.url);
  const requestedDays = parseInt(searchParams.get("days") ?? "30", 10);
  const maxDays = isPremium ? 90 : 7;
  const days = Math.min(requestedDays, maxDays);

  // Build weekly outlooks
  const weeks: WeeklyOutlook[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalWeeks = Math.ceil(days / 7);

  for (let w = 0; w < totalWeeks; w++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let harmonious = 0;
    let challenging = 0;
    const retrogradeSet = new Set<string>();
    const moonPhases: { date: string; phase: string }[] = [];

    let sunSign = "";
    let moonSign = "";

    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      const snapshot = getTransitsForDate(day);

      if (d === 3) {
        sunSign = snapshot.planets.find((p) => p.planet === "Sun")?.sign ?? "";
        moonSign = snapshot.moonSign;
      }

      for (const aspect of snapshot.aspects) {
        if (aspect.isHarmonious) harmonious++;
        else challenging++;
      }

      snapshot.planets.filter((p) => p.retrograde).forEach((p) => retrogradeSet.add(p.planet));

      const phaseName = moonPhaseName(snapshot.moonPhase);
      if (phaseName) {
        const dayStr = day.toISOString().split("T")[0];
        if (!moonPhases.find((mp) => mp.phase === phaseName)) {
          moonPhases.push({ date: dayStr, phase: phaseName });
        }
      }
    }

    const retrogrades = Array.from(retrogradeSet);
    const { score, highlight_type } = scoreWeek(harmonious, challenging, retrogrades.length);

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    // Week label
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const weekLabel = `${fmt(weekStart)} – ${fmt(weekEnd)}`;

    const transit_summary = buildWeeklySummary(
      sunSign, moonSign, retrogrades, harmonious, challenging, score, highlight_type
    );

    // Key transit: most significant aspect of the week midpoint
    const midSnapshot = getTransitsForDate(new Date(weekStart.getTime() + 3.5 * 86400000));
    const keyAspect = midSnapshot.aspects[0];
    const key_transit = keyAspect
      ? `${keyAspect.planet1} ${keyAspect.type} ${keyAspect.planet2}`
      : null;

    weeks.push({
      week_start: weekStartStr,
      week_end: weekEndStr,
      week_label: weekLabel,
      energy_score: score,
      highlight_type,
      transit_summary,
      retrogrades,
      key_transit,
      moon_phases: moonPhases,
    });
  }

  return NextResponse.json({
    weeks,
    days,
    isPremium,
    generated_at: new Date().toISOString(),
  });
}
