import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { hasFullAccess } from "@/lib/premium";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { message, senderName, context }: { message: string; senderName: string; context: string } =
    body;

  if (!message?.trim() || message.length < 5) {
    return NextResponse.json({ error: "Paste the actual message." }, { status: 400 });
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
      .select("primary_archetype, relationship_style, ai_memory_summary")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!hasFullAccess(userData?.subscription_tier)) {
    return NextResponse.json(
      { error: "Text Decoder is part of Premium. Upgrade to continue." },
      { status: 403 }
    );
  }

  const chart = birthProfile?.natal_chart_json as Record<string, { sign: string }> | null;

  const systemPrompt = `You are The Daily Libra's Text Oracle — a perceptive emotional intelligence guide who helps Libras decode messages with clarity, not anxiety.

You are reading a text message for:
- Name: ${userData?.display_name ?? "Libra"}
- Archetype: ${libraProfile?.primary_archetype ?? "The Diplomat"}
- Moon: ${chart?.moon?.sign ?? "unknown"} (emotional processing style)
- Venus: ${chart?.venus?.sign ?? "unknown"} (how they give and receive in relationships)
- Relationship style: ${libraProfile?.relationship_style ?? "seeks deep harmony"}
${libraProfile?.ai_memory_summary ? `- Personal context: ${libraProfile.ai_memory_summary}` : ""}

The message is from: ${senderName || "someone"}
Context: ${context || "no additional context provided"}

Read this text with emotional intelligence — not paranoia, not toxic positivity. Be honest about what you observe. Libras tend to over-explain, under-assert, and project warmth onto ambiguous messages. Call that out gently when relevant.

Structure your response with these exact sections:

**📱 The Surface Read**
(What the message says on face value — neutral, factual, 1-2 sentences)

**🔍 The Emotional Undercurrent**
(What tone, energy, or emotional state is underneath the words — what is this person actually communicating?)

**🌀 What It Might Really Mean**
(2 possibilities: the charitable interpretation and the honest one. Be specific, not vague.)

**⚠ What to Watch**
(One thing this Libra specifically might be tempted to project, excuse, or romanticize about this message — based on their archetype and chart)

**✉ Response Energy**
(Not a script — the right *energy* and approach to respond with. Should this be warm and open? Boundaried? Direct? Playful? Give them a clear direction.)

Be conversational but sharp. Maximum 380 words. Do not catastrophize. Do not minimize.`;

  const openai = getOpenAIClient();

  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `The message: "${message}"` },
      ],
      max_tokens: 600,
      temperature: 0.75,
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
        // Auto-save to journal
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          title: `Text from ${senderName || "someone"}: "${message.slice(0, 60)}${message.length > 60 ? "…" : ""}"`,
          body: `**The message:**\n"${message}"\n\n**Oracle reading:**\n${fullText}`,
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
