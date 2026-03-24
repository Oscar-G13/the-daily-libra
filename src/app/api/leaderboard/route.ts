import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LeaderboardType = "streak" | "weekly_xp" | "journal_count";

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  value: number;
  is_current_user: boolean;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "weekly_xp") as LeaderboardType;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 25);

  let entries: LeaderboardEntry[] = [];

  if (type === "streak" || type === "weekly_xp") {
    const column = type === "streak" ? "app_streak" : "weekly_xp";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (supabase as any)
      .from("users")
      .select("id, display_name, avatar_url, app_streak, weekly_xp")
      .eq("account_status", "active")
      .gt(column, 0)
      .order(column, { ascending: false })
      .limit(limit);

    entries = (rows ?? []).map(
      (row: { id: string; display_name: string | null; avatar_url: string | null; app_streak: number; weekly_xp: number }, i: number) => ({
        rank: i + 1,
        user_id: row.id,
        display_name: row.display_name ?? "Libra",
        avatar_url: row.avatar_url,
        value: type === "streak" ? (row.app_streak ?? 0) : (row.weekly_xp ?? 0),
        is_current_user: row.id === user.id,
      })
    );
  } else if (type === "journal_count") {
    // Aggregate journal entries in the current month per user
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStartStr = monthStart.toISOString().split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (supabase as any)
      .from("journal_entries")
      .select("user_id")
      .gte("entry_date", monthStartStr);

    const counts: Record<string, number> = {};
    for (const row of rows ?? []) {
      counts[row.user_id] = (counts[row.user_id] ?? 0) + 1;
    }

    const topUserIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topUserIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: users } = await (supabase as any)
        .from("users")
        .select("id, display_name, avatar_url")
        .in("id", topUserIds);

      const userMap = new Map((users ?? []).map((u: { id: string }) => [u.id, u]));

      entries = topUserIds.map((id, i) => {
        const u = userMap.get(id) as { id: string; display_name: string | null; avatar_url: string | null } | undefined;
        return {
          rank: i + 1,
          user_id: id,
          display_name: u?.display_name ?? "Libra",
          avatar_url: u?.avatar_url ?? null,
          value: counts[id],
          is_current_user: id === user.id,
        };
      });
    }
  }

  // Ensure current user appears (append if not in top N)
  const currentUserInList = entries.some((e) => e.is_current_user);
  if (!currentUserInList) {
    // Fetch current user's value
    if (type === "streak" || type === "weekly_xp") {
      const col = type === "streak" ? "app_streak" : "weekly_xp";
      const { data: me } = await supabase
        .from("users")
        .select(`id, display_name, avatar_url, ${col}`)
        .eq("id", user.id)
        .single();
      if (me) {
        entries.push({
          rank: entries.length + 1,
          user_id: user.id,
          display_name: (me as { display_name: string | null }).display_name ?? "You",
          avatar_url: (me as { avatar_url: string | null }).avatar_url,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value: (me as any)[col] ?? 0,
          is_current_user: true,
        });
      }
    }
  }

  const typeLabels: Record<LeaderboardType, string> = {
    streak: "App Streak",
    weekly_xp: "Weekly XP",
    journal_count: "Journal Entries This Month",
  };

  return NextResponse.json({
    type,
    label: typeLabels[type],
    entries,
    updatedAt: new Date().toISOString(),
  });
}
