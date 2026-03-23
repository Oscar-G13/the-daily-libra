import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = { title: "Reading" };

const TYPE_LABELS: Record<string, string> = {
  custom: "Personal Reading",
  love_forecast: "Love Forecast",
  year_ahead: "Year Ahead",
  natal_summary: "Natal Chart Summary",
  transit_report: "Transit Report",
  monthly: "Monthly Reading",
};

export default async function GuidanceReadingPage({
  params,
}: {
  params: Promise<{ readingId: string }>;
}) {
  const { readingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the reading — RLS ensures only client can access published readings for their connection
  const { data: reading } = await (supabase as any)
    .from("guide_readings")
    .select("*, guide_client_connections(client_user_id, guide_id)")
    .eq("id", readingId)
    .eq("is_published", true)
    .single();

  if (!reading || reading.guide_client_connections?.client_user_id !== user!.id) {
    notFound();
  }

  // Mark as viewed
  if (!reading.client_viewed_at) {
    await (supabase as any)
      .from("guide_readings")
      .update({ client_viewed_at: new Date().toISOString() })
      .eq("id", readingId);
  }

  const guideId = reading.guide_client_connections.guide_id;
  const [{ data: guideUser }, { data: guideProfile }] = await Promise.all([
    (supabase as any).from("users").select("display_name, avatar_url").eq("id", guideId).single(),
    (supabase as any)
      .from("guide_profiles")
      .select("business_name, tagline")
      .eq("id", guideId)
      .single(),
  ]);

  const guideName = guideProfile?.business_name ?? guideUser?.display_name ?? "Your Guide";
  const typeLabel = TYPE_LABELS[reading.reading_type] ?? "Reading";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href="/guidance"
        className="text-xs text-muted-foreground/40 hover:text-gold/60 transition-colors"
      >
        ← My Guidance
      </Link>

      {/* Reading header */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {typeLabel}
        </p>
        <h1 className="font-serif text-display-sm text-foreground leading-snug">
          {reading.title}
        </h1>
        <p className="text-xs text-muted-foreground/40">
          {format(new Date(reading.published_at), "MMMM d, yyyy")}
        </p>
      </div>

      {/* Guide attribution */}
      <div className="flex items-center gap-3 py-3 border-y border-white/[0.04]">
        {guideUser?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guideUser.avatar_url}
            alt={guideName}
            className="w-8 h-8 rounded-full object-cover border border-gold/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gold/[0.08] border border-gold/20 flex items-center justify-center text-sm">
            🌙
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground/50">From your Guide</p>
          <p className="text-sm text-foreground/80">{guideName}</p>
        </div>
      </div>

      {/* Reading content */}
      <div className="glass-card p-7">
        <div className="font-serif text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {reading.content}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <Link
          href="/guidance"
          className="text-xs text-muted-foreground/30 hover:text-gold/50 transition-colors"
        >
          View all readings from {guideName}
        </Link>
      </div>
    </div>
  );
}
