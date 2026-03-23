import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ACTIVE_VERSION_ID = "a1000000-0000-0000-0000-000000000001";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch existing in_progress session
  const { data: session } = await supabase
    .from("user_assessment_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch full question bank: sections → questions → options
  const { data: sections, error: sectionsError } = await supabase
    .from("assessment_sections")
    .select(
      `
      id, key, title, subtitle, description, sort_order, section_theme,
      assessment_questions (
        id, key, prompt, help_text, question_type, is_required, sort_order, visual_style, metadata,
        assessment_options (
          id, value_key, label, numeric_value, sort_order, metadata
        )
      )
    `
    )
    .eq("version_id", ACTIVE_VERSION_ID)
    .order("sort_order", { ascending: true });

  if (sectionsError) {
    return NextResponse.json({ error: sectionsError.message }, { status: 500 });
  }

  // Sort questions and options within each section
  const sortedSections = (sections ?? []).map((s) => ({
    ...s,
    assessment_questions: (s.assessment_questions ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((q) => ({
        ...q,
        assessment_options: (q.assessment_options ?? []).sort(
          (a, b) => a.sort_order - b.sort_order
        ),
      })),
  }));

  return NextResponse.json({
    session,
    sections: sortedSections,
    version_id: ACTIVE_VERSION_ID,
  });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check for existing in_progress session
  const { data: existing } = await supabase
    .from("user_assessment_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ session: existing });
  }

  const { data: session, error } = await supabase
    .from("user_assessment_sessions")
    .insert({
      user_id: user.id,
      version_id: ACTIVE_VERSION_ID,
      status: "in_progress",
      progress_percent: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session });
}
