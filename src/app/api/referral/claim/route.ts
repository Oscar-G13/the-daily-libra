import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Called after signup when a referral code was in localStorage
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "No code." }, { status: 400 });

  // Check user doesn't already have a referrer
  const { data: me } = await (supabase as any)
    .from("users")
    .select("referred_by, referral_code")
    .eq("id", user.id)
    .single();

  if (me?.referred_by) {
    return NextResponse.json({ ok: true, already_claimed: true });
  }

  // Don't let people refer themselves
  if (me?.referral_code === code) {
    return NextResponse.json({ error: "Cannot use your own invite code." }, { status: 400 });
  }

  // Find the referrer
  const { data: referrer } = await (supabase as any)
    .from("users")
    .select("id")
    .eq("referral_code", code)
    .single();

  if (!referrer) return NextResponse.json({ error: "Invalid code." }, { status: 404 });

  await (supabase as any)
    .from("users")
    .update({ referred_by: referrer.id })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
