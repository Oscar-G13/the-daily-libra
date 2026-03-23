"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { TrophyRoom } from "@/components/gamification/trophy-room";
import type { AchievementStatus, TrophyStatus } from "@/types";
import { ACHIEVEMENTS } from "@/lib/gamification/achievements";

// Category labels + icons
const CATEGORY_META = {
  explorer: { label: "Explorer", icon: "🗺️" },
  ritual: { label: "Ritual", icon: "🕯️" },
  emotional: { label: "Emotional", icon: "🌊" },
  cosmic: { label: "Cosmic", icon: "🌌" },
  libra: { label: "Libra", icon: "♎" },
};

type Category = keyof typeof CATEGORY_META | "all";

interface Props {
  achievements: AchievementStatus[];
  trophies: TrophyStatus[];
}

export function AchievementsStrip({ achievements, trophies }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const total = ACHIEVEMENTS.length;

  const filtered =
    activeCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Achievements</p>
          <p className="font-serif text-lg text-foreground leading-tight">
            {unlockedCount} / {total} Unlocked
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unlockedCount === total && (
            <span className="text-xs text-gold/60 italic">All earned ✦</span>
          )}
          {/* Trophy Room button */}
          <TrophyRoom trophies={trophies}>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gold/[0.08] border border-gold/20 text-gold/80 hover:bg-gold/15 hover:border-gold/30 transition-all">
              🏆 Trophy Room
            </button>
          </TrophyRoom>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        <CategoryTab
          label="All"
          icon="✦"
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
          count={achievements.filter((a) => a.unlocked).length}
          total={achievements.length}
        />
        {(
          Object.entries(CATEGORY_META) as [
            Category,
            (typeof CATEGORY_META)[keyof typeof CATEGORY_META],
          ][]
        ).map(([cat, meta]) => {
          const catAchs = achievements.filter((a) => a.category === cat);
          return (
            <CategoryTab
              key={cat}
              label={meta.label}
              icon={meta.icon}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              count={catAchs.filter((a) => a.unlocked).length}
              total={catAchs.length}
            />
          );
        })}
      </div>

      {/* Achievement grid */}
      <div className="flex flex-wrap gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((badge, i) => (
            <AchievementBadge
              key={badge.id}
              badge={badge}
              index={i}
              hovered={hoveredId === badge.id}
              onHover={(id) => setHoveredId(id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Category Tab ─────────────────────────────────────────────────────────────

function CategoryTab({
  label,
  icon,
  active,
  onClick,
  count,
  total,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  count: number;
  total: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
        active
          ? "bg-gold/10 border border-gold/25 text-gold/80"
          : "bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span className={`text-[9px] ${active ? "text-gold/60" : "text-muted-foreground/50"}`}>
        {count}/{total}
      </span>
    </button>
  );
}

// ─── Achievement Badge ────────────────────────────────────────────────────────

function AchievementBadge({
  badge,
  index,
  hovered,
  onHover,
}: {
  badge: AchievementStatus;
  index: number;
  hovered: boolean;
  onHover: (id: string | null) => void;
}) {
  const progress = badge.progress;
  const pct = progress ? progress.current / progress.required : badge.unlocked ? 1 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{
        delay: index * 0.04,
        duration: 0.3,
        type: "spring",
        damping: 16,
        stiffness: 280,
      }}
      onHoverStart={() => onHover(badge.id)}
      onHoverEnd={() => onHover(null)}
      className="relative flex flex-col items-center gap-1.5 w-[68px] cursor-default select-none"
    >
      {/* Badge circle */}
      <motion.div
        whileHover={{ scale: badge.unlocked ? 1.12 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", damping: 14, stiffness: 300 }}
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl relative overflow-hidden transition-colors ${
          badge.unlocked
            ? "bg-gold/10 border border-gold/25 shadow-[0_0_12px_rgba(201,168,76,0.15)]"
            : "bg-white/[0.03] border border-white/[0.06]"
        }`}
      >
        {/* Unlock glow */}
        {badge.unlocked && (
          <div className="absolute inset-0 bg-gradient-to-b from-gold/10 to-transparent pointer-events-none" />
        )}
        <span className={badge.unlocked ? "" : "grayscale opacity-30"}>
          {badge.unlocked ? badge.icon : "🔒"}
        </span>
      </motion.div>

      {/* Progress ring (for locked) */}
      {!badge.unlocked && progress && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl pointer-events-none"
          style={{
            background: `conic-gradient(rgba(201,168,76,0.3) ${pct * 360}deg, transparent 0deg)`,
            mask: "radial-gradient(circle at center, transparent 68%, black 69%)",
            WebkitMask: "radial-gradient(circle at center, transparent 68%, black 69%)",
          }}
        />
      )}

      {/* Label */}
      <span
        className={`text-[9px] text-center leading-tight ${
          badge.unlocked ? "text-foreground/70" : "text-foreground/30"
        }`}
      >
        {badge.label}
      </span>

      {/* Progress text */}
      {!badge.unlocked && progress && (
        <span className="text-[8px] text-muted-foreground/40">
          {progress.current}/{progress.required}
        </span>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-40 pointer-events-none"
          >
            <div className="bg-charcoal border border-white/[0.08] rounded-lg px-3 py-2 shadow-xl">
              <p className="text-[10px] font-medium text-foreground mb-0.5">{badge.label}</p>
              <p className="text-[9px] text-muted-foreground leading-relaxed">
                {badge.description}
              </p>
              {badge.unlocked && <p className="text-[9px] text-gold/60 mt-1">✓ Unlocked</p>}
              {!badge.unlocked && progress && (
                <p className="text-[9px] text-muted-foreground/60 mt-1">
                  {progress.current} / {progress.required}
                </p>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-1 overflow-hidden">
              <div className="w-2 h-2 bg-charcoal border-r border-b border-white/[0.08] rotate-45 -mt-1 mx-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Full achievements modal ──────────────────────────────────────────────────

export function AchievementsModal({
  achievements,
  children,
}: {
  achievements: AchievementStatus[];
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed inset-4 sm:inset-12 z-50 bg-charcoal/95 border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.04]">
            <h2 className="font-serif text-display-xs text-foreground">All Achievements</h2>
            <Dialog.Close asChild>
              <button className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-muted-foreground hover:text-foreground text-sm">
                ✕
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {(
              Object.entries(CATEGORY_META) as [
                Category,
                (typeof CATEGORY_META)[keyof typeof CATEGORY_META],
              ][]
            ).map(([cat, meta]) => {
              const catAchs = achievements.filter((a) => a.category === cat);
              return (
                <div key={cat} className="mb-8">
                  <p className="text-xs text-gold/50 uppercase tracking-widest mb-4">
                    {meta.icon} {meta.label}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {catAchs.map((badge, i) => (
                      <AchievementBadge
                        key={badge.id}
                        badge={badge}
                        index={i}
                        hovered={false}
                        onHover={() => {}}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
