import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Admin Panel — The Daily Libra" };

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Admin guard
  const { data: selfData } = await (supabase as any)
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!selfData?.is_admin) redirect("/dashboard");

  // Today's date boundary (UTC midnight)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const [
    { count: totalUsers },
    { count: premiumUsers },
    { count: highPriestessUsers },
    { count: todayUsers },
    { count: totalFeedPosts },
    { count: bannedOrSuspended },
  ] = await Promise.all([
    (supabase as any)
      .from("users")
      .select("id", { count: "exact", head: true }),

    (supabase as any)
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("subscription_tier", "premium"),

    (supabase as any)
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("subscription_tier", "high_priestess"),

    (supabase as any)
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayIso),

    (supabase as any)
      .from("feed_posts")
      .select("id", { count: "exact", head: true }),

    (supabase as any)
      .from("users")
      .select("id", { count: "exact", head: true })
      .in("account_status", ["banned", "suspended"]),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0, accent: false },
    { label: "Premium", value: premiumUsers ?? 0, accent: true },
    { label: "High Priestess", value: highPriestessUsers ?? 0, accent: true },
    { label: "Joined Today", value: todayUsers ?? 0, accent: false },
    { label: "Feed Posts", value: totalFeedPosts ?? 0, accent: false },
    { label: "Banned / Suspended", value: bannedOrSuspended ?? 0, accent: false, warning: (bannedOrSuspended ?? 0) > 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          Administration
        </p>
        <h1 className="font-serif text-display-sm text-foreground">Admin Panel</h1>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card p-5 space-y-1"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {stat.label}
            </p>
            <p
              className={`font-serif text-3xl font-light ${
                stat.warning
                  ? "text-red-400"
                  : stat.accent
                  ? "text-gold-200"
                  : "text-foreground"
              }`}
            >
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/[0.08] border border-gold/25 text-gold/80 text-sm hover:bg-gold/[0.15] transition-all"
          >
            User Management →
          </Link>
        </div>
      </div>
    </div>
  );
}
