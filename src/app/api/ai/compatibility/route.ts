import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { calculateNatalChart } from "@/lib/astrology/chart";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astrology/transits";
import { hasFullAccess } from "@/lib/premium";

const RELATIONSHIP_LABELS: Record<string, string> = {
  romantic: "romantic partner",
  friendship: "close friend",
  coworker: "coworker",
  ex: "ex",
  crush: "crush",
  family: "family member",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    partnerName,
    partnerBirthDate,
    partnerBirthTime,
    relationshipType = "romantic",
  }: {
    partnerName: string;
    partnerBirthDate: string;
    partnerBirthTime?: string;
    relationshipType: string;
  } = body;

  if (!partnerName?.trim() || !partnerBirthDate) {
    return NextResponse.json(
      { error: "Partner name and birth date are required." },
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
      .select("primary_archetype, secondary_modifier, relationship_style, ai_memory_summary")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!hasFullAccess(userData?.subscription_tier)) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count } = await supabase
      .from("compatibility_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString());

    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        {
          error:
            "Free tier includes 1 compatibility reading every 7 days. Upgrade for unlimited access.",
        },
        { status: 403 }
      );
    }
  }

  // Calculate partner's chart from birth date (Sun + Moon minimum)
  const partnerChart = calculateNatalChart({
    birthDate: partnerBirthDate,
    birthTime: partnerBirthTime,
    latitude: 0,
    longitude: 0,
    timezone: "UTC",
  });

  const userChart = birthProfile?.natal_chart_json as Record<string, { sign: string }> | null;
  const transits = getCurrentTransits();
  const transitText = formatTransitsForPrompt(transits);
  const relationshipLabel = RELATIONSHIP_LABELS[relationshipType] ?? relationshipType;

  const systemPrompt = `You are The Daily Libra's Compatibility Oracle — a perceptive guide who analyzes relationship dynamics through the lens of astrology, Libra psychology, and emotional pattern recognition.

You are performing a compatibility reading for a Libra.

**The Libra (user):**
- Name: ${userData?.display_name ?? "Libra"}
- Archetype: ${libraProfile?.primary_archetype ?? "The Diplomat"}
- Modifier: ${libraProfile?.secondary_modifier ?? "harmony seeking"}
- Sun: ${userChart?.sun?.sign ?? "Libra"}, Moon: ${userChart?.moon?.sign ?? "unknown"}, Rising: ${userChart?.ascendant?.sign ?? "unknown"}
- Venus: ${userChart?.venus?.sign ?? "unknown"}, Mars: ${userChart?.mars?.sign ?? "unknown"}
- Relationship style: ${libraProfile?.relationship_style ?? "seeks deep harmony"}
${libraProfile?.ai_memory_summary ? `- Personal context: ${libraProfile.ai_memory_summary}` : ""}

**The Partner (${partnerName}):**
- Sun: ${partnerChart.sun.sign}, Moon: ${partnerChart.moon.sign}
- Venus: ${partnerChart.venus.sign}, Mars: ${partnerChart.mars.sign}
- Relationship context: ${relationshipLabel}

**Current Transits:**
${transitText}

Structure your compatibility reading with these exact sections:

**✦ The Chemistry**
(2-3 sentences on the immediate magnetic pull or friction between these charts — what draws them together or creates tension)

**💬 Communication Style**
(How these two signs communicate — compatibility score out of 10, and the key dynamic: do they understand each other intuitively or require effort?)

**🌙 Emotional Safety**
(How emotionally safe this Libra feels with this person — score out of 10, and what creates security or anxiety in this pairing)

**⚡ Conflict & Tension Zones**
(2-3 specific areas where friction is likely, framed through their planetary placements)

**🌹 The Ideal Dynamic**
(What this relationship looks like at its best — the version that feeds both people's highest nature)

**⚠ Where the Libra May Lose Themselves**
(Specific ways this Libra archetype tends to overgive, people-please, or self-abandon with this particular energy — be honest and direct)

**⚖ The Honest Verdict**
(A clear, emotionally intelligent summary. What does this connection offer the Libra? What does it cost? What would alignment look like?)

Be specific, not generic. Reference actual signs and planetary placements. Write with warmth and authority. Maximum 550 words total.`;

  const userPrompt = `Please give me a compatibility reading between myself and ${partnerName} as my ${relationshipLabel}.`;

  const openai = getOpenAIClient();

  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 850,
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

        // Save report to compatibility_reports
        await supabase.from("compatibility_reports").insert({
          user_id: user.id,
          partner_name: partnerName,
          partner_birth_data_json: {
            birthDate: partnerBirthDate,
            birthTime: partnerBirthTime ?? null,
            chart: {
              sun: partnerChart.sun.sign,
              moon: partnerChart.moon.sign,
              venus: partnerChart.venus.sign,
              mars: partnerChart.mars.sign,
            },
          },
          relationship_type: relationshipType as
            | "romantic"
            | "friendship"
            | "coworker"
            | "ex"
            | "crush"
            | "family",
          report_json: { text: fullText },
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

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const { data, error } = await supabase
    .from("compatibility_reports")
    .select("id, partner_name, relationship_type, partner_birth_data_json, report_json, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch reports." }, { status: 500 });
  }

  return NextResponse.json({ reports: data });
}
