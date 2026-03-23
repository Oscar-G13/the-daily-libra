import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astrology/transits";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: libraProfile }, { data: latestMood }] = await Promise.all([
    supabase
      .from("libra_profiles")
      .select("primary_archetype, ai_memory_summary")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("mood_logs")
      .select("mood_score")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const transits = getCurrentTransits();
  const transitText = formatTransitsForPrompt(transits);

  const systemPrompt = `You are The Daily Libra's journaling guide. Generate exactly 3 short, evocative journal prompts for a Libra.

Archetype: ${libraProfile?.primary_archetype ?? "The Diplomat"}
${latestMood ? `Recent mood: ${latestMood.mood_score}/10` : ""}
${transitText}
${libraProfile?.ai_memory_summary ? `Personal context: ${libraProfile.ai_memory_summary}` : ""}

Rules:
- Each prompt must be 1 sentence, max 20 words
- Make them specific to today's transits and Libra's nature
- Vary the themes: one emotional, one relational, one forward-looking
- Do NOT number them. Separate with "|||"
- No preamble, no explanation — just the 3 prompts separated by |||

Example format:
What conversation have you been avoiding, and what truth lives inside your hesitation?|||If Venus could speak directly to your heart today, what would she say you deserve?|||Three months from now, what decision made today will you be most grateful for?`;

  const openai = getOpenAIClient();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: systemPrompt }],
      max_tokens: 200,
      temperature: 0.9,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const prompts = raw
      .split("|||")
      .map((p) => p.trim())
      .filter((p) => p.length > 10)
      .slice(0, 3);

    return NextResponse.json({ prompts });
  } catch {
    // Fallback prompts if AI fails
    return NextResponse.json({
      prompts: [
        "What feeling have you been naming as something else — and what does it actually want?",
        "Who in your life right now deserves more of your true self, not your performance?",
        "What would you do today if you trusted that balance would find you afterward?",
      ],
    });
  }
}
