"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Rarity = "common" | "uncommon" | "rare" | "ultra_rare" | "legendary";
type CardType = "transit" | "archetype" | "milestone" | "event" | "blessing";

interface CosmicCard {
  card_key: string;
  card_name: string;
  card_type: CardType;
  rarity: Rarity;
  description: string | null;
  emoji: string;
  unlock_condition: string | null;
  available_until: string | null;
  owned: boolean;
  earned_at: string | null;
}

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; glow: string; border: string }> = {
  common:     { label: "Common",     color: "text-foreground/60",  glow: "",                                   border: "border-white/[0.06]" },
  uncommon:   { label: "Uncommon",   color: "text-blue-300/80",    glow: "",                                   border: "border-blue-400/20" },
  rare:       { label: "Rare",       color: "text-violet-300/90",  glow: "shadow-violet-500/20",               border: "border-violet-400/30" },
  ultra_rare: { label: "Ultra Rare", color: "text-gold",           glow: "shadow-gold/20",                     border: "border-gold/30" },
  legendary:  { label: "Legendary",  color: "text-gold-gradient",  glow: "shadow-gold/40 shadow-lg",           border: "border-gold/50" },
};

const TYPE_FILTERS: Array<{ value: CardType | "all"; label: string }> = [
  { value: "all",       label: "All" },
  { value: "archetype", label: "Archetype" },
  { value: "milestone", label: "Milestone" },
  { value: "event",     label: "Event" },
  { value: "blessing",  label: "Blessing" },
];

export function CollectionGrid() {
  const [cards, setCards] = useState<CosmicCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CardType | "all">("all");
  const [showOwned, setShowOwned] = useState<"all" | "owned" | "locked">("all");
  const [selected, setSelected] = useState<CosmicCard | null>(null);
  const [totalOwned, setTotalOwned] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    fetch("/api/collection")
      .then((r) => r.json())
      .then((data) => {
        setCards(data.cards ?? []);
        setTotalOwned(data.totalOwned ?? 0);
        setTotalCards(data.totalCards ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = cards.filter((c) => {
    if (filter !== "all" && c.card_type !== filter) return false;
    if (showOwned === "owned" && !c.owned) return false;
    if (showOwned === "locked" && c.owned) return false;
    return true;
  });

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="font-serif text-2xl text-gold-gradient">{totalOwned}</p>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">Owned</p>
          </div>
          <span className="text-muted-foreground/20">/</span>
          <div className="text-center">
            <p className="font-serif text-2xl text-foreground/40">{totalCards}</p>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">Total</p>
          </div>
        </div>
        {totalCards > 0 && (
          <div className="w-24">
            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gold/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(totalOwned / totalCards) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5 text-right">
              {Math.round((totalOwned / totalCards) * 100)}% collected
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
              filter === f.value
                ? "border-gold/30 bg-gold/10 text-gold-200"
                : "border-white/[0.06] text-muted-foreground/50 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {(["all", "owned", "locked"] as const).map((o) => (
            <button
              key={o}
              onClick={() => setShowOwned(o)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all capitalize ${
                showOwned === o
                  ? "border-gold/30 bg-gold/10 text-gold-200"
                  : "border-white/[0.06] text-muted-foreground/50 hover:text-foreground"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Card grid */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((card, idx) => {
            const config = RARITY_CONFIG[card.rarity];
            return (
              <motion.button
                key={card.card_key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.2 }}
                onClick={() => setSelected(card)}
                className={`aspect-[3/4] rounded-xl border p-3 flex flex-col items-center justify-between text-center transition-all group relative overflow-hidden ${
                  card.owned
                    ? `${config.border} bg-white/[0.03] hover:bg-white/[0.05] ${config.glow}`
                    : "border-white/[0.04] bg-white/[0.01] opacity-40 hover:opacity-60"
                }`}
              >
                {/* Rarity shimmer for rare+ */}
                {card.owned && (card.rarity === "ultra_rare" || card.rarity === "legendary") && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5 pointer-events-none" />
                )}

                <div className="space-y-1.5 mt-2">
                  <span className="text-3xl">{card.emoji}</span>
                  <p className={`text-[10px] font-medium uppercase tracking-widest ${config.color}`}>
                    {config.label}
                  </p>
                </div>

                <div className="space-y-1 pb-1">
                  <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">
                    {card.card_name}
                  </p>
                  {!card.owned && (
                    <p className="text-[9px] text-muted-foreground/30 uppercase tracking-wide">Locked</p>
                  )}
                  {card.owned && card.earned_at && (
                    <p className="text-[9px] text-muted-foreground/30">
                      {new Date(card.earned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground/50 text-center py-10">
          No cards match this filter.
        </p>
      )}

      {/* Card detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`glass-card border ${RARITY_CONFIG[selected.rarity].border} p-6 max-w-xs w-full text-center shadow-2xl`}
            >
              <span className="text-5xl mb-3 block">{selected.emoji}</span>
              <p className={`text-xs uppercase tracking-widest font-medium mb-1 ${RARITY_CONFIG[selected.rarity].color}`}>
                {RARITY_CONFIG[selected.rarity].label} · {selected.card_type}
              </p>
              <h3 className="font-serif text-lg text-foreground mb-3">{selected.card_name}</h3>
              {selected.description && (
                <p className="text-xs text-muted-foreground/70 leading-relaxed mb-4">{selected.description}</p>
              )}
              {selected.owned ? (
                <p className="text-[10px] text-gold/40">
                  Earned {selected.earned_at ? new Date(selected.earned_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground/30">Not yet earned</p>
              )}
              <button
                onClick={() => setSelected(null)}
                className="mt-4 text-xs text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
