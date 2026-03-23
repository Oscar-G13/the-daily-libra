import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astrology/transits";
import { ARCHETYPE_LABELS, MODIFIER_LABELS } from "@/types";
import type { LibraArchetype, ArchetypeModifier } from "@/types";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── Pull every piece of data we have on this person ──────────────────────
  const [
    { data: userData },
    { data: birthProfile },
    { data: libraProfile },
    { data: traits },
    { data: profileSummary },
    { data: recentMoods },
    { data: recentJournal },
    { data: aiMemory },
    { data: pastQuiz },
    { data: compatibilityReports },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("display_name, pronouns, relationship_status, goals, tone_preference")
      .eq("id", user.id)
      .single(),

    supabase
      .from("birth_profiles")
      .select("natal_chart_json, birth_date")
      .eq("user_id", user.id)
      .single(),

    supabase
      .from("libra_profiles")
      .select(
        "primary_archetype, secondary_modifier, aesthetic_style, relationship_style, conflict_style, decision_style, beauty_affinity, emotional_pattern_summary, ai_memory_summary, quiz_scores"
      )
      .eq("user_id", user.id)
      .single(),

    // 25 psychological trait scores from the deep assessment
    supabase
      .from("user_profile_traits")
      .select("trait_key, normalized_score, percentile_band")
      .eq("user_id", user.id),

    // Full AI-generated profile summary
    supabase
      .from("user_profile_summary")
      .select("profile_summary, relational_summary, emotional_summary, ai_interpretation")
      .eq("user_id", user.id)
      .single(),

    // Last 14 days of mood data
    supabase
      .from("mood_logs")
      .select("mood_score, confidence_score, social_energy_score, romantic_energy_score, stress_score, self_worth_score, notes, log_date")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(14),

    // Recent journal entries — just titles + mood tags, not full bodies
    supabase
      .from("journal_entries")
      .select("title, mood_tag, mood_score, entry_date")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false })
      .limit(10),

    // Accumulated memory entries (patterns, preferences, events)
    supabase
      .from("ai_memory")
      .select("memory_type, content")
      .eq("user_id", user.id)
      .not("memory_type", "like", "cosmic_%")
      .order("created_at", { ascending: false })
      .limit(15),

    // Most recent past quiz — so we don't repeat questions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("quiz_sessions")
      .select("questions_json, insights_json, completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1),

    // Who they've been analyzing in compatibility lab
    supabase
      .from("compatibility_reports")
      .select("partner_name, relationship_type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const chart = birthProfile?.natal_chart_json as Record<string, { sign: string }> | null;
  const transits = getCurrentTransits();
  const transitText = formatTransitsForPrompt(transits);

  // ── Identify psychological outliers (HIGH and LOW extremes) ──────────────
  const highTraits = (traits ?? [])
    .filter((t) => t.percentile_band === "high")
    .map((t) => t.trait_key);
  const lowTraits = (traits ?? [])
    .filter((t) => t.percentile_band === "low")
    .map((t) => t.trait_key);

  // ── Mood trend summary ───────────────────────────────────────────────────
  const moodAvg =
    recentMoods && recentMoods.length > 0
      ? Math.round(
          recentMoods.reduce((sum, m) => sum + (m.mood_score ?? 5), 0) / recentMoods.length
        )
      : null;
  const stressAvg =
    recentMoods && recentMoods.length > 0
      ? Math.round(
          recentMoods.reduce((sum, m) => sum + (m.stress_score ?? 5), 0) / recentMoods.length
        )
      : null;
  const moodTags = (recentJournal ?? [])
    .map((j) => j.mood_tag)
    .filter(Boolean)
    .slice(0, 8);

  const pastQuestionsRaw = pastQuiz?.[0]?.questions_json as
    | { question: string }[]
    | null;
  const pastQuestions = (pastQuestionsRaw ?? []).map((q) => q.question);

  // ── Build the full profile context for GPT ───────────────────────────────
  const archetype = libraProfile?.primary_archetype as LibraArchetype | null;
  const modifier = libraProfile?.secondary_modifier as ArchetypeModifier | null;
  const archetypeLabel = archetype ? ARCHETYPE_LABELS[archetype] : "Unknown";
  const modifierLabel = modifier ? MODIFIER_LABELS[modifier] : null;

  const profileContext = `
IDENTITY
- Name: ${userData?.display_name ?? "Libra"}
- Archetype: ${archetypeLabel}${modifierLabel ? ` (${modifierLabel})` : ""}
- Aesthetic style: ${libraProfile?.aesthetic_style ?? "unknown"}
- Relationship status: ${userData?.relationship_status ?? "unspecified"}
- Goals: ${(userData?.goals ?? []).join(", ") || "not specified"}
- Tone preference: ${userData?.tone_preference ?? "gentle"}

NATAL CHART
- Sun: ${chart?.sun?.sign ?? "Libra"} | Moon: ${chart?.moon?.sign ?? "unknown"} | Rising: ${chart?.ascendant?.sign ?? "unknown"}
- Venus: ${chart?.venus?.sign ?? "unknown"} | Mars: ${chart?.mars?.sign ?? "unknown"} | Mercury: ${chart?.mercury?.sign ?? "unknown"}

CURRENT TRANSITS
${transitText}

PSYCHOLOGICAL PROFILE (25-trait assessment)
- Relationship style: ${libraProfile?.relationship_style ?? "unknown"}
- Conflict style: ${libraProfile?.conflict_style ?? "unknown"}
- Decision style: ${libraProfile?.decision_style ?? "unknown"}
- HIGH-scoring traits (top percentile): ${highTraits.length > 0 ? highTraits.join(", ") : "none recorded"}
- LOW-scoring traits (bottom percentile): ${lowTraits.length > 0 ? lowTraits.join(", ") : "none recorded"}
${profileSummary?.emotional_summary ? `- Emotional summary: ${profileSummary.emotional_summary}` : ""}
${profileSummary?.relational_summary ? `- Relational summary: ${profileSummary.relational_summary}` : ""}
${libraProfile?.emotional_pattern_summary ? `- Pattern summary: ${libraProfile.emotional_pattern_summary}` : ""}

ACCUMULATED MEMORY
${libraProfile?.ai_memory_summary ? `Memory summary: ${libraProfile.ai_memory_summary}` : "No summary yet."}
${(aiMemory ?? []).length > 0 ? `Recent entries:\n${aiMemory!.map((m) => `- [${m.memory_type}] ${m.content}`).join("\n")}` : ""}

RECENT EMOTIONAL DATA (last 14 days)
${moodAvg !== null ? `- Average mood: ${moodAvg}/10` : ""}
${stressAvg !== null ? `- Average stress: ${stressAvg}/10` : ""}
${moodTags.length > 0 ? `- Journal mood tags: ${moodTags.join(", ")}` : ""}

RECENT COMPATIBILITY ACTIVITY
${(compatibilityReports ?? []).length > 0 ? (compatibilityReports ?? []).map((r) => `- ${r.partner_name} (${r.relationship_type})`).join("\n") : "No recent compatibility checks."}

${pastQuestions.length > 0 ? `QUESTIONS ASKED IN PREVIOUS SESSION (do NOT repeat these):\n${pastQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : ""}
`.trim();

  // ── GPT-4o question generation ───────────────────────────────────────────
  const systemPrompt = `You are a deeply perceptive psychologist who specializes in Libra psychology and uses astrology as a lens for self-understanding. You have been given a complete psychological file on this person.

Your task: Generate exactly 5 open-ended questions for a personal insight session.

These questions must feel like they were written by someone who has read every detail of their file. They should be:
- Uncomfortably accurate — targeting specific contradictions and blind spots visible in their data
- Open-ended — requiring genuine reflection, not yes/no
- Specific to THIS person — not generic astrology questions
- Psychologically grounded — rooted in their trait scores, archetype, and patterns
- Written in second person ("you"), conversational but pointed
- Focused on behavior patterns, unexamined assumptions, and unspoken tensions

Target different psychological areas across the 5 questions. Draw from what the data reveals:
- Their trait outliers (HIGH/LOW extremes) reveal pressure points
- The gap between their conflict_style and relationship_style often reveals self-deception
- Their archetype + Moon sign combination often reveals emotional contradictions
- Recent mood data reveals what's live right now
- Journal mood tags reveal recurring emotional themes
- Compatibility activity reveals relationship patterns

Return ONLY valid JSON — no markdown, no explanation, no code blocks. Exactly this structure:
[
  {
    "id": "q1",
    "question": "The full question text",
    "area": "one of: attachment | self-worth | conflict | identity | desire | boundaries | self-deception | grief | ambition | intimacy",
    "why": "1 sentence explaining what specific data point this question targets — this is for internal use only, never shown to the user"
  }
]`;

  const openai = getOpenAIClient();

  let questions: { id: string; question: string; area: string; why: string }[] = [];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the complete profile:\n\n${profileContext}\n\nGenerate 5 personalized insight questions.` },
      ],
      max_tokens: 1200,
      temperature: 0.9,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    // GPT might return {"questions": [...]} or just [...]
    const parsed = JSON.parse(raw);
    questions = Array.isArray(parsed) ? parsed : (parsed.questions ?? []);
  } catch (err) {
    console.error("Question generation failed:", err);
    return NextResponse.json({ error: "Failed to generate questions." }, { status: 500 });
  }

  if (!questions.length) {
    return NextResponse.json({ error: "No questions generated." }, { status: 500 });
  }

  // ── Save session to DB ───────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: session, error: sessionError } = await (supabase as any)
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      questions_json: questions,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
  }

  return NextResponse.json({ sessionId: session.id, questions });
}
