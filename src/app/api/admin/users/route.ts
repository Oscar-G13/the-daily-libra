import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

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

  let query = (supabase as any)
    .from("users")
    .select(columns, { count: "exact" });

  if (search) {
    query = query.or(
      `display_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: users, count, error } = await query;

  if (error) {
    console.error("[admin/users GET]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return NextResponse.json({
    users: users ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
