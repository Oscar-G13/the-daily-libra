import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/guidance — all active Guide connections + their published readings */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find all active connections where this user is the client
  const { data: connections } = await (supabase as any)
    .from("guide_client_connections")
    .select("id, guide_id, client_name, accepted_at")
    .eq("client_user_id", user.id)
    .eq("status", "active");

  if (!connections?.length) {
    return NextResponse.json({ guides: [] });
  }

  const connectionIds = connections.map((c: any) => c.id);
  const guideIds = connections.map((c: any) => c.guide_id);

  // Fetch guide user profiles
  const { data: guideUsers } = await (supabase as any)
    .from("users")
    .select("id, display_name, avatar_url")
    .in("id", guideIds);

  const { data: guideProfiles } = await (supabase as any)
    .from("guide_profiles")
    .select("id, business_name, tagline, specialties")
    .in("id", guideIds);

  // Fetch all published readings for these connections
  const { data: readings } = await (supabase as any)
    .from("guide_readings")
    .select("id, client_connection_id, title, reading_type, client_viewed_at, published_at, created_at")
    .in("client_connection_id", connectionIds)
    .eq("is_published", true)
    .eq("is_archived", false)
    .order("published_at", { ascending: false });

  const guideUserMap: Record<string, any> = {};
  (guideUsers ?? []).forEach((g: any) => { guideUserMap[g.id] = g; });

  const guideProfileMap: Record<string, any> = {};
  (guideProfiles ?? []).forEach((g: any) => { guideProfileMap[g.id] = g; });

  const readingsByConnection: Record<string, any[]> = {};
  (readings ?? []).forEach((r: any) => {
    if (!readingsByConnection[r.client_connection_id]) {
      readingsByConnection[r.client_connection_id] = [];
    }
    readingsByConnection[r.client_connection_id].push(r);
  });

  const guides = connections.map((c: any) => ({
    connection_id: c.id,
    guide: {
      ...guideUserMap[c.guide_id],
      ...guideProfileMap[c.guide_id],
    },
    accepted_at: c.accepted_at,
    readings: readingsByConnection[c.id] ?? [],
    unread_count: (readingsByConnection[c.id] ?? []).filter((r: any) => !r.client_viewed_at).length,
  }));

  return NextResponse.json({ guides });
}
