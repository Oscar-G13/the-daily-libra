import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astrology/transits";

// GET — fetch saved cosmic room items + daily affirmation
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const generateAffirmation = searchParams.get("affirmation") === "true";

  const [{ data: savedItems }, { data: libraProfile }, { data: userData }, { data: birthProfile }] =
    await Promise.all([
      supabase
        .from("ai_memory")
        .select("id, memory_type, content, created_at")
        .eq("user_id", user.id)
        .like("memory_type", "cosmic_%")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("libra_profiles")
        .select("primary_archetype, aesthetic_style, ai_memory_summary")
        .eq("user_id", user.id)
        .single(),
      supabase.from("users").select("display_name").eq("id", user.id).single(),
      supabase.from("birth_profiles").select("natal_chart_json").eq("user_id", user.id).single(),
    ]);

  let affirmation: string | null = null;

  if (generateAffirmation) {
    const chart = birthProfile?.natal_chart_json as Record<string, { sign: string }> | null;
    const transits = getCurrentTransits();
    const transitText = formatTransitsForPrompt(transits);

    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are The Daily Libra's cosmic voice. Generate a single, deeply personal affirmation for this Libra.

Name: ${userData?.display_name ?? "Libra"}
Archetype: ${libraProfile?.primary_archetype ?? "The Diplomat"}
Aesthetic: ${libraProfile?.aesthetic_style ?? "unknown"}
Sun: ${chart?.sun?.sign ?? "Libra"}, Moon: ${chart?.moon?.sign ?? "unknown"}, Venus: ${chart?.venus?.sign ?? "unknown"}
${transitText}
${libraProfile?.ai_memory_summary ? `Context: ${libraProfile.ai_memory_summary}` : ""}

Write ONE affirmation: 1-3 sentences. Poetic but grounded. Specific to their chart and current transits. Not generic. Not cheesy. It should feel like it was written for them alone. No preamble, no label — just the affirmation itself.`,
          },
          { role: "user", content: "Give me today's affirmation." },
        ],
        max_tokens: 120,
        temperature: 0.9,
      });
      affirmation = completion.choices[0]?.message?.content?.trim() ?? null;
    } catch {
      affirmation = null;
    }
  }

  return NextResponse.json({
    items: savedItems ?? [],
    profile: {
      archetype: libraProfile?.primary_archetype,
      aestheticStyle: libraProfile?.aesthetic_style,
      displayName: userData?.display_name,
    },
    affirmation,
  });
}

// POST — save an item to the cosmic room
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, content }: { type: "quote" | "reading" | "affirmation" | "insight"; content: string } = body;

  if (!content?.trim() || !type) {
    return NextResponse.json({ error: "Missing content or type." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ai_memory")
    .insert({
      user_id: user.id,
      memory_type: `cosmic_${type}`,
      content,
    })
    .select("id, memory_type, content, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

// DELETE — remove a saved item
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  await supabase
    .from("ai_memory")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .like("memory_type", "cosmic_%");

  return NextResponse.json({ ok: true });
}
