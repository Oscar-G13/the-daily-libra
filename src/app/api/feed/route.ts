import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

/** GET /api/feed?cursor=<created_at>&type=<post_type> */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // ISO timestamp for pagination
  const typeFilter = searchParams.get("type");

  let query = (supabase as any)
    .from("feed_posts")
    .select(
      `id, post_type, content, mood, like_count, is_anonymous, created_at,
       user_id,
       feed_likes!left(id, user_id)`
    )
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }
  if (typeFilter) {
    query = query.eq("post_type", typeFilter);
  }

  const { data: posts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch author info separately (public profiles only)
  const userIds = Array.from(new Set((posts ?? []).map((p: any) => p.user_id as string)));
  let authorMap: Record<string, { display_name: string | null; avatar_url: string | null; primary_archetype: string | null }> = {};

  if (userIds.length > 0) {
    const { data: authors } = await (supabase as any)
      .from("users")
      .select("id, display_name, avatar_url")
      .in("id", userIds);

    // Also grab archetypes
    const { data: archetypes } = await supabase
      .from("libra_profiles")
      .select("user_id, primary_archetype")
      .in("user_id", userIds as string[]);

    const archetypeMap: Record<string, string> = {};
    (archetypes ?? []).forEach((a: any) => {
      archetypeMap[a.user_id] = a.primary_archetype;
    });

    (authors ?? []).forEach((a: any) => {
      authorMap[a.id] = {
        display_name: a.display_name,
        avatar_url: a.avatar_url,
        primary_archetype: archetypeMap[a.id] ?? null,
      };
    });
  }

  const enriched = (posts ?? []).map((p: any) => {
    const likedByMe = (p.feed_likes ?? []).some((l: any) => l.user_id === user.id);
    const author = p.is_anonymous ? null : authorMap[p.user_id];
    return {
      id: p.id,
      post_type: p.post_type,
      content: p.content,
      mood: p.mood,
      like_count: p.like_count,
      liked_by_me: likedByMe,
      is_own: p.user_id === user.id,
      is_anonymous: p.is_anonymous,
      created_at: p.created_at,
      author,
    };
  });

  return NextResponse.json({ posts: enriched, has_more: (posts ?? []).length === PAGE_SIZE });
}

/** POST /api/feed — create a post */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, post_type, mood, is_anonymous, source_id } = await req.json();

  if (!content?.trim()) return NextResponse.json({ error: "Content required." }, { status: 400 });
  if (!["reading", "reflection", "compatibility", "insight", "quote"].includes(post_type)) {
    return NextResponse.json({ error: "Invalid post_type." }, { status: 400 });
  }

  // Truncate to 500 chars
  const trimmed = content.trim().slice(0, 500);

  const { data, error } = await (supabase as any)
    .from("feed_posts")
    .insert({
      user_id: user.id,
      post_type,
      content: trimmed,
      mood: mood ?? null,
      is_anonymous: is_anonymous ?? false,
      source_id: source_id ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id });
}

/** DELETE /api/feed?id=<post_id> */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("id");
  if (!postId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await (supabase as any)
    .from("feed_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
