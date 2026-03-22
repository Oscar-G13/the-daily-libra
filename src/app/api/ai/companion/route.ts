import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { buildCompanionSystemPrompt } from "@/lib/openai/prompts/companion";
import type { LibraArchetype, ArchetypeModifier } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const messages: Message[] = body.messages ?? [];

  if (!messages.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  // Check free tier message limit
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .single();

  const isPremium = subscription?.status === "active";

  if (!isPremium) {
    // Simple daily message count check — in production use a more robust counter
    const today = new Date().toISOString().split("T")[0];
    const { data: todaysReadings } = await supabase
      .from("daily_readings")
      .select("id")
      .eq("user_id", user.id)
      .eq("reading_date", today)
      .eq("category", "custom");

    if ((todaysReadings?.length ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Free tier: 5 companion messages per day. Upgrade for unlimited." },
        { status: 403 }
      );
    }
  }

  // Fetch profile
  const [{ data: userData }, { data: birthProfile }, { data: libraProfile }] = await Promise.all([
    supabase.from("users").select("display_name").eq("id", user.id).single(),
    supabase.from("birth_profiles").select("natal_chart_json").eq("user_id", user.id).single(),
    supabase.from("libra_profiles").select("primary_archetype, secondary_modifier, ai_memory_summary").eq("user_id", user.id).single(),
  ]);

  const chart = birthProfile?.natal_chart_json as Record<string, { sign: string }> | null;

  const systemPrompt = buildCompanionSystemPrompt({
    displayName: userData?.display_name ?? "Libra",
    archetype: (libraProfile?.primary_archetype ?? "velvet_diplomat") as LibraArchetype,
    modifier: libraProfile?.secondary_modifier as ArchetypeModifier | undefined,
    moonSign: chart?.moon?.sign,
    venusSign: chart?.venus?.sign,
    aiMemorySummary: libraProfile?.ai_memory_summary ?? undefined,
  });

  const openai = getOpenAIClient();

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.slice(-20), // keep last 20 messages for context window
    ],
    max_tokens: 500,
    temperature: 0.85,
    stream: true,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
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
