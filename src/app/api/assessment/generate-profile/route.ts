import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai/client";
import {
  buildProfileGenerationSystemPrompt,
  buildProfileGenerationUserPrompt,
} from "@/lib/assessment/prompts";
import type { TraitKey } from "@/lib/assessment/scoring";
import type { Database } from "@/types/database.types";

type ProfileSummaryInsert = Database["public"]["Tables"]["user_profile_summary"]["Insert"];
type MemoryInsert = Database["public"]["Tables"]["ai_personalization_memory"]["Insert"];

interface ProfileOutput {
  archetype_label: string;
  archetype_subtitle: string;
  profile_summary: string;
  relational_summary: string;
  emotional_summary: string;
  ritual_summary: string;
  system_prompt_fragment: string;
  tone_rules: { preferred_tone: string; avoid: string[] };
  content_preferences: { high_resonance_topics: string[]; low_resonance_topics: string[] };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { session_id, version_id } = await req.json();
  if (!session_id || !version_id) {
    return NextResponse.json({ error: "session_id and version_id required" }, { status: 400 });
  }

  // Fetch trait scores for this user + version
  const { data: traits, error: traitError } = await supabase
    .from("user_profile_traits")
    .select("trait_key, normalized_score")
    .eq("user_id", user.id)
    .eq("version_id", version_id);

  if (traitError || !traits?.length) {
    return NextResponse.json(
      { error: traitError?.message ?? "No trait scores found — run scoring first" },
      { status: 400 }
    );
  }

  const traitMap = Object.fromEntries(
    traits.map((t) => [t.trait_key, Number(t.normalized_score)])
  ) as Partial<Record<TraitKey, number>>;

  // Call OpenAI for interpretation
  const openai = getOpenAIClient();
  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.7,
      messages: [
        { role: "system", content: buildProfileGenerationSystemPrompt() },
        { role: "user", content: buildProfileGenerationUserPrompt(traitMap) },
      ],
    });
  } catch {
    return NextResponse.json({ error: "AI service unavailable. Please try again." }, { status: 503 });
  }

  const rawContent = completion.choices[0]?.message?.content ?? "{}";
  let profile: ProfileOutput;
  try {
    profile = JSON.parse(rawContent) as ProfileOutput;
  } catch {
    return NextResponse.json({ error: "Failed to parse OpenAI response" }, { status: 500 });
  }

  // Upsert user_profile_summary — delete+insert pattern to avoid type conflict with onConflict
  await supabase
    .from("user_profile_summary")
    .delete()
    .eq("user_id", user.id)
    .eq("version_id", version_id);

  const summaryRow: ProfileSummaryInsert = {
    user_id: user.id,
    version_id,
    archetype_label: profile.archetype_label,
    archetype_subtitle: profile.archetype_subtitle,
    profile_summary: profile.profile_summary,
    relational_summary: profile.relational_summary,
    emotional_summary: profile.emotional_summary,
    ritual_summary: profile.ritual_summary,
    ai_interpretation: profile as unknown as import("@/types/database.types").Json,
    prompt_profile: {
      system_prompt_fragment: profile.system_prompt_fragment,
      tone_rules: profile.tone_rules as unknown as Record<string, unknown>,
      content_preferences: profile.content_preferences as unknown as Record<string, unknown>,
    } as unknown as import("@/types/database.types").Json,
  };

  const { error: summaryError } = await supabase.from("user_profile_summary").insert(summaryRow);

  if (summaryError) {
    return NextResponse.json({ error: summaryError.message }, { status: 500 });
  }

  // Upsert ai_personalization_memory — delete+insert to avoid onConflict type issues
  await supabase.from("ai_personalization_memory").delete().eq("user_id", user.id);

  const memoryRow: MemoryInsert = {
    user_id: user.id,
    profile_snapshot: traitMap as unknown as import("@/types/database.types").Json,
    system_prompt_fragment: profile.system_prompt_fragment,
    tone_rules: profile.tone_rules as unknown as import("@/types/database.types").Json,
    content_preferences:
      profile.content_preferences as unknown as import("@/types/database.types").Json,
  };

  const { error: memoryError } = await supabase.from("ai_personalization_memory").insert(memoryRow);

  if (memoryError) {
    return NextResponse.json({ error: memoryError.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}
