import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification/engine";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const { data, error } = await supabase
    .from("mood_logs")
    .upsert(
      {
        user_id: user.id,
        mood_score: body.mood_score ?? null,
        confidence_score: body.confidence_score ?? null,
        social_energy_score: body.social_energy_score ?? null,
        romantic_energy_score: body.romantic_energy_score ?? null,
        stress_score: body.stress_score ?? null,
        self_worth_score: body.self_worth_score ?? null,
        notes: body.notes ?? null,
        log_date: new Date().toISOString().split("T")[0],
      },
      { onConflict: "user_id,log_date" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const gamification = await awardXP(user.id, "mood", supabase).catch(() => null);
  return NextResponse.json({ log: data, gamification });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "30");

  const { data, error } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ logs: data });
}
