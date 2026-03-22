"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { TONE_LABELS } from "@/types";
import type { ReadingTone } from "@/types";

const TONES: ReadingTone[] = ["gentle", "blunt", "poetic", "practical", "seductive"];

export default function SettingsPage() {
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [tone, setTone] = useState<ReadingTone>("gentle");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("display_name, pronouns, tone_preference")
        .eq("id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name ?? "");
        setPronouns(data.pronouns ?? "");
        setTone((data.tone_preference as ReadingTone) ?? "gentle");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("users")
      .update({ display_name: displayName, pronouns, tone_preference: tone })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-display-xs text-foreground mb-6">Settings</h1>

        <div className="space-y-6">
          <div className="glass-card p-6 space-y-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Profile</p>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Display Name
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-gold/40 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Pronouns
              </label>
              <input
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-gold/40 transition-colors text-sm"
                placeholder="e.g. she/her"
              />
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
              Default Reading Tone
            </p>
            <div className="space-y-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                    tone === t
                      ? "border-gold/40 bg-gold/5 text-foreground"
                      : "border-white/[0.06] text-muted-foreground hover:border-white/10"
                  }`}
                >
                  {TONE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saved ? "Saved ✓" : saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
