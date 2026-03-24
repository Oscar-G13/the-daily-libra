import { createClient } from "@/lib/supabase/server";
import { ARCHETYPE_LABELS, MODIFIER_LABELS } from "@/types";
import { ARCHETYPE_DESCRIPTIONS } from "@/lib/astrology/archetypes";
import { AESTHETIC_PROFILES } from "@/lib/aesthetic/profiles";
import type { LibraArchetype, ArchetypeModifier, AestheticStyle, NatalChart } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShareProfileButton } from "@/components/profile/share-profile-button";

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

  // Fetch recruiter/guide — check referred_by first, then fall back to guide_client_connections
  const referredBy = (userData as any)?.referred_by as string | null;
  const inviterRemoved = (userData as any)?.inviter_removed as boolean ?? false;
  let recruiterId: string | null = referredBy && !inviterRemoved ? referredBy : null;

  // If referred_by not set, check for an active guide connection (came via invite token)
  if (!recruiterId) {
    const { data: conn } = await (supabase as any)
      .from("guide_client_connections")
      .select("guide_id")
      .eq("client_user_id", user!.id)
      .eq("status", "active")
      .order("accepted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (conn?.guide_id) recruiterId = conn.guide_id;
  }

  let referrer: {
    display_name: string | null;
    avatar_url: string | null;
    referral_code: string | null;
    subscription_tier: string | null;
  } | null = null;
  let referrerGuideProfile: {
    business_name: string | null;
    tagline: string | null;
    guide_role: string | null;
  } | null = null;

  if (recruiterId) {
    const { data } = await (supabase as any)
      .from("users")
      .select("display_name, avatar_url, referral_code, subscription_tier")
      .eq("id", recruiterId)
      .single();
    referrer = data;

    if (referrer?.subscription_tier === "high_priestess") {
      const { data: gp } = await (supabase as any)
        .from("guide_profiles")
        .select("business_name, tagline, guide_role")
        .eq("id", recruiterId)
        .maybeSingle();
      referrerGuideProfile = gp;
    }
  }

  const chart = birthProfile?.natal_chart_json as NatalChart | null;
  const archetype = libraProfile?.primary_archetype as LibraArchetype | null;
  const modifier = libraProfile?.secondary_modifier as ArchetypeModifier | null;
  const aestheticStyle = libraProfile?.aesthetic_style as AestheticStyle | null;
  const archetypeData = archetype ? ARCHETYPE_DESCRIPTIONS[archetype] : null;
  const aestheticProfile = aestheticStyle ? AESTHETIC_PROFILES[aestheticStyle] : null;

  const avatarUrl = (userData as any)?.avatar_url as string | null;
  const bio = (userData as any)?.profile_bio as string | null;
  const shareToken = (userData as any)?.share_token as string | null;
  const isAdmin = (userData as any)?.is_admin as boolean | null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Identity header */}
      <div className="flex items-center gap-5">
        <div className="shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={userData?.display_name ?? ""}
              className="w-16 h-16 rounded-full object-cover border-2 border-gold/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gold/[0.06] border-2 border-gold/15 flex items-center justify-center text-2xl">
              ♎
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-display-xs text-foreground">
              {userData?.display_name ?? "My Libra Profile"}
            </h1>
            {isAdmin && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold/15 text-gold-200 border border-gold/30 font-bold tracking-wide">
                ADMIN
              </span>
            )}
          </div>
          {bio ? (
            <p className="text-sm text-muted-foreground/70 mt-1 leading-relaxed">{bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Your evolving identity map.</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            <Link href="/settings" className="text-xs text-muted-foreground/30 hover:text-gold/50 transition-colors">
              Edit profile →
            </Link>
            {shareToken && (
              <>
                <span className="text-muted-foreground/20">·</span>
                <ShareProfileButton shareToken={shareToken} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Guide / Invited by badge */}
      {referrer && (() => {
        const isGuide = referrer.subscription_tier === "high_priestess";
        const guideName = referrerGuideProfile?.business_name ?? referrer.display_name ?? "A fellow Libra";
        const guideRole = referrerGuideProfile?.guide_role;
        const roleLabel = guideRole === "high_priest" ? "High Priest" : "High Priestess";

        return (
          <div className={`glass-card px-5 py-4 flex items-center gap-3 border ${isGuide ? "border-violet-500/25 bg-violet-500/[0.04]" : "border-gold/10"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 ${isGuide ? "bg-violet-500/10 border border-violet-500/20" : "bg-gold/10 border border-gold/20"}`}>
              {isGuide ? "🌙" : "♎"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                {isGuide ? `Your ${roleLabel}` : "Invited by"}
              </p>
              {referrer.referral_code ? (
                <Link
                  href={isGuide ? `/guides/${referrer.referral_code}` : `/join/${referrer.referral_code}`}
                  className={`text-sm font-medium transition-colors ${isGuide ? "text-violet-200 hover:text-violet-100" : "text-gold/70 hover:text-gold"}`}
                >
                  {guideName}
                </Link>
              ) : (
                <p className="text-sm text-foreground/80 font-medium">{guideName}</p>
              )}
              {isGuide && referrerGuideProfile?.tagline && (
                <p className="text-xs text-violet-300/50 mt-0.5 truncate">{referrerGuideProfile.tagline}</p>
              )}
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border shrink-0 ${isGuide ? "bg-violet-500/[0.08] text-violet-400 border-violet-500/20" : "bg-gold/[0.08] text-gold/60 border-gold/10"}`}>
              {isGuide ? "🌙 Guide" : "✦ Invited"}
            </span>
          </div>
        );
      })()}

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
