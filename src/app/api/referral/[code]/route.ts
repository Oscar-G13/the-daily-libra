import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public endpoint — returns limited profile info for an invite page
export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("users")
    .select("id, display_name, avatar_url, primary_archetype:libra_profiles(primary_archetype), referral_count, created_at")
    .eq("referral_code", params.code)
    .single();

  if (!data) return NextResponse.json({ error: "Invite link not found." }, { status: 404 });

  return NextResponse.json({ profile: data });
}
