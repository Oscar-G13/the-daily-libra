import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/rituals — return today's completion state for all three slots
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase as any)
    .from("rituals")
    .select("ritual_slot, completion_status, completed_at")
    .eq("user_id", user.id)
    .eq("ritual_date", today);

  const slots = { morning: false, midday: false, evening: false };
  for (const row of (rows ?? []) as { ritual_slot: string; completion_status: boolean | null }[]) {
    if (row.ritual_slot in slots) {
      slots[row.ritual_slot as keyof typeof slots] = row.completion_status ?? false;
    }
  }

  return NextResponse.json({ slots });
}
