import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { hasFullAccess } from "@/lib/premium";
import { ARCHETYPE_LABELS, MODIFIER_LABELS } from "@/types";
import type { LibraArchetype, ArchetypeModifier } from "@/types";

interface Answer {
  id: string;
  question: string;
  answer: string;
}

interface Question {
  id: string;
  question: string;
  area: string;
  why: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accessProfile } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (!hasFullAccess(accessProfile?.subscription_tier)) {
    return NextResponse.json(
      { error: "Insight Session is part of Premium. Upgrade to continue." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { sessionId, answers }: { sessionId: string; answers: Answer[] } = body;

  if (!sessionId || !answers?.length) {
    return NextResponse.json({ error: "Missing session or answers." }, { status: 400 });
  }

  // ── Fetch session + user profile ─────────────────────────────────────────
  const [
    { data: session },
    { data: libraProfile },
    { data: userData },
    { data: birthProfile },
    { data: traits },
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("quiz_sessions")
      .select("questions_json")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single(),

    supabase
      .from("libra_profiles")
      .select(
        "primary_archetype, secondary_modifier, relationship_style, conflict_style, decision_style, emotional_pattern_summary, ai_memory_summary"
      )
      .eq("user_id", user.id)
      .single(),

    supabase
      .from("users")
      .select("display_name, relationship_status, goals")
      .eq("id", user.id)
      .single(),

    supabase.from("birth_profiles").select("natal_chart_json").eq("user_id", user.id).single(),

    supabase
      .from("user_profile_traits")
      .select("trait_key, percentile_band, normalized_score")
      .eq("user_id", user.id),
  ]);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const questions = session.questions_json as Question[];
  const chart = birthProfile?.natal_chart_json as Record<string, { sign: string }> | null;
  const archetype = libraProfile?.primary_archetype as LibraArchetype | null;
  const modifier = libraProfile?.secondary_modifier as ArchetypeModifier | null;
  const highTraits = (traits ?? [])
    .filter((t) => t.percentile_band === "high")
    .map((t) => t.trait_key);
  const lowTraits = (traits ?? [])
    .filter((t) => t.percentile_band === "low")
    .map((t) => t.trait_key);

  const qaBlock = answers
    .map((a) => {
      const q = questions.find((q) => q.id === a.id);
      return `QUESTION (area: ${q?.area ?? "unknown"}):\n"${a.question}"\n\nANSWER:\n${a.answer || "[no answer given]"}`;
    })
    .join("\n\n---\n\n");

  const systemPrompt = `You are a psychological analyst who specializes in Libra psychology and uses astrology as a secondary lens. You have been given a person's complete profile AND their answers to 5 personalized insight questions.

Your task: Write a precise, intimate psychological portrait of this person based on what they revealed.

PROFILE CONTEXT:
- Name: ${userData?.display_name ?? "this Libra"}
- Archetype: ${archetype ? ARCHETYPE_LABELS[archetype] : "unknown"}${modifier ? ` (${MODIFIER_LABELS[modifier]})` : ""}
- Sun: ${chart?.sun?.sign ?? "Libra"}, Moon: ${chart?.moon?.sign ?? "unknown"}, Venus: ${chart?.venus?.sign ?? "unknown"}
- Relationship style: ${libraProfile?.relationship_style ?? "unknown"}
- Conflict style: ${libraProfile?.conflict_style ?? "unknown"}
- Decision style: ${libraProfile?.decision_style ?? "unknown"}
- High traits: ${highTraits.join(", ") || "none"}
- Low traits: ${lowTraits.join(", ") || "none"}
${libraProfile?.ai_memory_summary ? `- Prior memory summary: ${libraProfile.ai_memory_summary}` : ""}

THEIR ANSWERS:
${qaBlock}

Write the psychological portrait with these exact sections:

**🔍 What I See**
(The dominant psychological pattern across their answers — name it precisely. What is the central story this person is living? 3-4 sentences.)

**⚡ The Contradiction**
(The most significant gap between who they appear to be and what their answers reveal. Be specific — reference what they actually said. 2-3 sentences.)

**🌑 What's Underneath**
(The unmet need, core wound, or deep fear that seems to be organizing their behavior. Not a diagnosis — a compassionate naming. 2-3 sentences.)

**🪞 The Blind Spot**
(What are they consistently not seeing, minimizing, or explaining away across their answers? What are they almost saying but not quite? 2-3 sentences.)

**✦ One True Thing**
(A single, clear, specific insight about this person — the thing that is most true and most useful for them to hold right now. This should feel like something they already know but haven't let themselves fully believe. 2-4 sentences.)

Rules:
- Reference their actual answers, not just their profile
- Be specific, never vague or generic
- Warm but honest — this is not therapy, it is clarity
- Do NOT pathologize or catastrophize
- Write as if speaking directly to them
- Maximum 480 words total`;

  const openai = getOpenAIClient();

  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze my answers and give me my portrait." },
      ],
      max_tokens: 800,
      temperature: 0.85,
      stream: true,
    });
  } catch {
    return NextResponse.json({ error: "AI service unavailable." }, { status: 503 });
  }

  let fullText = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          fullText += text;
          controller.enqueue(new TextEncoder().encode(text));
        }

        // ── Post-stream: extract insights + update memory ─────────────────
        let insights: { insight: string; area: string }[] = [];

        try {
          const insightCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `Extract 3-5 specific, reusable psychological insights from this analysis. These will be stored in the user's AI memory and used to personalize all future readings.

Each insight should be:
- Specific and actionable (not "you value harmony" — say "you tend to defer decisions in romantic contexts to avoid responsibility for outcomes")
- Written in second person
- 1-2 sentences max

Return ONLY valid JSON, no markdown:
[{"insight": "...", "area": "one of: attachment|self-worth|conflict|identity|desire|boundaries|self-deception|grief|ambition|intimacy"}]`,
              },
              { role: "user", content: `Analysis:\n${fullText}\n\nAnswers:\n${qaBlock}` },
            ],
            max_tokens: 500,
            temperature: 0.7,
            response_format: { type: "json_object" },
          });

          const raw = insightCompletion.choices[0]?.message?.content ?? "[]";
          const parsed = JSON.parse(raw);
          insights = Array.isArray(parsed) ? parsed : (parsed.insights ?? []);
        } catch {
          insights = [];
        }

        // Save insights to ai_memory
        if (insights.length > 0) {
          await supabase.from("ai_memory").insert(
            insights.map((ins) => ({
              user_id: user.id,
              memory_type: `psyche_${ins.area}`,
              content: ins.insight,
            }))
          );
        }

        // Update ai_memory_summary — distill prior summary + new insights
        try {
          const currentSummary = libraProfile?.ai_memory_summary ?? "";
          const newInsightText = insights.map((i) => i.insight).join(" ");

          const summaryCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `Update this person's psychological memory summary. Merge the existing summary with the new insights. Keep it concise (max 200 words), specific, and written in second person. This summary will be injected into every future AI reading to personalize it.`,
              },
              {
                role: "user",
                content: `Existing summary:\n${currentSummary || "None yet."}\n\nNew insights from this session:\n${newInsightText}`,
              },
            ],
            max_tokens: 300,
            temperature: 0.7,
          });

          const newSummary = summaryCompletion.choices[0]?.message?.content?.trim();
          if (newSummary) {
            await supabase
              .from("libra_profiles")
              .update({ ai_memory_summary: newSummary })
              .eq("user_id", user.id);
          }
        } catch {
          // non-fatal
        }

        // Complete the session record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("quiz_sessions")
          .update({
            answers_json: answers,
            analysis_text: fullText,
            insights_json: insights,
            completed_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      } catch {
        controller.enqueue(
          new TextEncoder().encode("\n\n[Something went wrong. Please try again.]")
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
