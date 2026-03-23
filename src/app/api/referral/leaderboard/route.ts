import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/referral/leaderboard — top 10 inviters */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await (supabase as any)
    .from("users")
    .select("display_name, avatar_url, referral_code, referral_count")
    .gt("referral_count", 0)
    .eq("profile_public", true)
    .order("referral_count", { ascending: false })
    .limit(10);

  return NextResponse.json({ leaderboard: data ?? [] });
}
