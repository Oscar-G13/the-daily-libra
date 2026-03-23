import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/feed/like — toggle like on a post */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  // Check if already liked
  const { data: existing } = await (supabase as any)
    .from("feed_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existing) {
    // Unlike
    await (supabase as any)
      .from("feed_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);
    return NextResponse.json({ liked: false });
  } else {
    // Like
    await (supabase as any)
      .from("feed_likes")
      .insert({ user_id: user.id, post_id: postId });
    return NextResponse.json({ liked: true });
  }
}
