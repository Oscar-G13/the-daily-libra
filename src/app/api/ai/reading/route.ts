import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { buildReadingSystemPrompt, buildReadingUserPrompt } from "@/lib/openai/prompts/reading";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astrology/transits";
import { hasFullAccess } from "@/lib/premium";
import type { ReadingCategory, ReadingTone, LibraArchetype, ArchetypeModifier } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const category: ReadingCategory = body.category ?? "daily";
  const toneOverride: ReadingTone | undefined = body.tone;
  const userNote: string | undefined = body.note;

  // Fetch user data
  const [{ data: userData }, { data: birthProfile }, { data: libraProfile }, { data: aiMemory }] =
    await Promise.all([
      supabase
        .from("users")
        .select("display_name, tone_preference, subscription_tier")
        .eq("id", user.id)
        .single(),
      supabase.from("birth_profiles").select("natal_chart_json").eq("user_id", user.id).single(),
      supabase
        .from("libra_profiles")
        .select("primary_archetype, secondary_modifier, ai_memory_summary")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("ai_personalization_memory")
        .select("system_prompt_fragment")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (!userData || !birthProfile || !libraProfile) {
    return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
  }

  // Check free tier limits
  const isPremium = hasFullAccess(userData.subscription_tier);

  if (!isPremium && category !== "daily") {
    // Count today's readings
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("daily_readings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("reading_date", today);

    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        { error: "Free tier limit reached. Upgrade to Premium for unlimited readings." },
        { status: 403 }
      );
    }
  }

  const chart = birthProfile.natal_chart_json as Record<string, { sign: string }> | null;
  const tone: ReadingTone = toneOverride ?? (userData.tone_preference as ReadingTone) ?? "gentle";

  const transits = getCurrentTransits();
  const transitContext = formatTransitsForPrompt(transits);

  const baseSystemPrompt = buildReadingSystemPrompt({
    displayName: userData.display_name ?? "Libra",
    archetype: libraProfile.primary_archetype as LibraArchetype,
    modifier: libraProfile.secondary_modifier as ArchetypeModifier | undefined,
    sunSign: chart?.sun?.sign ?? "Libra",
    moonSign: chart?.moon?.sign,
    risingSign: chart?.ascendant?.sign,
    venusSign: chart?.venus?.sign,
    marsSign: chart?.mars?.sign,
    category,
    tone,
    aiMemorySummary: libraProfile.ai_memory_summary ?? undefined,
    psychographicProfile: aiMemory?.system_prompt_fragment ?? undefined,
    currentDate: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });

  const systemPrompt = `${baseSystemPrompt}\n\nLIVE PLANETARY DATA (use this to ground the reading in actual sky conditions):\n${transitContext}`;

  const userPrompt = buildReadingUserPrompt(category, userNote);

  const openai = getOpenAIClient();

  // Stream the response
  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.85,
      stream: true,
    });
  } catch {
    return NextResponse.json(
      { error: "AI service unavailable. Please try again." },
      { status: 503 }
    );
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

        // Save reading to DB
        await supabase.from("daily_readings").insert({
          user_id: user.id,
          category,
          tone,
          output_text: fullText,
          prompt_context_json: { archetype: libraProfile.primary_archetype, chart: chart },
        });

        // XP awarded client-side via /api/gamification/award after stream completes
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
