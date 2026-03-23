import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/alerts — fetch unread alerts for current user */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ alerts: [] });

  const { data: alerts } = await (supabase as any)
    .from("user_alerts")
    .select("id, message, alert_type, created_at")
    .eq("user_id", user.id)
    .is("read_at", null)
    .order("created_at", { ascending: true });

  return NextResponse.json({ alerts: alerts ?? [] });
}
