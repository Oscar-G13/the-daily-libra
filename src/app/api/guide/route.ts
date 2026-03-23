import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isHighPriestess } from "@/lib/premium";

/** GET /api/guide — Guide dashboard summary */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier, display_name, avatar_url, referral_code")
    .eq("id", user.id)
    .single();

  if (!isHighPriestess(userData?.subscription_tier)) {
    return NextResponse.json({ error: "High Priestess tier required." }, { status: 403 });
  }

  const [{ data: guideProfile }, { data: connections }, { data: recentReadings }] =
    await Promise.all([
      supabase.from("guide_profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("guide_client_connections")
        .select("id, client_name, client_email, status, created_at, accepted_at")
        .eq("guide_id", user.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
      supabase
        .from("guide_readings")
        .select(
          "id, title, reading_type, is_published, created_at, published_at, client_connection_id"
        )
        .eq("guide_id", user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  return NextResponse.json({
    guide: guideProfile,
    guide_user: {
      display_name: userData?.display_name ?? null,
      avatar_url: userData?.avatar_url ?? null,
      referral_code: userData?.referral_code ?? null,
    },
    clients: connections ?? [],
    recent_readings: recentReadings ?? [],
  });
}
