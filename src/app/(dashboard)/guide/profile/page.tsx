"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const SPECIALTY_OPTIONS = [
  "tarot", "natal charts", "transit readings", "solar returns",
  "relationship astrology", "vocational astrology", "synastry",
  "progressions", "spiritual guidance", "shadow work",
];

export default function GuideProfilePage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
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
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleSpecialty(s: string) {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
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
        {[1, 2, 3].map((i) => <div key={i} className="glass-card p-5 h-16 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-display-xs text-foreground">Studio Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This is what clients see on your invite page.
        </p>
      </div>

      <div className="glass-card p-6 space-y-5">
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
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Tagline
          </label>
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
