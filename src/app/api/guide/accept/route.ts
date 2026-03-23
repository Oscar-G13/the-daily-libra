import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/guide/accept — accept a guide invitation by token */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token required." }, { status: 400 });

  // Find the connection
  const { data: connection } = await (supabase as any)
    .from("guide_client_connections")
    .select("id, status, guide_id, client_user_id, client_email")
    .eq("invite_token", token)
    .single();

  if (!connection) {
    return NextResponse.json({ error: "Invalid or expired invitation." }, { status: 404 });
  }

  if (connection.status === "archived") {
    return NextResponse.json({ error: "This invitation has been withdrawn." }, { status: 410 });
  }

  if (connection.status === "active") {
    // Already accepted — idempotent success
    return NextResponse.json({ ok: true, already_accepted: true });
  }

  // Link client_user_id and activate
  await (supabase as any)
    .from("guide_client_connections")
    .update({
      client_user_id: user.id,
      status: "active",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", connection.id);

  // Clean up any pending guide_token in localStorage (client handles this)
  return NextResponse.json({ ok: true });
}
