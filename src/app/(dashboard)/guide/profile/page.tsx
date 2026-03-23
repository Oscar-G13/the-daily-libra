"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GUIDE_PROFILE_LAYOUT_OPTIONS,
  GUIDE_PROFILE_THEME_OPTIONS,
  type GuideProfileLayout,
  type GuideProfileTheme,
} from "@/lib/guide/profile-options";

const SPECIALTY_OPTIONS = [
  "tarot",
  "natal charts",
  "transit readings",
  "solar returns",
  "relationship astrology",
  "vocational astrology",
  "synastry",
  "progressions",
  "spiritual guidance",
  "shadow work",
];

export default function GuideProfilePage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [publicEnabled, setPublicEnabled] = useState(true);
  const [profileTheme, setProfileTheme] = useState<GuideProfileTheme>("gold");
  const [profileLayout, setProfileLayout] = useState<GuideProfileLayout>("editorial");
  const [welcomeHeadline, setWelcomeHeadline] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/guide");
    const data = await res.json();
    if (data.guide) {
      setBusinessName(data.guide.business_name ?? "");
      setTagline(data.guide.tagline ?? "");
      setBio(data.guide.bio ?? "");
      setWebsite(data.guide.website_url ?? "");
      setSpecialties(data.guide.specialties ?? []);
      setPublicEnabled(data.guide.public_enabled ?? true);
      setProfileTheme((data.guide.profile_theme ?? "gold") as GuideProfileTheme);
      setProfileLayout((data.guide.profile_layout ?? "editorial") as GuideProfileLayout);
      setWelcomeHeadline(data.guide.welcome_headline ?? "");
      setCtaLabel(data.guide.cta_label ?? "");
    }
    setReferralCode(data.guide_user?.referral_code ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleSpecialty(s: string) {
    setSpecialties((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/guide/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: businessName || null,
        tagline: tagline || null,
        bio: bio || null,
        website_url: website || null,
        specialties,
        public_enabled: publicEnabled,
        profile_theme: profileTheme,
        profile_layout: profileLayout,
        welcome_headline: welcomeHeadline || null,
        cta_label: ctaLabel || null,
      }),
    });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  const publicHref = referralCode ? `/guides/${referralCode}` : null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-display-xs text-foreground">Studio Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This is what clients and the public see when they open your guide page.
        </p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="rounded-2xl border border-gold/10 bg-gold/[0.04] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gold/60">Public Studio</p>
              <p className="mt-1 text-sm text-foreground/80">
                Buyers can view your profile like a mini website, then create an account or sign in
                to access their client inbox.
              </p>
            </div>
            {publicHref && publicEnabled ? (
              <Link
                href={publicHref}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-2 text-xs font-medium text-gold-100 transition-all hover:bg-gold/[0.14]"
              >
                Preview Public Page
              </Link>
            ) : publicHref ? (
              <span className="shrink-0 rounded-full border border-white/[0.08] px-4 py-2 text-xs text-muted-foreground/70">
                Public Page Hidden
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Public Profile
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Turn your public seller page on or off without affecting existing client invites.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPublicEnabled((value) => !value)}
              className={`relative h-7 w-12 rounded-full border transition-colors ${
                publicEnabled
                  ? "border-gold/30 bg-gold/[0.16]"
                  : "border-white/[0.08] bg-white/[0.04]"
              }`}
              aria-pressed={publicEnabled}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  publicEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Business / Studio Name
          </label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Luna Rising Readings"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/40 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Personalized readings for your highest path"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/40 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="A brief introduction to your practice..."
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/40 text-sm resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Website <span className="text-muted-foreground/30">(optional)</span>
          </label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://your-site.com"
            type="url"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/40 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Specialties
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpecialty(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  specialties.includes(s)
                    ? "bg-gold/[0.1] border-gold/30 text-gold/80"
                    : "border-white/[0.08] text-muted-foreground/50 hover:border-gold/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Welcome Headline
          </label>
          <input
            value={welcomeHeadline}
            onChange={(e) => setWelcomeHeadline(e.target.value)}
            placeholder="e.g. Private astrology for clients who want depth, not fluff"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/40 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Primary Button Label
          </label>
          <input
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="e.g. Enter My Client Portal"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/40 text-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Theme</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {GUIDE_PROFILE_THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setProfileTheme(option.value)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  profileTheme === option.value
                    ? "border-gold/30 bg-gold/[0.08]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-gold/20"
                }`}
              >
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground/70">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Layout</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {GUIDE_PROFILE_LAYOUT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setProfileLayout(option.value)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  profileLayout === option.value
                    ? "border-gold/30 bg-gold/[0.08]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-gold/20"
                }`}
              >
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground/70">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saved ? "Saved ✓" : saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
