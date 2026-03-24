import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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
    .select("referred_by, referral_code, display_name, aether_balance")
    .eq("id", user.id)
    .single();

  if (me?.referred_by) {
    return NextResponse.json({ ok: true, already_claimed: true });
  }

  // Don't let people refer themselves
  if (me?.referral_code === code) {
    return NextResponse.json({ error: "Cannot use your own invite code." }, { status: 400 });
  }

  // Find the referrer — check if they are a Guide (HP tier)
  const { data: referrer } = await (supabase as any)
    .from("users")
    .select("id, subscription_tier, display_name")
    .eq("referral_code", code)
    .single();

  if (!referrer) return NextResponse.json({ error: "Invalid code." }, { status: 404 });

  const isGuide = referrer.subscription_tier === "high_priestess";
  // Aether gift: 150 for guide invite, 80 for regular
  const aetherGift = isGuide ? 150 : 80;
  const newBalance = (me?.aether_balance ?? 0) + aetherGift;

  const service = await createServiceClient();

  const updates: Promise<unknown>[] = [
    (service as any)
      .from("users")
      .update({ referred_by: referrer.id, aether_balance: newBalance })
      .eq("id", user.id),
    (service as any).from("aether_transactions").insert({
      user_id: user.id,
      amount: aetherGift,
      transaction_type: isGuide ? "referral_guide_invite" : "referral_invite",
      description: isGuide
        ? `Welcome gift from your Guide — ${aetherGift} Aether`
        : `Welcome gift from a friend — ${aetherGift} Aether`,
      metadata: { referrer_id: referrer.id, code },
    }),
  ];

  // If the referrer is a Guide, auto-create an active guide_client_connections entry
  // so the user sees their guide immediately on the dashboard without needing a separate invite flow.
  if (isGuide) {
    const inviteToken = crypto.randomUUID();
    updates.push(
      (service as any).from("guide_client_connections").insert({
        guide_id: referrer.id,
        client_user_id: user.id,
        client_email: user.email ?? "",
        client_name: me?.display_name ?? "New Client",
        status: "active",
        invite_token: inviteToken,
        accepted_at: new Date().toISOString(),
      })
    );
  }

  await Promise.all(updates);

  return NextResponse.json({ ok: true, aether_awarded: aetherGift, is_guide_invite: isGuide });
}
