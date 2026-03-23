import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = { title: "My Guidance" };

const TYPE_ICONS: Record<string, string> = {
  custom: "✦",
  love_forecast: "🌹",
  year_ahead: "🌟",
  natal_summary: "♎",
  transit_report: "🪐",
  monthly: "🌙",
};

const TYPE_LABELS: Record<string, string> = {
  custom: "Personal Reading",
  love_forecast: "Love Forecast",
  year_ahead: "Year Ahead",
  natal_summary: "Natal Chart Summary",
  transit_report: "Transit Report",
  monthly: "Monthly Reading",
};

export default async function GuidancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all active guide connections for this user
  const { data: connections } = await (supabase as any)
    .from("guide_client_connections")
    .select("id, guide_id, accepted_at")
    .eq("client_user_id", user!.id)
    .eq("status", "active");

  if (!connections?.length) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <span className="text-4xl block">🌙</span>
        <h1 className="font-serif text-display-xs text-foreground">My Guidance</h1>
        <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-sm mx-auto">
          You haven&apos;t accepted a Guide invitation yet. When a Guide sends you readings,
          they&apos;ll appear here — separate from your personal content.
        </p>
      </div>
    );
  }

  const connectionIds = connections.map((c: any) => c.id);
  const guideIds = connections.map((c: any) => c.guide_id);

  const [{ data: guideUsers }, { data: guideProfiles }, { data: readings }] = await Promise.all([
    (supabase as any).from("users").select("id, display_name, avatar_url").in("id", guideIds),
    (supabase as any).from("guide_profiles").select("id, business_name, tagline").in("id", guideIds),
    (supabase as any)
      .from("guide_readings")
      .select("id, client_connection_id, title, reading_type, client_viewed_at, published_at")
      .in("client_connection_id", connectionIds)
      .eq("is_published", true)
      .eq("is_archived", false)
      .order("published_at", { ascending: false }),
  ]);

  const guideUserMap: Record<string, any> = {};
  (guideUsers ?? []).forEach((g: any) => { guideUserMap[g.id] = g; });

  const guideProfileMap: Record<string, any> = {};
  (guideProfiles ?? []).forEach((g: any) => { guideProfileMap[g.id] = g; });

  const readingsByConnection: Record<string, any[]> = {};
  (readings ?? []).forEach((r: any) => {
    if (!readingsByConnection[r.client_connection_id]) {
      readingsByConnection[r.client_connection_id] = [];
    }
    readingsByConnection[r.client_connection_id].push(r);
  });

  const totalUnread = (readings ?? []).filter((r: any) => !r.client_viewed_at).length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-display-xs text-foreground">My Guidance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Readings from your Guide
          {totalUnread > 0 && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gold/[0.1] border border-gold/20 text-gold/70">
              {totalUnread} new
            </span>
          )}
        </p>
      </div>

      {connections.map((conn: any) => {
        const guideUser = guideUserMap[conn.guide_id];
        const guideProfile = guideProfileMap[conn.guide_id];
        const connReadings = readingsByConnection[conn.id] ?? [];
        const guideName = guideProfile?.business_name ?? guideUser?.display_name ?? "Your Guide";

        return (
          <div key={conn.id} className="space-y-4">
            {/* Guide header */}
            <div className="flex items-center gap-3">
              {guideUser?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={guideUser.avatar_url}
                  alt={guideName}
                  className="w-10 h-10 rounded-full object-cover border border-gold/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gold/[0.08] border border-gold/20 flex items-center justify-center">
                  🌙
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground/90">{guideName}</p>
                {guideProfile?.tagline && (
                  <p className="text-xs text-muted-foreground/50 italic">{guideProfile.tagline}</p>
                )}
              </div>
            </div>

            {/* Readings from this guide */}
            {connReadings.length === 0 ? (
              <div className="glass-card p-5 text-center">
                <p className="text-sm text-muted-foreground/50">
                  No readings yet from this Guide.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {connReadings.map((r: any) => (
                  <Link key={r.id} href={`/guidance/${r.id}`}>
                    <div
                      className={`glass-card px-4 py-4 flex items-center gap-4 hover:border-gold/20 transition-all ${
                        !r.client_viewed_at ? "border-gold/15" : ""
                      }`}
                    >
                      <span className="text-xl shrink-0">{TYPE_ICONS[r.reading_type] ?? "✦"}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !r.client_viewed_at
                              ? "text-foreground font-medium"
                              : "text-foreground/75"
                          } truncate`}
                        >
                          {r.title}
                          {!r.client_viewed_at && (
                            <span className="ml-2 text-[10px] text-gold/60">NEW</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground/40 mt-0.5">
                          {TYPE_LABELS[r.reading_type]} ·{" "}
                          {formatDistanceToNow(new Date(r.published_at), { addSuffix: true })}
                        </p>
                      </div>
                      <span className="text-muted-foreground/30 text-sm shrink-0">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
