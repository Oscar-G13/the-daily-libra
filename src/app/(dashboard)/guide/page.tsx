import { createClient } from "@/lib/supabase/server";
import { isHighPriestess } from "@/lib/premium";
import { GuideGate } from "@/components/guide/guide-gate";
import { ClientCard } from "@/components/guide/client-card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = { title: "Guide Studio" };

const TYPE_LABELS: Record<string, string> = {
  custom: "Personal Reading",
  love_forecast: "Love Forecast",
  year_ahead: "Year Ahead",
  natal_summary: "Natal Chart Summary",
  transit_report: "Transit Report",
  monthly: "Monthly Reading",
};

export default async function GuidePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier, display_name, referral_code")
    .eq("id", user!.id)
    .single();

  if (!isHighPriestess(userData?.subscription_tier)) {
    return <GuideGate feature="guide_studio" />;
  }

  const [{ data: guideProfile }, { data: connections }, { data: recentReadings }] =
    await Promise.all([
      (supabase as any).from("guide_profiles").select("*").eq("id", user!.id).single(),
      (supabase as any)
        .from("guide_client_connections")
        .select("*")
        .eq("guide_id", user!.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("guide_readings")
        .select(
          "id, title, reading_type, is_published, client_viewed_at, created_at, published_at, client_connection_id"
        )
        .eq("guide_id", user!.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  // Fetch linked user activity for connected clients
  const linkedUserIds = (connections ?? [])
    .filter((c: any) => c.client_user_id)
    .map((c: any) => c.client_user_id);

  const { data: linkedUsersData } = linkedUserIds.length
    ? await (supabase as any)
        .from("users")
        .select("id, app_streak, xp_level, last_active_date")
        .in("id", linkedUserIds)
    : { data: [] };

  const linkedUserMap: Record<string, any> = {};
  (linkedUsersData ?? []).forEach((u: any) => { linkedUserMap[u.id] = u; });

  const clients = connections ?? [];
  const readings = recentReadings ?? [];

  // Build reading counts per connection
  const readingCountMap: Record<string, number> = {};
  const unreadCountMap: Record<string, number> = {};
  const lastReadingMap: Record<string, string | null> = {};

  // Fetch all readings for reading counts
  const { data: allReadings } = await (supabase as any)
    .from("guide_readings")
    .select("client_connection_id, client_viewed_at, published_at, is_published")
    .eq("guide_id", user!.id)
    .eq("is_archived", false);

  (allReadings ?? []).forEach((r: any) => {
    const cid = r.client_connection_id;
    if (r.is_published) {
      readingCountMap[cid] = (readingCountMap[cid] ?? 0) + 1;
      if (!r.client_viewed_at) {
        unreadCountMap[cid] = (unreadCountMap[cid] ?? 0) + 1;
      }
      if (!lastReadingMap[cid] || r.published_at > lastReadingMap[cid]!) {
        lastReadingMap[cid] = r.published_at;
      }
    }
  });

  const activeClients = clients.filter((c: any) => c.status === "active");
  const pendingClients = clients.filter((c: any) => c.status === "pending");
  const totalUnread = Object.values(unreadCountMap).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            🌙 Guide Studio
          </p>
          <h1 className="font-serif text-display-sm text-foreground">
            {guideProfile?.business_name ?? userData?.display_name ?? "Your Studio"}
          </h1>
          {guideProfile?.tagline && (
            <p className="text-sm text-muted-foreground/60 italic mt-1">{guideProfile.tagline}</p>
          )}
        </div>
        <div className="flex gap-2">
          {userData?.referral_code && (
            <Link
              href={`/guides/${userData.referral_code}`}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all"
            >
              View Public Profile
            </Link>
          )}
          <Link
            href="/guide/profile"
            className="text-xs px-3 py-1.5 rounded-lg border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all"
          >
            Edit Profile
          </Link>
          <Link
            href="/guide/clients"
            className="text-xs px-3 py-1.5 rounded-lg bg-gold/[0.08] border border-gold/20 text-gold/70 hover:bg-gold/[0.15] transition-all"
          >
            + Invite Client
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Active Clients",
            value: activeClients.length,
            max: guideProfile?.client_slots ?? 3,
          },
          { label: "Pending Invites", value: pendingClients.length },
          { label: "Unread by Clients", value: totalUnread },
          {
            label: "Readings Sent",
            value: Object.values(readingCountMap).reduce((a, b) => a + b, 0),
          },
        ].map(({ label, value, max }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className="text-2xl font-medium text-foreground">
              {value}
              {max !== undefined && (
                <span className="text-sm text-muted-foreground/40">/{max}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Client grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Clients</p>
          <Link
            href="/guide/clients"
            className="text-xs text-muted-foreground/40 hover:text-gold/60 transition-colors"
          >
            Manage all →
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="glass-card p-8 text-center space-y-4">
            <span className="text-3xl block">🌙</span>
            <p className="text-sm text-muted-foreground/60">No clients yet.</p>
            <Link
              href="/guide/clients"
              className="inline-flex text-sm text-gold/70 hover:text-gold transition-colors"
            >
              Send your first invitation →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.slice(0, 6).map((c: any) => (
              <ClientCard
                key={c.id}
                connection={c}
                readingCount={readingCountMap[c.id] ?? 0}
                unreadCount={unreadCountMap[c.id] ?? 0}
                lastReadingDate={lastReadingMap[c.id] ?? null}
                linkedUser={c.client_user_id ? linkedUserMap[c.client_user_id] ?? null : null}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent readings */}
      {readings.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
            Recent Readings
          </p>
          <div className="space-y-2">
            {readings.map((r: any) => (
              <div
                key={r.id}
                className="glass-card px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-gold/50 shrink-0">{r.is_published ? "🔮" : "📝"}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground/80 truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground/40">
                      {TYPE_LABELS[r.reading_type] ?? r.reading_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      r.is_published
                        ? "bg-gold/[0.06] border-gold/15 text-gold/60"
                        : "bg-white/[0.04] border-white/[0.06] text-muted-foreground/40"
                    }`}
                  >
                    {r.is_published ? "Published" : "Draft"}
                  </span>
                  <p className="text-xs text-muted-foreground/30">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
