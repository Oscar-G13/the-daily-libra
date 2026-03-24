import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/cosmic-events?active=true|false&upcoming=true
// Returns active and/or upcoming cosmic events

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") === "true";
  const includeUpcoming = searchParams.get("upcoming") !== "false";

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysOut = new Date();
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);
  const thirtyDaysOutStr = thirtyDaysOut.toISOString().split("T")[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("cosmic_events")
    .select("*")
    .order("start_date", { ascending: true });

  if (activeOnly) {
    query = query.lte("start_date", today).gte("end_date", today);
  } else if (includeUpcoming) {
    // Active + upcoming within 30 days
    query = query.lte("start_date", thirtyDaysOutStr).gte("end_date", today);
  }

  const { data: events, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get user's participation records
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: participations } = await (supabase as any)
    .from("user_event_participation")
    .select("event_id, completed_at, badge_awarded")
    .eq("user_id", user.id);

  const participationMap = new Map(
    (participations ?? []).map((p: { event_id: string }) => [p.event_id, p])
  );

  const enriched = (events ?? []).map(
    (e: { id: string; start_date: string; end_date: string }) => ({
      ...e,
      is_active: e.start_date <= today && e.end_date >= today,
      days_until: e.start_date > today
        ? Math.ceil((new Date(e.start_date).getTime() - Date.now()) / 86400000)
        : 0,
      participation: participationMap.get(e.id) ?? null,
    })
  );

  return NextResponse.json({ events: enriched });
}
