import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDailyChallenges } from "@/lib/challenges/definitions";

/** GET /api/challenges — returns today's 3 challenges + user completion status */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];
  const challenges = getDailyChallenges(today, 3);

  // Fetch which ones this user has completed today
  const { data: completions } = await (supabase as any)
    .from("daily_challenge_completions")
    .select("challenge_key")
    .eq("user_id", user.id)
    .eq("challenge_date", today);

  const completedKeys = new Set((completions ?? []).map((c: any) => c.challenge_key));

  return NextResponse.json({
    date: today,
    challenges: challenges.map((c) => ({
      ...c,
      completed: completedKeys.has(`${today}_${c.id}`),
    })),
  });
}

/** POST /api/challenges — mark a challenge complete and award XP */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId } = await req.json();
  if (!challengeId) return NextResponse.json({ error: "Missing challengeId" }, { status: 400 });

  const today = new Date().toISOString().split("T")[0];
  const challenges = getDailyChallenges(today, 3);
  const challenge = challenges.find((c) => c.id === challengeId);

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not available today." }, { status: 404 });
  }

  const key = `${today}_${challengeId}`;

  // Idempotent insert
  const { error } = await (supabase as any)
    .from("daily_challenge_completions")
    .insert({
      user_id: user.id,
      challenge_key: key,
      challenge_date: today,
      xp_awarded: challenge.xp,
    });

  if (error?.code === "23505") {
    // Already completed
    return NextResponse.json({ ok: true, already_completed: true, xp: 0 });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Award XP via gamification table
  await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/gamification/award`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
      body: JSON.stringify({ action: `challenge_${challengeId}`, xp: challenge.xp }),
    }
  ).catch(() => {});

  return NextResponse.json({ ok: true, xp: challenge.xp });
}
