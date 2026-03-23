import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astrology/transits";
import { hasFullAccess } from "@/lib/premium";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { situation, personName }: { situation: string; personName?: string } = body;

  if (!situation?.trim() || situation.length < 20) {
    return NextResponse.json({ error: "Describe the situation in more detail." }, { status: 400 });
  }

  const [{ data: userData }, { data: birthProfile }, { data: libraProfile }] = await Promise.all([
    supabase
      .from("users")
      .select("display_name, tone_preference, subscription_tier")
      .eq("id", user.id)
      .single(),
    supabase.from("birth_profiles").select("natal_chart_json").eq("user_id", user.id).single(),
    supabase
      .from("libra_profiles")
      .select(
        "primary_archetype, secondary_modifier, relationship_style, conflict_style, ai_memory_summary"
      )
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!hasFullAccess(userData?.subscription_tier)) {
    return NextResponse.json(
      { error: "Red Flag Decoder is part of Premium. Upgrade to continue." },
      { status: 403 }
    );
  }

  const chart = birthProfile?.natal_chart_json as Record<string, { sign: string }> | null;
  const transits = getCurrentTransits();
  const transitText = formatTransitsForPrompt(transits);

  const systemPrompt = `You are The Daily Libra's Pattern Oracle — a direct, emotionally intelligent guide who helps Libras see dynamics clearly, especially the ones they are trained to excuse, romanticize, or overlook.

You are analyzing a situation for:
- Name: ${userData?.display_name ?? "Libra"}
- Archetype: ${libraProfile?.primary_archetype ?? "The Diplomat"}
- Modifier: ${libraProfile?.secondary_modifier ?? "harmony seeking"}
- Moon: ${chart?.moon?.sign ?? "unknown"} — emotional processing
- Venus: ${chart?.venus?.sign ?? "unknown"} — love and attachment style
- Mars: ${chart?.mars?.sign ?? "unknown"} — conflict and desire
- Relationship style: ${libraProfile?.relationship_style ?? "seeks harmony"}
- Conflict style: ${libraProfile?.conflict_style ?? "avoidant"}
${libraProfile?.ai_memory_summary ? `- Personal context: ${libraProfile.ai_memory_summary}` : ""}

${transitText}

${personName ? `The person in question: ${personName}` : ""}

You are not here to validate fear or manufacture drama. You are here to identify genuine patterns clearly and compassionately. Libras specifically struggle with: rationalizing inconsistency, tolerating low-effort energy, dismissing their own discomfort to preserve peace, and mistaking intensity for depth. Factor this in.

Structure your response with these exact sections:

**🪞 What You're Describing**
(Reflect back what you heard, neutrally — name the dynamic without judgment, 2-3 sentences)

**🔴 The Patterns**
(2-4 specific behavioral or energetic patterns that stand out — be concrete, not general)

**⚠ What You Might Be Minimizing**
(The thing this Libra archetype is most likely rationalizing or explaining away — be direct but kind)

**🌑 The Honest Read**
(Is this a red flag, a yellow flag, or a real concern worth examining? What specific boundary or awareness does this Libra need right now?)

**⚖ What to Do With This**
(A clear, actionable direction — not "trust your gut" vagueness. Specific to their chart and archetype.)

Be honest. Be warm. Do not catastrophize. Do not minimize. Maximum 430 words.`;

  const openai = getOpenAIClient();

  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here's what's happening: ${situation}` },
      ],
      max_tokens: 700,
      temperature: 0.8,
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
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          title: `Red Flag Check${personName ? `: ${personName}` : ""}`,
          body: `**Situation:**\n${situation}\n\n**Pattern Analysis:**\n${fullText}`,
          mood_tag: "clear",
        });
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
