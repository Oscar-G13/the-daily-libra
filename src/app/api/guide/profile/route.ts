import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isHighPriestess } from "@/lib/premium";

/** PATCH /api/guide/profile — update guide profile */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();
  if (!isHighPriestess(userData?.subscription_tier)) {
    return NextResponse.json({ error: "High Priestess tier required." }, { status: 403 });
  }

  const body = await req.json();
  const allowed = [
    "business_name",
    "tagline",
    "bio",
    "website_url",
    "specialties",
    "public_enabled",
    "profile_theme",
    "profile_layout",
    "welcome_headline",
    "cta_label",
    "guide_role",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields." }, { status: 400 });
  }

  await supabase
    .from("guide_profiles")
    .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
