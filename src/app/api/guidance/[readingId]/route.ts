import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/guidance/[readingId] — fetch a single Guide reading */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ readingId: string }> }
) {
  const { readingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: reading } = await (supabase as any)
    .from("guide_readings")
    .select("*, guide_client_connections(client_user_id, guide_id)")
    .eq("id", readingId)
    .eq("is_published", true)
    .single();

  if (!reading) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Verify this user is the client
  if (reading.guide_client_connections?.client_user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Mark as viewed if not yet
  if (!reading.client_viewed_at) {
    await (supabase as any)
      .from("guide_readings")
      .update({ client_viewed_at: new Date().toISOString() })
      .eq("id", readingId);
  }

  // Fetch guide info
  const { data: guideUser } = await (supabase as any)
    .from("users")
    .select("display_name, avatar_url")
    .eq("id", reading.guide_client_connections.guide_id)
    .single();

  const { data: guideProfile } = await (supabase as any)
    .from("guide_profiles")
    .select("business_name, tagline")
    .eq("id", reading.guide_client_connections.guide_id)
    .single();

  return NextResponse.json({
    reading: {
      id: reading.id,
      title: reading.title,
      reading_type: reading.reading_type,
      content: reading.content,
      published_at: reading.published_at,
    },
    guide: {
      display_name: (guideUser as any)?.display_name ?? null,
      avatar_url: (guideUser as any)?.avatar_url ?? null,
      business_name: (guideProfile as any)?.business_name ?? null,
      tagline: (guideProfile as any)?.tagline ?? null,
    },
  });
}
