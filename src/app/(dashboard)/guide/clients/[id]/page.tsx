import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export const metadata = { title: "Client Profile" };

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

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/guide/clients/${id}`,
    { headers: { Cookie: "" }, cache: "no-store" }
  );

  // Fallback: fetch directly via supabase
  const { data: connection } = await (supabase as any)
    .from("guide_client_connections")
    .select("*")
    .eq("id", id)
    .eq("guide_id", user!.id)
    .single();

  if (!connection) notFound();

  const [{ data: readings }, linkedProfile] = await Promise.all([
    (supabase as any)
      .from("guide_readings")
      .select("id, title, reading_type, is_published, is_archived, client_viewed_at, created_at, published_at")
      .eq("client_connection_id", id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    connection.client_user_id
      ? (supabase as any)
          .from("users")
          .select("display_name, avatar_url, app_streak, xp_level")
          .eq("id", connection.client_user_id)
          .single()
          .then(({ data }: { data: any }) => data)
      : null,
  ]);

  const name = connection.client_name ?? connection.client_email.split("@")[0];
  const published = (readings ?? []).filter((r: any) => r.is_published);
  const drafts = (readings ?? []).filter((r: any) => !r.is_published);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/[0.08] border-2 border-gold/20 flex items-center justify-center text-2xl">
            {connection.status === "pending" ? "✉" : "♎"}
          </div>
          <div>
            <h1 className="font-serif text-display-xs text-foreground">{name}</h1>
            <p className="text-sm text-muted-foreground/60">{connection.client_email}</p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border inline-block mt-1 ${
                connection.status === "active"
                  ? "bg-gold/[0.06] border-gold/15 text-gold/60"
                  : "bg-white/[0.04] border-white/[0.06] text-muted-foreground/40"
              }`}
            >
              {connection.status}
            </span>
          </div>
        </div>

        <Link
          href={`/guide/clients/${id}/reading/new`}
          className="px-4 py-2 rounded-full bg-gold/[0.1] border border-gold/25 text-gold/80 text-sm hover:bg-gold/[0.18] transition-all"
        >
          + New Reading
        </Link>
      </div>

      {/* Linked profile stats */}
      {linkedProfile && (
        <div className="glass-card p-5 border-gold/10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Client Activity
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg text-foreground/80">{linkedProfile.app_streak ?? 0}</p>
              <p className="text-xs text-muted-foreground/40">Day streak</p>
            </div>
            <div>
              <p className="text-lg text-foreground/80">Lv. {linkedProfile.xp_level ?? 1}</p>
              <p className="text-xs text-muted-foreground/40">XP Level</p>
            </div>
            <div>
              <p className="text-lg text-foreground/80">{published.filter((r: any) => r.client_viewed_at).length}</p>
              <p className="text-xs text-muted-foreground/40">Readings read</p>
            </div>
          </div>
        </div>
      )}

      {/* Birth info */}
      {connection.client_birth_date && (
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Birth Data</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="text-foreground/80">
                {format(new Date(connection.client_birth_date), "MMMM d, yyyy")}
              </span>
            </div>
            {connection.client_birth_city && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">City</span>
                <span className="text-foreground/80">{connection.client_birth_city}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Readings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Readings</p>
          <Link
            href={`/guide/clients/${id}/reading/new`}
            className="text-xs text-muted-foreground/40 hover:text-gold/60 transition-colors"
          >
            Create new →
          </Link>
        </div>

        {readings?.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground/50">No readings yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(readings ?? []).map((r: any) => (
              <div
                key={r.id}
                className="glass-card px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">{TYPE_ICONS[r.reading_type] ?? "✦"}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground/80 truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground/40">
                      {TYPE_LABELS[r.reading_type]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.is_published && (
                    <span className="text-[10px] text-muted-foreground/30">
                      {r.client_viewed_at ? "Read ✓" : "Unread"}
                    </span>
                  )}
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
        )}
      </div>

      {/* Notes */}
      <div className="glass-card p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Private Notes
        </p>
        <p className="text-sm text-foreground/60 leading-relaxed">
          {connection.client_notes ?? (
            <span className="text-muted-foreground/30 italic">
              No notes yet. Add context about this client — themes, sensitivities, recurring patterns.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
