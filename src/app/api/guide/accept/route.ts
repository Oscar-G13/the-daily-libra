import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** POST /api/guide/accept — accept a guide invitation by token */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token required." }, { status: 400 });

  // MUST use service client here — pending connections have client_user_id = NULL,
  // so RLS (which only allows reading where client_user_id = auth.uid() OR guide_id = auth.uid())
  // returns nothing for the accepting user. Every invite-accept would silently 404 without this.
  const service = await createServiceClient();

  const { data: connection } = await (service as any)
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

  // Activate connection and link the user
  await (service as any)
    .from("guide_client_connections")
    .update({
      client_user_id: user.id,
      status: "active",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", connection.id);

  // Set referred_by so the profile page shows the guide (if not already set)
  const { data: me } = await (service as any)
    .from("users")
    .select("referred_by")
    .eq("id", user.id)
    .single();

  if (!me?.referred_by) {
    await (service as any)
      .from("users")
      .update({ referred_by: connection.guide_id })
      .eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
}
