import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { awardXP, XP_VALUES } from "@/lib/gamification/engine";
import type { XPAction } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const action: XPAction = body.action;

  if (!action || !(action in XP_VALUES)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const result = await awardXP(user.id, action, supabase);
  return NextResponse.json(result);
}
