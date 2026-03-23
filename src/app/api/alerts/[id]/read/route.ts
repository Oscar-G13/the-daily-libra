import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/alerts/[id]/read — mark an alert as read */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await (supabase as any)
    .from("user_alerts")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id); // RLS + safety check

  return NextResponse.json({ success: true });
}
