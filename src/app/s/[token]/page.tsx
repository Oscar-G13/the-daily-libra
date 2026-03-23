import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { NatalChart } from "@/types";
import { ARCHETYPE_LABELS } from "@/types";
import { ARCHETYPE_DESCRIPTIONS } from "@/lib/astrology/archetypes";

interface Props {
  params: { token: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: user } = await (supabase as any)
    .from("users")
    .select("display_name")
    .eq("share_token", params.token)
    .single();

  const displayName = user?.display_name ?? "A Libra";
  return {
    title: `${displayName}'s Cosmic Profile — The Daily Libra`,
  };
}

export default async function ShareProfilePage({ params }: Props) {
  const { token } = params;
  const supabase = await createClient();

  // 1. Look up user by share_token
  const { data: user } = await (supabase as any)
    .from("users")
    .select("id, display_name, avatar_url, subscription_tier, account_status")
    .eq("share_token", token)
    .single();

  if (!user || user.account_status === "banned") {
    notFound();
  }

  const userId: string = user.id;
  const displayName: string = user.display_name ?? "A Libra";

  // 2. Fetch libra_profile
  const { data: libraProfile } = await supabase
    .from("libra_profiles")
    .select("primary_archetype")
    .eq("user_id", userId)
    .single();

  // 3. Fetch birth_profile
  const { data: birthProfile } = await supabase
    .from("birth_profiles")
    .select("natal_chart_json, birth_date, birth_city, birth_country")
    .eq("user_id", userId)
    .single();

  const natalChart =
    (birthProfile?.natal_chart_json as NatalChart | null) ?? null;

  const archetype = libraProfile?.primary_archetype ?? null;
  const archetypeLabel = archetype ? ARCHETYPE_LABELS[archetype as keyof typeof ARCHETYPE_LABELS] : null;
  const archetypeDesc = archetype ? ARCHETYPE_DESCRIPTIONS[archetype as keyof typeof ARCHETYPE_DESCRIPTIONS] : null;

  const SIGN_GLYPHS: Record<string, string> = {
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
    Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
    Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
  };

  return (
    <div className="min-h-screen bg-obsidian">
      <div className="max-w-lg mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="font-serif text-gold-400 text-sm tracking-widest uppercase hover:text-gold-300 transition-colors"
          >
            ⚖ The Daily Libra
          </Link>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8 gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover border-2 border-gold-500/40 shadow-glow-gold"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-obsidian-700 border-2 border-gold-500/30 flex items-center justify-center text-4xl shadow-inner-gold">
              ♎
            </div>
          )}

          <h1 className="font-serif text-display-xs text-white text-center">
            {displayName}
          </h1>

          {birthProfile?.birth_city && (
            <p className="text-sm text-white/40 tracking-wide">
              {birthProfile.birth_city}
              {birthProfile.birth_country ? `, ${birthProfile.birth_country}` : ""}
            </p>
          )}
        </div>

        {/* Natal Chart — Sun / Moon / Rising */}
        {natalChart && (
          <div className="mb-10">
            <p className="text-xs text-white/40 uppercase tracking-widest text-center mb-4">
              Birth Chart
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Sun", sign: natalChart.sun?.sign },
                { label: "Moon", sign: natalChart.moon?.sign },
                { label: "Rising", sign: natalChart.ascendant?.sign },
              ].map(({ label, sign }) => (
                <div
                  key={label}
                  className="card-glass rounded-xl p-4 flex flex-col items-center gap-1.5 text-center"
                >
                  <span className="text-2xl">
                    {sign ? (SIGN_GLYPHS[sign] ?? "✦") : "✦"}
                  </span>
                  <span className="text-white font-medium text-sm">{sign ?? "—"}</span>
                  <span className="text-white/40 text-xs uppercase tracking-widest">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archetype */}
        {archetypeLabel && archetypeDesc && (
          <div className="mb-10 card-glass rounded-2xl p-6 text-center">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
              Libra Archetype
            </p>
            <p className="font-serif text-gold-400 text-lg mb-2">{archetypeLabel}</p>
            <p className="text-white/60 text-sm italic mb-4">{archetypeDesc.tagline}</p>
            <p className="text-white/50 text-sm leading-relaxed">{archetypeDesc.description}</p>
            {archetypeDesc.traits.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {archetypeDesc.traits.map((trait) => (
                  <span
                    key={trait}
                    className="text-xs px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-white/50 text-sm">Discover your own cosmic profile</p>
          <Link
            href="/signup"
            className="inline-block bg-gold-500 hover:bg-gold-400 text-obsidian font-semibold text-sm px-8 py-3 rounded-xl transition-colors shadow-glow-gold"
          >
            Create your free account →
          </Link>
          <p className="text-white/30 text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-gold-400/70 hover:text-gold-400 underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-16 tracking-wide">
          The Daily Libra · Your chart. Your balance. ⚖
        </p>
      </div>
    </div>
  );
}
