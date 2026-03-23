import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subscription } = await req.json();

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Invalid subscription object." }, { status: 400 });
  }

  await (supabase as any)
    .from("users")
    .update({ push_subscription: subscription })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await (supabase as any)
    .from("users")
    .update({ push_subscription: null })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
