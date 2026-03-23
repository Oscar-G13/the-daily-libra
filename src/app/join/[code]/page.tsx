import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ARCHETYPE_LABELS } from "@/types";
import type { LibraArchetype } from "@/types";

interface InviterProfile {
  display_name: string | null;
  avatar_url: string | null;
  referral_count: number;
  created_at: string;
  libra_profiles: { primary_archetype: string } | null;
}

export default async function JoinPage({ params }: { params: { code: string } }) {
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("users")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("display_name, avatar_url, referral_count, created_at, libra_profiles(primary_archetype)" as any)
    .eq("referral_code", params.code)
    .single();

  const inviter = raw as InviterProfile | null;

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-1">
          <p className="font-serif text-2xl text-gold-gradient">⚖ The Daily Libra</p>
          <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">
            Built for Libras. Finally.
          </p>
        </div>

        {/* Inviter card */}
        {inviter ? (
          <div className="glass-card p-8 space-y-5">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                {inviter.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={inviter.avatar_url}
                    alt={inviter.display_name ?? "Inviter"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">⚖</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">
                You were invited by
              </p>
              <h2 className="font-serif text-xl text-foreground">
                {inviter.display_name ?? "A Fellow Libra"}
              </h2>
              {inviter.libra_profiles?.primary_archetype && (
                <p className="text-sm text-gold/60">
                  {ARCHETYPE_LABELS[inviter.libra_profiles.primary_archetype as LibraArchetype]}
                </p>
              )}
            </div>

            {inviter.referral_count > 0 && (
              <p className="text-xs text-muted-foreground/40">
                Has invited {inviter.referral_count} {inviter.referral_count === 1 ? "person" : "people"} to The Daily Libra
              </p>
            )}
          </div>
        ) : (
          <div className="glass-card p-6">
            <p className="text-sm text-muted-foreground/60">
              You&apos;ve been invited to The Daily Libra.
            </p>
          </div>
        )}

        {/* Value prop */}
        <div className="space-y-3 text-left">
          <p className="text-sm text-foreground/70 text-center leading-relaxed">
            An AI-powered astrology experience built exclusively for Libras. Your chart. Your contradictions. Your balance.
          </p>
          <ul className="space-y-2">
            {[
              "Personalized daily readings from your birth chart",
              "Libra archetype profiling & psychological portrait",
              "AI companion tuned to your sign and tendencies",
              "Compatibility, decision, and text analysis tools",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                <span className="text-gold/40 mt-0.5">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href={`/signup?ref=${params.code}`}
            className="block w-full py-4 rounded-xl bg-gold/10 border border-gold/25 text-gold font-medium hover:bg-gold/15 transition-all"
          >
            Create my Libra profile ✦
          </Link>
          <Link
            href="/login"
            className="block text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Already have an account? Sign in →
          </Link>
        </div>
      </div>

      {/* Script to save referral code */}
      <script
        dangerouslySetInnerHTML={{
          __html: `localStorage.setItem('libra_ref', '${params.code}');`,
        }}
      />
    </div>
  );
}
