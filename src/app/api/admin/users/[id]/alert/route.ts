import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AlertType = "info" | "warning" | "ban" | "mute" | "suspension";

const ALLOWED_ALERT_TYPES = new Set<AlertType>([
  "info",
  "warning",
  "ban",
  "mute",
  "suspension",
]);

// ─── POST /api/admin/users/[id]/alert ─────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin check
  const { data: adminUser } = await (supabase as any)
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!adminUser?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse body
  let body: { message?: string; alert_type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "message is required and cannot be empty" }, { status: 400 });
  }

  const alertType = body.alert_type as AlertType | undefined;
  if (!alertType || !ALLOWED_ALERT_TYPES.has(alertType)) {
    return NextResponse.json(
      {
        error: `alert_type must be one of: ${Array.from(ALLOWED_ALERT_TYPES).join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Verify target user exists
  const { data: targetUser } = await (supabase as any)
    .from("users")
    .select("id")
    .eq("id", params.id)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: "Target user not found" }, { status: 404 });
  }

  // Insert alert
  const { data: alert, error: insertError } = await (supabase as any)
    .from("user_alerts")
    .insert({
      user_id: params.id,
      message,
      alert_type: alertType,
      sent_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[admin/users/[id]/alert POST]", insertError);
    return NextResponse.json({ error: "Failed to send alert" }, { status: 500 });
  }

  return NextResponse.json({ alert }, { status: 201 });
}
