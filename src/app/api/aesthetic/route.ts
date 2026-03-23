import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/premium";
import type { AestheticStyle } from "@/types";

const VALID_STYLES: AestheticStyle[] = [
  "soft_luxe",
  "dark_romance",
  "celestial_editorial",
  "clean_goddess",
  "velvet_minimalism",
  "modern_venus",
];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const style = body.style as AestheticStyle;

  if (!VALID_STYLES.includes(style)) {
    return NextResponse.json({ error: "Invalid aesthetic style." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (!hasFullAccess(profile?.subscription_tier)) {
    return NextResponse.json(
      { error: "Aesthetic Profile is part of Premium. Upgrade to continue." },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("libra_profiles")
    .update({ aesthetic_style: style })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to save aesthetic style." }, { status: 500 });
  }

  return NextResponse.json({ style });
}
