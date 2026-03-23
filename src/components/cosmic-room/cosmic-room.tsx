"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AESTHETIC_PROFILES } from "@/lib/aesthetic/profiles";
import type { AestheticStyle } from "@/types";
import { ARCHETYPE_LABELS } from "@/types";
import type { LibraArchetype } from "@/types";

interface CosmicItem {
  id: string;
  memory_type: string;
  content: string;
  created_at: string;
}

interface RoomProfile {
  archetype: string | null;
  aestheticStyle: string | null;
  displayName: string | null;
}

const TYPE_ICONS: Record<string, string> = {
  cosmic_quote: "✦",
  cosmic_reading: "🔮",
  cosmic_affirmation: "🌙",
  cosmic_insight: "💫",
};

const TYPE_LABELS: Record<string, string> = {
  cosmic_quote: "Quote",
  cosmic_reading: "Reading",
  cosmic_affirmation: "Affirmation",
  cosmic_insight: "Insight",
};

// Ambient visuals per aesthetic style
const ROOM_ATMOSPHERE: Record<
  AestheticStyle,
  { bg: string; glow: string; particles: string[] }
> = {
  soft_luxe: {
    bg: "from-rose-950/20 via-obsidian to-amber-950/10",
    glow: "bg-rose-400/5",
    particles: ["🕯", "🌹", "✨", "🪞", "💛"],
  },
  dark_romance: {
    bg: "from-purple-950/30 via-obsidian to-slate-950/20",
    glow: "bg-purple-500/5",
    particles: ["🌑", "🥀", "🕸", "⛓", "🖤"],
  },
  celestial_editorial: {
    bg: "from-violet-950/25 via-obsidian to-indigo-950/15",
    glow: "bg-violet-500/5",
    particles: ["✦", "🌌", "💎", "⭐", "🔮"],
  },
  clean_goddess: {
    bg: "from-emerald-950/15 via-obsidian to-stone-950/10",
    glow: "bg-emerald-400/4",
    particles: ["🌿", "🤍", "✿", "🌱", "💫"],
  },
  velvet_minimalism: {
    bg: "from-zinc-900/30 via-obsidian to-slate-900/20",
    glow: "bg-zinc-400/4",
    particles: ["◼", "▪", "✦", "—", "∙"],
  },
  modern_venus: {
    bg: "from-amber-950/20 via-obsidian to-rose-950/10",
    glow: "bg-amber-400/5",
    particles: ["♀", "✨", "🌟", "💄", "🪙"],
  },
};

const DEFAULT_ATMOSPHERE = {
  bg: "from-violet-950/15 via-obsidian to-obsidian",
  glow: "bg-gold/4",
  particles: ["✦", "⚖", "🌙", "💫", "✨"],
};

function FloatingParticles({ particles }: { particles: string[] }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-xs opacity-10 select-none"
          style={{
            left: `${15 + i * 18 + Math.sin(i) * 8}%`,
            top: `${10 + i * 15 + Math.cos(i) * 12}%`,
          }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.06, 0.14, 0.06],
          }}
          transition={{
            duration: 4 + i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        >
          {p}
        </motion.span>
      ))}
    </div>
  );
}

function AddToRoomButton({
  content,
  type,
  onSaved,
}: {
  content: string;
  type: "quote" | "insight" | "affirmation";
  onSaved?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (saving || saved) return;
    setSaving(true);
    try {
      await fetch("/api/cosmic-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content }),
      });
      setSaved(true);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={save}
      disabled={saving || saved}
      className="text-xs px-3 py-1.5 rounded-lg border border-white/[0.06] text-muted-foreground/50 hover:text-gold/70 hover:border-gold/15 transition-all disabled:opacity-50"
    >
      {saved ? "✦ Added to Room" : saving ? "Adding…" : "+ Add to Room"}
    </button>
  );
}

export { AddToRoomButton };

export function CosmicRoom() {
  const [items, setItems] = useState<CosmicItem[]>([]);
  const [profile, setProfile] = useState<RoomProfile | null>(null);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newQuote, setNewQuote] = useState("");
  const [addingQuote, setAddingQuote] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const aesthetic = profile?.aestheticStyle as AestheticStyle | null;
  const atmosphere = aesthetic ? ROOM_ATMOSPHERE[aesthetic] ?? DEFAULT_ATMOSPHERE : DEFAULT_ATMOSPHERE;
  const aestheticProfile = aesthetic ? AESTHETIC_PROFILES[aesthetic] : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cosmic-room?affirmation=true");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
        setProfile(data.profile ?? null);
        setAffirmation(data.affirmation ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveQuote() {
    if (!newQuote.trim() || addingQuote) return;
    setAddingQuote(true);
    try {
      const res = await fetch("/api/cosmic-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quote", content: newQuote.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [data.item, ...prev]);
        setNewQuote("");
      }
    } finally {
      setAddingQuote(false);
    }
  }

  async function deleteItem(id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/cosmic-room", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const quotes = items.filter((i) => i.memory_type === "cosmic_quote");
  const readings = items.filter((i) => i.memory_type === "cosmic_reading");
  const affirmations = items.filter((i) => i.memory_type === "cosmic_affirmation");
  const insights = items.filter((i) => i.memory_type === "cosmic_insight");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-muted-foreground/50"
        >
          Opening your room…
        </motion.p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-display-sm text-foreground">Cosmic Room</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your private sanctuary. Saved readings, quotes, and moments — all in one place.
        </p>
      </div>

      {/* Hero atmosphere card */}
      <div
        className={`relative glass-card p-8 overflow-hidden bg-gradient-to-br ${atmosphere.bg} min-h-[180px]`}
      >
        <div className={`absolute inset-0 ${atmosphere.glow} blur-3xl`} />
        <FloatingParticles particles={atmosphere.particles} />
        <div className="relative z-10 space-y-3">
          {profile?.displayName && (
            <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">
              {profile.displayName}&apos;s Room
            </p>
          )}
          {aestheticProfile && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{aestheticProfile.icon}</span>
              <span className="text-sm text-foreground/60">{aestheticProfile.name}</span>
            </div>
          )}
          {profile?.archetype && (
            <p className="text-xs text-muted-foreground/40">
              {ARCHETYPE_LABELS[profile.archetype as LibraArchetype] ?? profile.archetype}
            </p>
          )}

          {/* Daily affirmation */}
          {affirmation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 pt-4 border-t border-white/[0.05]"
            >
              <p className="text-xs text-gold/40 uppercase tracking-widest mb-2">
                Today&apos;s affirmation
              </p>
              <p className="font-serif text-base italic text-foreground/80 leading-relaxed">
                &ldquo;{affirmation}&rdquo;
              </p>
              <div className="mt-2">
                <AddToRoomButton
                  content={affirmation}
                  type="affirmation"
                  onSaved={load}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add a quote */}
      <div className="glass-card p-5 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Add a quote or thought
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveQuote()}
            placeholder="Something that resonated today…"
            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-gold/20 transition-colors"
          />
          <button
            onClick={saveQuote}
            disabled={!newQuote.trim() || addingQuote}
            className="px-4 py-2.5 rounded-lg bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-all disabled:opacity-40"
          >
            {addingQuote ? "…" : "Save ✦"}
          </button>
        </div>
      </div>

      {/* Saved sections */}
      {items.length === 0 ? (
        <div className="glass-card p-8 text-center space-y-3">
          <p className="text-2xl">✦</p>
          <p className="text-sm text-muted-foreground/60">Your room is empty.</p>
          <p className="text-xs text-muted-foreground/40">
            Save readings, quotes, and insights here as you move through the app.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {[
            { label: "Affirmations", data: affirmations },
            { label: "Saved Readings", data: readings },
            { label: "Quotes", data: quotes },
            { label: "Insights", data: insights },
          ]
            .filter(({ data }) => data.length > 0)
            .map(({ label, data }) => (
              <div key={label} className="space-y-3">
                <p className="text-xs text-muted-foreground/50 uppercase tracking-widest px-1">
                  {label}
                </p>
                <div className="space-y-2">
                  <AnimatePresence>
                    {data.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="glass-card p-4 group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-sm mt-0.5 opacity-50">
                            {TYPE_ICONS[item.memory_type] ?? "✦"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                              {item.content}
                            </p>
                            <p className="text-xs text-muted-foreground/30 mt-2">
                              {new Date(item.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                              {" · "}
                              {TYPE_LABELS[item.memory_type] ?? "Note"}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteItem(item.id)}
                            disabled={deletingId === item.id}
                            className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground/30 hover:text-red-400/60 transition-all shrink-0"
                          >
                            ×
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
