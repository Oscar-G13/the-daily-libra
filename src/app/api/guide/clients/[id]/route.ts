import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isHighPriestess } from "@/lib/premium";

/** GET /api/guide/clients/[id] — client detail */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: connection } = await (supabase as any)
    .from("guide_client_connections")
    .select("*")
    .eq("id", id)
    .eq("guide_id", user.id)
    .single();

  if (!connection) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Fetch linked user profile if accepted
  let clientProfile = null;
  if (connection.client_user_id) {
    const { data: cp } = await supabase
      .from("users")
      .select("display_name, avatar_url, app_streak, xp_level, last_active_date")
      .eq("id", connection.client_user_id)
      .single();
    clientProfile = cp;
  }

  // Fetch readings for this connection
  const { data: readings } = await (supabase as any)
    .from("guide_readings")
    .select("id, title, reading_type, is_published, is_archived, client_viewed_at, created_at, published_at")
    .eq("client_connection_id", id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    connection,
    client_profile: clientProfile,
    readings: readings ?? [],
  });
}

/** PATCH /api/guide/clients/[id] — update notes or birth data */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = ["client_name", "client_notes", "client_birth_date", "client_birth_time", "client_birth_city"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  await (supabase as any)
    .from("guide_client_connections")
    .update(updates)
    .eq("id", id)
    .eq("guide_id", user.id);

  return NextResponse.json({ ok: true });
}

/** DELETE /api/guide/clients/[id] — archive the connection */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await (supabase as any)
    .from("guide_client_connections")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("guide_id", user.id);

  return NextResponse.json({ ok: true });
}
