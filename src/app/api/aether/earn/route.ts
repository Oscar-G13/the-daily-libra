import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// Allowed earn types and their fixed amounts
const EARN_AMOUNTS: Record<string, number> = {
  daily_login: 10,
  ritual_morning: 15,
  ritual_midday: 12,
  ritual_evening: 15,
  ritual_full_day: 25,
  streak_7: 50,
  streak_14: 100,
  streak_30: 200,
  streak_60: 300,
  community_like: 10,
  community_comment: 12,
  event_participation: 25,
  referral_milestone: 100,
  referral_streak_bonus: 50,
  achievement_unlock: 0, // amount passed in body
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, amount: customAmount, description, metadata } = body as {
    type: string;
    amount?: number;
    description?: string;
    metadata?: Record<string, unknown>;
  };

  if (!EARN_AMOUNTS.hasOwnProperty(type)) {
    return NextResponse.json({ error: "Unknown earn type." }, { status: 400 });
  }

  const amount = type === "achievement_unlock" ? (customAmount ?? 0) : EARN_AMOUNTS[type];
  if (amount <= 0) {
    return NextResponse.json({ error: "Amount must be positive." }, { status: 400 });
  }

  // Idempotency for daily earn types — prevent double-awarding per day
  const dailyTypes = ["daily_login", "ritual_morning", "ritual_midday", "ritual_evening", "ritual_full_day"];
  if (dailyTypes.includes(type)) {
    const todayStr = new Date().toISOString().split("T")[0];
    const service = await createServiceClient();
    const { count } = await (service as any)
      .from("aether_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("transaction_type", type)
      .gte("created_at", `${todayStr}T00:00:00Z`);

    if ((count ?? 0) > 0) {
      return NextResponse.json({ ok: true, skipped: true, reason: "already_awarded_today" });
    }
  }

  const service = await createServiceClient();

  // Insert transaction + increment balance atomically via RPC would be ideal;
  // here we do a read-then-update which is fine for single-server Next.js.
  const { data: currentUser } = await (service as any)
    .from("users")
    .select("aether_balance")
    .eq("id", user.id)
    .single();

  const newBalance = (currentUser?.aether_balance ?? 0) + amount;

  await Promise.all([
    (service as any).from("aether_transactions").insert({
      user_id: user.id,
      amount,
      transaction_type: type,
      description: description ?? null,
      metadata: metadata ?? null,
    }),
    (service as any)
      .from("users")
      .update({ aether_balance: newBalance })
      .eq("id", user.id),
  ]);

  return NextResponse.json({ ok: true, amount, new_balance: newBalance });
}
