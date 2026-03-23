import { createClient } from "@/lib/supabase/server";
import { ARCHETYPE_LABELS, MODIFIER_LABELS } from "@/types";
import { ARCHETYPE_DESCRIPTIONS } from "@/lib/astrology/archetypes";
import { AESTHETIC_PROFILES } from "@/lib/aesthetic/profiles";
import type { LibraArchetype, ArchetypeModifier, AestheticStyle, NatalChart } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: userData }, { data: libraProfile }, { data: birthProfile }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user!.id).single(),
    supabase.from("libra_profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("birth_profiles").select("*").eq("user_id", user!.id).single(),
  ]);

  const chart = birthProfile?.natal_chart_json as NatalChart | null;
  const archetype = libraProfile?.primary_archetype as LibraArchetype | null;
  const modifier = libraProfile?.secondary_modifier as ArchetypeModifier | null;
  const aestheticStyle = libraProfile?.aesthetic_style as AestheticStyle | null;
  const archetypeData = archetype ? ARCHETYPE_DESCRIPTIONS[archetype] : null;
  const aestheticProfile = aestheticStyle ? AESTHETIC_PROFILES[aestheticStyle] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="font-serif text-display-xs text-foreground">My Libra Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your evolving identity map.</p>
      </div>

      {/* Archetype section */}
      {archetype && archetypeData && (
        <div className="glass-card p-7 border-gold/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                Primary Archetype
              </p>
              <h2 className="font-serif text-display-xs text-gold-gradient">
                {ARCHETYPE_LABELS[archetype]}
              </h2>
              {modifier && (
                <p className="text-sm text-gold/50 mt-1">+ {MODIFIER_LABELS[modifier]}</p>
              )}
            </div>
            <span className="font-serif text-4xl">⚖</span>
          </div>

          <p className="font-serif text-base italic text-foreground/80 mb-4">
            &ldquo;{archetypeData.tagline}&rdquo;
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {archetypeData.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {archetypeData.traits.map((trait) => (
              <span
                key={trait}
                className="text-xs px-3 py-1 rounded-full border border-white/[0.08] text-muted-foreground"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Aesthetic style */}
      {aestheticProfile ? (
        <div className={`glass-card p-6 border ${aestheticProfile.accentClass}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                Aesthetic Identity
              </p>
              <h2 className="font-serif text-xl text-foreground">{aestheticProfile.name}</h2>
              <p className="text-xs text-foreground/50 italic mt-0.5">&ldquo;{aestheticProfile.tagline}&rdquo;</p>
            </div>
            <span className="text-2xl">{aestheticProfile.icon}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {aestheticProfile.traits.map((trait) => (
              <span
                key={trait}
                className="text-xs px-2.5 py-1 rounded-full border border-white/[0.07] text-muted-foreground"
              >
                {trait}
              </span>
            ))}
          </div>
          <Link
            href="/aesthetic"
            className="text-xs text-muted-foreground/50 hover:text-gold/70 transition-colors"
          >
            Retake quiz →
          </Link>
        </div>
      ) : (
        <div className="glass-card p-6 border border-dashed border-white/[0.06]">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Aesthetic Identity
          </p>
          <p className="text-sm text-muted-foreground/60 mb-4">
            You haven&apos;t discovered your aesthetic profile yet.
          </p>
          <Link
            href="/aesthetic"
            className="inline-flex items-center gap-1.5 text-sm text-gold/70 hover:text-gold transition-colors"
          >
            Discover your aesthetic ✦
          </Link>
        </div>
      )}

      {/* Chart summary */}
      {chart && (
        <div className="glass-card p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
            Natal Chart
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Sun", value: chart.sun?.sign, house: chart.sun?.house, icon: "☀️" },
              { label: "Moon", value: chart.moon?.sign, house: chart.moon?.house, icon: "🌙" },
              { label: "Rising", value: chart.ascendant?.sign, icon: "↑" },
              { label: "Venus", value: chart.venus?.sign, house: chart.venus?.house, icon: "♀" },
              { label: "Mars", value: chart.mars?.sign, house: chart.mars?.house, icon: "♂" },
              {
                label: "Mercury",
                value: chart.mercury?.sign,
                house: chart.mercury?.house,
                icon: "☿",
              },
            ].map(({ label, value, house, icon }) => (
              <div
                key={label}
                className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <span>{icon}</span> {label}
                </p>
                <p className="text-sm text-foreground font-medium">{value ?? "—"}</p>
                {house && <p className="text-xs text-muted-foreground/50">House {house}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Birth info */}
      {birthProfile && (
        <div className="glass-card p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Birth Data</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="text-foreground/80">{formatDate(birthProfile.birth_date)}</span>
            </div>
            {birthProfile.birth_time && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground/80">{birthProfile.birth_time}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="text-foreground/80">
                {birthProfile.birth_city}, {birthProfile.birth_country}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* User preferences */}
      {userData && (
        <div className="glass-card p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
            Preferences
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reading tone</span>
              <span className="text-foreground/80 capitalize">{userData.tone_preference}</span>
            </div>
            {userData.pronouns && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pronouns</span>
                <span className="text-foreground/80">{userData.pronouns}</span>
              </div>
            )}
            {(userData.goals?.length ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Focus areas</span>
                <span className="text-foreground/80">{userData.goals?.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
