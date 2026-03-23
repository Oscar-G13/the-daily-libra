import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GuideInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Look up the invitation
  const { data: connection } = await (supabase as any)
    .from("guide_client_connections")
    .select("guide_id, client_name, status")
    .eq("invite_token", token)
    .single();

  if (!connection || connection.status === "archived") notFound();

  // Fetch guide info
  const { data: guideUser } = await (supabase as any)
    .from("users")
    .select("display_name, avatar_url")
    .eq("id", connection.guide_id)
    .single();

  const { data: guideProfile } = await (supabase as any)
    .from("guide_profiles")
    .select("business_name, tagline, specialties, bio")
    .eq("id", connection.guide_id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://thedailylibra.com";
  const guideName = guideProfile?.business_name ?? guideUser?.display_name ?? "Your Guide";
  const tagline = guideProfile?.tagline ?? "Personalized readings for you.";
  const specialties: string[] = guideProfile?.specialties ?? [];

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 py-12">
      {/* Subtle background */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 50%, rgba(196,160,90,1) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(139,90,43,1) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <span className="font-serif text-2xl text-foreground">⚖ The Daily Libra</span>
        </div>

        {/* Guide card */}
        <div className="glass-card p-8 space-y-6 text-center">
          {guideUser?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={guideUser.avatar_url}
              alt={guideName}
              className="w-20 h-20 rounded-full object-cover border-2 border-gold/30 mx-auto"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gold/[0.08] border-2 border-gold/20 flex items-center justify-center text-3xl mx-auto">
              🌙
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              Invitation from
            </p>
            <h1 className="font-serif text-display-xs text-foreground">{guideName}</h1>
            <p className="text-sm text-muted-foreground/70 mt-1 italic">{tagline}</p>
          </div>

          {guideProfile?.bio && (
            <p className="text-sm text-foreground/70 leading-relaxed text-left border-l border-gold/20 pl-4">
              {guideProfile.bio}
            </p>
          )}

          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {specialties.slice(0, 5).map((s: string) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full border border-gold/20 text-gold/60 bg-gold/[0.04]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2 text-left">
            {[
              "Receive personal readings in your private Guidance inbox",
              "Access daily moon phases, transits, and retrograde insights",
              "No subscription required to receive readings",
              "Disconnect from your Guide at any time",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <span className="text-gold/50 text-sm mt-0.5 shrink-0">✦</span>
                <p className="text-sm text-foreground/70">{item}</p>
              </div>
            ))}
          </div>

          {/* CTA — client-side accept after login */}
          <div className="space-y-3 pt-2">
            <Link
              href={`/signup?guide_token=${token}`}
              className="block w-full py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-sm hover:opacity-90 transition-opacity text-center"
            >
              Accept &amp; Create Account
            </Link>
            <Link
              href={`/login?guide_token=${token}`}
              className="block w-full py-3 rounded-full border border-white/10 text-foreground text-sm hover:border-gold/30 transition-all text-center"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/30">
          Powered by{" "}
          <Link href={appUrl} className="hover:text-gold/50 transition-colors">
            The Daily Libra
          </Link>
        </p>
      </div>

      {/* Store token in localStorage */}
      <script
        dangerouslySetInnerHTML={{
          __html: `localStorage.setItem('guide_token', '${token.replace(/'/g, "")}');`,
        }}
      />
    </div>
  );
}
