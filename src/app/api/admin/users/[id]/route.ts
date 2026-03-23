import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// ─── Shared admin guard ───────────────────────────────────────────────────────

async function requireAdmin(supabase: any, userId: string) {
  const { data: adminUser } = await (supabase as any)
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return !!adminUser?.is_admin;
}

// ─── GET /api/admin/users/[id] ────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const serviceSupabase = await createServiceClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await requireAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetId = params.id;

  const columns = [
    "id",
    "email",
    "display_name",
    "subscription_tier",
    "is_admin",
    "account_status",
    "muted_until",
    "app_streak",
    "xp_level",
    "created_at",
    "share_token",
  ].join(", ");

  const { data: targetUser, error: userError } = await (serviceSupabase as any)
    .from("users")
    .select(columns)
    .eq("id", targetId)
    .single();

  if (userError || !targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Subscriptions row
  const { data: subscription } = await serviceSupabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", targetId)
    .maybeSingle();

  // Alert count
  const { count: alertCount } = await (serviceSupabase as any)
    .from("user_alerts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", targetId);

  return NextResponse.json({
    user: targetUser,
    subscription: subscription ?? null,
    alert_count: alertCount ?? 0,
  });
}

// ─── PATCH /api/admin/users/[id] ─────────────────────────────────────────────

type PatchBody = {
  account_status?: "active" | "suspended" | "banned" | "muted";
  muted_until?: string | null;
  subscription_tier?: "free" | "premium" | "high_priestess";
  is_admin?: boolean;
};

const ALLOWED_ACCOUNT_STATUSES = new Set(["active", "suspended", "banned", "muted"]);
const ALLOWED_TIERS = new Set(["free", "premium", "high_priestess"]);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const serviceSupabase = await createServiceClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await requireAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Whitelist fields
  const updates: Record<string, unknown> = {};

  if (body.account_status !== undefined) {
    if (!ALLOWED_ACCOUNT_STATUSES.has(body.account_status)) {
      return NextResponse.json(
        { error: `Invalid account_status: ${body.account_status}` },
        { status: 400 }
      );
    }
    updates.account_status = body.account_status;
  }

  if ("muted_until" in body) {
    updates.muted_until = body.muted_until ?? null;
  }

  if (body.subscription_tier !== undefined) {
    if (!ALLOWED_TIERS.has(body.subscription_tier)) {
      return NextResponse.json(
        { error: `Invalid subscription_tier: ${body.subscription_tier}` },
        { status: 400 }
      );
    }
    updates.subscription_tier = body.subscription_tier;
  }

  if (body.is_admin !== undefined) {
    if (typeof body.is_admin !== "boolean") {
      return NextResponse.json({ error: "is_admin must be a boolean" }, { status: 400 });
    }
    updates.is_admin = body.is_admin;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data: updatedUser, error: updateError } = await (serviceSupabase as any)
    .from("users")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (updateError) {
    console.error("[admin/users PATCH]", updateError);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: updatedUser });
}
