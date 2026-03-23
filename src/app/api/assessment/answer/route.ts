import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface AnswerBody {
  session_id: string;
  question_id: string;
  selected_option_id?: string;
  numeric_response?: number;
  rank_response?: string[];
  total_questions: number;
  answered_count: number;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: AnswerBody = await req.json();
  const {
    session_id,
    question_id,
    selected_option_id,
    numeric_response,
    rank_response,
    total_questions,
    answered_count,
  } = body;

  if (!session_id || !question_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify session belongs to user
  const { data: session } = await supabase
    .from("user_assessment_sessions")
    .select("id, status")
    .eq("id", session_id)
    .eq("user_id", user.id)
    .single();

  if (!session || session.status !== "in_progress") {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  // Upsert answer (unique on session_id + question_id)
  const { error: answerError } = await supabase.from("user_assessment_answers").upsert(
    {
      session_id,
      user_id: user.id,
      question_id,
      selected_option_id: selected_option_id ?? null,
      numeric_response: numeric_response ?? null,
      rank_response: rank_response ?? null,
      answered_at: new Date().toISOString(),
    },
    { onConflict: "session_id,question_id" }
  );

  if (answerError) {
    return NextResponse.json({ error: answerError.message }, { status: 500 });
  }

  const progress_percent = total_questions > 0 ? (answered_count / total_questions) * 100 : 0;
  const completed = answered_count >= total_questions;

  // Update session progress
  const sessionUpdate: Record<string, unknown> = {
    current_question_id: question_id,
    progress_percent,
    last_saved_at: new Date().toISOString(),
  };

  if (completed) {
    sessionUpdate.status = "completed";
    sessionUpdate.completed_at = new Date().toISOString();
  }

  await supabase.from("user_assessment_sessions").update(sessionUpdate).eq("id", session_id);

  return NextResponse.json({ progress_percent, completed });
}
