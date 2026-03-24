import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { READING_CATEGORY_LABELS } from "@/types";

interface FreqMap { [key: string]: number }

function topN(map: FreqMap, n = 3): { value: string; count: number }[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([value, count]) => ({ value, count }));
}

// Extract meaningful words from journal entry titles and bodies (basic stopword filter)
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "is", "are", "was", "were", "be", "been", "being", "have", "has",
  "had", "do", "does", "did", "will", "would", "could", "should", "may", "might",
  "i", "my", "me", "we", "our", "you", "your", "it", "its", "this", "that",
  "so", "if", "about", "from", "not", "as", "he", "she", "they", "their",
  "am", "im", "just", "really", "very", "like", "feel", "know", "think",
]);

function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().split("T")[0];

  const [
    { data: readings },
    { data: entries },
    { data: moodLogs },
  ] = await Promise.all([
    supabase
      .from("daily_readings")
      .select("category, tone, reading_date")
      .eq("user_id", user.id)
      .gte("reading_date", cutoff)
      .order("reading_date", { ascending: false }),
    supabase
      .from("journal_entries")
      .select("title, body, mood_tag, entry_date")
      .eq("user_id", user.id)
      .gte("entry_date", cutoff)
      .order("entry_date", { ascending: false }),
    supabase
      .from("mood_logs")
      .select("mood_score, log_date")
      .eq("user_id", user.id)
      .gte("log_date", cutoff),
  ]);

  // ── Reading patterns ───────────────────────────────────────────────────────
  const categoryFreq: FreqMap = {};
  const toneFreq: FreqMap = {};
  for (const r of readings ?? []) {
    if (r.category) categoryFreq[r.category] = (categoryFreq[r.category] ?? 0) + 1;
    if (r.tone)     toneFreq[r.tone]     = (toneFreq[r.tone] ?? 0) + 1;
  }

  const topCategories = topN(categoryFreq).map(({ value, count }) => ({
    category: value,
    label: READING_CATEGORY_LABELS[value as keyof typeof READING_CATEGORY_LABELS] ?? value,
    count,
  }));

  const topTones = topN(toneFreq, 1).map(({ value, count }) => ({ tone: value, count }));

  // ── Journal patterns ───────────────────────────────────────────────────────
  const moodTagFreq: FreqMap = {};
  const wordFreq: FreqMap = {};

  for (const e of entries ?? []) {
    if (e.mood_tag) moodTagFreq[e.mood_tag] = (moodTagFreq[e.mood_tag] ?? 0) + 1;
    const words = [
      ...extractWords(e.title ?? ""),
      ...extractWords(e.body ?? ""),
    ];
    for (const w of words) wordFreq[w] = (wordFreq[w] ?? 0) + 1;
  }

  const topMoodTags = topN(moodTagFreq).filter((m) => m.count >= 2);
  const topWords = topN(wordFreq, 5).filter((w) => w.count >= 2);

  // ── Mood patterns ──────────────────────────────────────────────────────────
  const moodScores = (moodLogs ?? []).map((m) => m.mood_score).filter((s): s is number => s != null);
  const avgMood = moodScores.length > 0
    ? Math.round((moodScores.reduce((a, b) => a + b, 0) / moodScores.length) * 10) / 10
    : null;

  // Trend: compare first-half avg vs second-half avg
  const mid = Math.floor(moodScores.length / 2);
  const firstHalf = moodScores.slice(0, mid);
  const secondHalf = moodScores.slice(mid);
  const firstAvg = firstHalf.length ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : null;
  const secondAvg = secondHalf.length ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : null;
  const moodTrend: "improving" | "declining" | "stable" | null =
    firstAvg !== null && secondAvg !== null
      ? firstAvg - secondAvg > 0.5 ? "improving"
        : secondAvg - firstAvg > 0.5 ? "declining"
        : "stable"
      : null;

  // ── Insights narrative ─────────────────────────────────────────────────────
  const insights: string[] = [];

  if (topCategories[0]?.count >= 3) {
    insights.push(
      `You've gravitated toward ${topCategories[0].label} readings ${topCategories[0].count} times this month — this area is calling for your attention.`
    );
  }
  if (topMoodTags[0]?.count >= 2) {
    insights.push(
      `"${topMoodTags[0].value}" is your most logged mood lately. Your journal is tracking something real.`
    );
  }
  if (moodTrend === "improving") {
    insights.push("Your mood has been trending upward over the past 30 days. Something is shifting.");
  } else if (moodTrend === "declining") {
    insights.push("Your mood has been lower recently. Your journal and readings are your mirror — keep showing up.");
  }
  if (topWords[0]?.count >= 3) {
    insights.push(
      `The word "${topWords[0].value}" appears frequently in your entries. It may be worth sitting with what it means for you right now.`
    );
  }

  return NextResponse.json({
    readingCount: readings?.length ?? 0,
    journalCount: entries?.length ?? 0,
    topCategories,
    topTones,
    topMoodTags,
    topWords,
    avgMood,
    moodTrend,
    insights,
    periodDays: 30,
  });
}
