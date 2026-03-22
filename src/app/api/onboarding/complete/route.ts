import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateNatalChart } from "@/lib/astrology/chart";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    birthDate,
    birthTime,
    birthCity,
    birthCountry,
    timezone,
    latitude,
    longitude,
    quizResult,
    quizAnswers,
    pronouns,
    relationshipStatus,
    goals,
    tonePreference,
  } = body;

  try {
    // Calculate natal chart
    const chart = calculateNatalChart({
      birthDate,
      birthTime,
      latitude: latitude ?? 40.7128,
      longitude: longitude ?? -74.006,
      timezone,
    });

    // Save birth profile
    const { error: birthError } = await supabase
      .from("birth_profiles")
      .upsert({
        user_id: user.id,
        birth_date: birthDate,
        birth_time: birthTime || null,
        birth_city: birthCity,
        birth_country: birthCountry,
        timezone,
        latitude,
        longitude,
        natal_chart_json: chart as unknown as Record<string, unknown>,
      });

    if (birthError) throw birthError;

    // Save Libra profile
    const { error: libraError } = await supabase
      .from("libra_profiles")
      .upsert({
        user_id: user.id,
        primary_archetype: quizResult.primaryArchetype,
        secondary_modifier: quizResult.secondaryModifier,
        quiz_scores: quizResult.scores,
      });

    if (libraError) throw libraError;

    // Save onboarding responses
    if (quizAnswers && typeof quizAnswers === "object") {
      const responses = Object.entries(quizAnswers).map(([questionId, answerId]) => ({
        user_id: user.id,
        question_id: questionId,
        answer_value: answerId as string,
      }));

      await supabase.from("onboarding_responses").upsert(responses);
    }

    // Update user profile
    const { error: userError } = await supabase
      .from("users")
      .update({
        pronouns: pronouns || null,
        relationship_status: relationshipStatus || null,
        goals: goals ?? [],
        tone_preference: tonePreference ?? "gentle",
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (userError) throw userError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
