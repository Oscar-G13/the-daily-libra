import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    display_name,
    pronouns,
    profile_bio,
    relationship_status,
    goals,
    tone_preference,
    profile_public,
  } = body;

  const updates: Record<string, unknown> = {};
  if (display_name !== undefined) updates.display_name = display_name;
  if (pronouns !== undefined) updates.pronouns = pronouns;
  if (profile_bio !== undefined) updates.profile_bio = profile_bio;
  if (relationship_status !== undefined) updates.relationship_status = relationship_status;
  if (goals !== undefined) updates.goals = goals;
  if (tone_preference !== undefined) updates.tone_preference = tone_preference;
  if (profile_public !== undefined) updates.profile_public = profile_public;

  const { error } = await supabase.from("users").update(updates).eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
