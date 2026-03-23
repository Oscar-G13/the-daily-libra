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

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const question: string = body.question ?? "";

  if (!question.trim() || question.length < 10) {
    return NextResponse.json(
      { error: "Please describe your decision in more detail." },
      { status: 400 }
    );
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
      .select("primary_archetype, ai_memory_summary")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!hasFullAccess(userData?.subscription_tier)) {
    return NextResponse.json(
      { error: "Decision Decoder is part of Premium. Upgrade to continue." },
      { status: 403 }
    );
  }

  const chart = birthProfile?.natal_chart_json as Record<string, { sign: string }> | null;
  const transits = getCurrentTransits();
  const transitText = formatTransitsForPrompt(transits);

  const systemPrompt = `You are The Daily Libra's Decision Oracle — a wise, compassionate guide who helps Libras navigate their greatest challenge: making decisions with clarity and confidence.

User: ${userData?.display_name ?? "Libra"}
Archetype: ${libraProfile?.primary_archetype ?? "The Diplomat"}
Sun: ${chart?.sun?.sign ?? "Libra"}, Moon: ${chart?.moon?.sign ?? "unknown"}, Rising: ${chart?.ascendant?.sign ?? "unknown"}
Venus: ${chart?.venus?.sign ?? "unknown"}, Mars: ${chart?.mars?.sign ?? "unknown"}

${transitText}

${libraProfile?.ai_memory_summary ? `Personal context: ${libraProfile.ai_memory_summary}` : ""}

Structure your response with these exact sections:

**⚖ The Core Tension**
(2-3 sentences identifying what's really at stake beneath the surface decision)

**🌹 Side A — The Case For**
(3 astrologically-framed reasons to proceed, drawing from their chart and current transits)

**🪞 Side B — The Case Against**
(3 astrologically-framed reasons to pause or choose differently)

**🌙 Timing Wisdom**
(Based on current planetary positions — is now ideal? What upcoming transit changes the picture?)

**✦ The Oracle's Guidance**
(A clear, direct recommendation. Libras need someone to just say it. Be compassionate but decisive.)

Write with warmth and authority. Reference actual planetary positions. Be specific, not vague. Maximum 450 words.`;

  const userPrompt = `My decision: ${question}`;

  const openai = getOpenAIClient();

  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 700,
      temperature: 0.8,
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

        // Auto-save to journal
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          title: `Decision: ${question.slice(0, 80)}`,
          body: `**My Decision:**\n${question}\n\n**Oracle Guidance:**\n${fullText}`,
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
