"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import type { TrophyStatus, TrophyTier } from "@/types";
import { TROPHIES } from "@/lib/gamification/trophies";

const TIER_EMOJI: Record<TrophyTier, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
};

const TIER_GRADIENT: Record<TrophyTier, string> = {
  bronze: "from-amber-700/40 to-amber-900/20 border-amber-600/30",
  silver: "from-slate-400/30 to-slate-600/20 border-slate-400/30",
  gold: "from-gold/30 to-amber-600/20 border-gold/40",
  platinum: "from-purple-400/30 to-violet-600/20 border-purple-400/40",
};

type Filter = "all" | "earned" | "locked";

interface Props {
  trophies: TrophyStatus[];
  children: React.ReactNode;
}

export function TrophyRoom({ trophies, children }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<TrophyStatus | null>(null);

  const earnedCount = trophies.filter((t) => t.earnedTier).length;
  const filtered = trophies.filter((t) => {
    if (filter === "earned") return !!t.earnedTier;
    if (filter === "locked") return !t.earnedTier;
    return true;
  });

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="fixed inset-4 sm:inset-8 md:inset-12 z-50 bg-charcoal/95 border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.04] flex-shrink-0">
              <div>
                <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Trophy Room</p>
                <h2 className="font-serif text-display-xs text-foreground">
                  {earnedCount} / {TROPHIES.length} Trophies
                </h2>
              </div>
              <Dialog.Close asChild>
                <button className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-sm">
                  ✕
                </button>
              </Dialog.Close>
            </div>

            {/* Filter tabs */}
            <div className="px-6 py-3 flex gap-2 border-b border-white/[0.04] flex-shrink-0">
              {(["all", "earned", "locked"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                    filter === f
                      ? "bg-gold/10 border border-gold/25 text-gold/90"
                      : "bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Trophy grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((trophy, i) => (
                    <TrophyCard
                      key={trophy.id}
                      trophy={trophy}
                      index={i}
                      selected={selected?.id === trophy.id}
                      onClick={() => setSelected(selected?.id === trophy.id ? null : trophy)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 26, stiffness: 280 }}
                  className="border-t border-white/[0.04] bg-obsidian/60 p-6 flex-shrink-0"
                >
                  <TrophyDetail trophy={selected} onClose={() => setSelected(null)} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Trophy Card ──────────────────────────────────────────────────────────────

function TrophyCard({
  trophy,
  index,
  selected,
  onClick,
}: {
  trophy: TrophyStatus;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const earned = !!trophy.earnedTier;
  const tierGrad = earned ? TIER_GRADIENT[trophy.earnedTier!] : "";
  const progress =
    trophy.nextTierThreshold > 0
      ? Math.min(trophy.progress / trophy.nextTierThreshold, 1)
      : earned
        ? 1
        : 0;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
        earned
          ? `bg-gradient-to-b ${tierGrad} shadow-lg`
          : "bg-white/[0.02] border-white/[0.06] opacity-50 grayscale"
      } ${selected ? "ring-2 ring-gold/50" : ""}`}
    >
      {/* Tier badge */}
      {earned && (
        <div className="absolute -top-1.5 -right-1.5 text-sm">{TIER_EMOJI[trophy.earnedTier!]}</div>
      )}

      {/* Icon */}
      <div className="text-2xl">{earned ? trophy.icon : "🔒"}</div>

      {/* Label */}
      <p
        className={`text-[10px] font-medium leading-tight ${earned ? "text-foreground/90" : "text-foreground/40"}`}
      >
        {trophy.label}
      </p>

      {/* Progress bar */}
      {!earned && trophy.nextTierThreshold > 0 && (
        <div className="w-full h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-gold/40 rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {/* Progress text */}
      {!earned && (
        <p className="text-[9px] text-muted-foreground/50">
          {trophy.progress}/{trophy.nextTierThreshold}
        </p>
      )}
    </motion.button>
  );
}

// ─── Trophy Detail ────────────────────────────────────────────────────────────

function TrophyDetail({ trophy, onClose }: { trophy: TrophyStatus; onClose: () => void }) {
  const earned = !!trophy.earnedTier;

  return (
    <div className="flex items-start gap-5">
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
          earned
            ? `bg-gradient-to-b ${TIER_GRADIENT[trophy.earnedTier!]}`
            : "bg-white/[0.04] grayscale opacity-50"
        }`}
      >
        {earned ? trophy.icon : "🔒"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-serif text-lg text-foreground">{trophy.label}</h3>
          {earned && <span className="text-base">{TIER_EMOJI[trophy.earnedTier!]}</span>}
        </div>
        <p className="text-sm text-muted-foreground mb-3">{trophy.description}</p>

        {/* Tier progress */}
        <div className="flex gap-2 flex-wrap">
          {trophy.tiers.map((tier) => {
            const isEarned = trophy.earnedTier
              ? ["bronze", "silver", "gold", "platinum"].indexOf(trophy.earnedTier) >=
                ["bronze", "silver", "gold", "platinum"].indexOf(tier.tier)
              : false;
            return (
              <div
                key={tier.tier}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                  isEarned
                    ? "bg-gold/10 border-gold/25 text-gold/80"
                    : "bg-white/[0.03] border-white/[0.06] text-muted-foreground"
                }`}
              >
                {TIER_EMOJI[tier.tier]} {tier.label}
                {isEarned && " ✓"}
              </div>
            );
          })}
        </div>

        {!earned && trophy.nextTier && (
          <p className="text-xs text-muted-foreground/60 mt-2">
            Next: {trophy.nextTier} at {trophy.nextTierThreshold} — {trophy.progress} /{" "}
            {trophy.nextTierThreshold}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="text-muted-foreground/50 hover:text-foreground transition-colors text-sm flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
