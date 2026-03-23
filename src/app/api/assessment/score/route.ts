import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  computeTraitScores,
  normalizeTraitScores,
  type RawAnswer,
  type TraitMapEntry,
  type OptionLookup,
} from "@/lib/assessment/scoring";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { session_id } = await req.json();
  if (!session_id) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  // Verify session
  const { data: session } = await supabase
    .from("user_assessment_sessions")
    .select("id, version_id, status")
    .eq("id", session_id)
    .eq("user_id", user.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Fetch all answers for this session
  const { data: answers, error: answersError } = await supabase
    .from("user_assessment_answers")
    .select("question_id, selected_option_id, numeric_response, rank_response")
    .eq("session_id", session_id);

  if (answersError) {
    return NextResponse.json({ error: answersError.message }, { status: 500 });
  }

  // Fetch trait maps for this version
  const { data: traitMaps, error: tmError } = await supabase
    .from("assessment_trait_map")
    .select("question_id, option_value_key, trait_key, weight, reverse_scored");

  if (tmError) {
    return NextResponse.json({ error: tmError.message }, { status: 500 });
  }

  // Fetch all options for value lookup
  const { data: options, error: optError } = await supabase
    .from("assessment_options")
    .select("id, value_key, numeric_value, question_id");

  if (optError) {
    return NextResponse.json({ error: optError.message }, { status: 500 });
  }

  // Fetch question types
  const { data: questions, error: qError } = await supabase
    .from("assessment_questions")
    .select("id, question_type")
    .eq("version_id", session.version_id);

  if (qError) {
    return NextResponse.json({ error: qError.message }, { status: 500 });
  }

  const questionTypeMap = new Map(questions?.map((q) => [q.id, q.question_type]) ?? []);

  const rawAnswers: RawAnswer[] = (answers ?? []).map((a) => ({
    question_id: a.question_id,
    question_type: (questionTypeMap.get(a.question_id) ?? "likert") as RawAnswer["question_type"],
    selected_option_id: a.selected_option_id,
    numeric_response: a.numeric_response,
    rank_response: a.rank_response as string[] | null,
  }));

  const traitMapEntries: TraitMapEntry[] = (traitMaps ?? []).map((tm) => ({
    question_id: tm.question_id,
    option_value_key: tm.option_value_key,
    trait_key: tm.trait_key,
    weight: Number(tm.weight),
    reverse_scored: tm.reverse_scored,
  }));

  const optionLookups: OptionLookup[] = (options ?? []).map((o) => ({
    id: o.id,
    value_key: o.value_key,
    numeric_value: Number(o.numeric_value),
    question_id: o.question_id,
  }));

  const rawScores = computeTraitScores(rawAnswers, traitMapEntries, optionLookups);
  const traitScores = normalizeTraitScores(rawScores);

  // Upsert user_profile_traits
  const upsertRows = Object.values(traitScores).map((ts) => ({
    user_id: user.id,
    version_id: session.version_id,
    trait_key: ts.trait_key,
    raw_score: ts.raw_score,
    normalized_score: ts.normalized_score,
    percentile_band: ts.percentile_band,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from("user_profile_traits")
    .upsert(upsertRows, { onConflict: "user_id,trait_key,version_id" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ trait_scores: traitScores });
}
