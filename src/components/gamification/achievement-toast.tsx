"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AchievementStatus, TrophyDef, TrophyTier } from "@/types";

const TIER_EMOJI: Record<TrophyTier, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
};

interface ToastItem {
  id: number;
  achievement?: AchievementStatus;
  trophy?: { trophy: TrophyDef; tier: TrophyTier };
}

interface Props {
  item: ToastItem;
  onDismiss: () => void;
}

export function AchievementToast({ item, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [item.id, onDismiss]);

  const isTrophy = !!item.trophy;
  const icon = isTrophy ? item.trophy!.trophy.icon : item.achievement!.icon;
  const label = isTrophy
    ? `${TIER_EMOJI[item.trophy!.tier]} ${item.trophy!.trophy.label}`
    : item.achievement!.label;
  const sublabel = isTrophy ? `Trophy unlocked — ${item.trophy!.tier}` : "Achievement unlocked";
  const description = isTrophy ? item.trophy!.trophy.description : item.achievement!.description;

  return (
    <AnimatePresence>
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 280 }}
        onClick={onDismiss}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 cursor-pointer w-[320px] max-w-[90vw]"
      >
        <div className="glass-card border border-gold/20 p-4 flex items-center gap-4 shadow-2xl shadow-gold/10">
          {/* Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.15, damping: 12, stiffness: 300 }}
            className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-2xl flex-shrink-0"
          >
            {icon}
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gold/60 uppercase tracking-widest">{sublabel}</p>
            <p className="font-serif text-base text-foreground leading-tight mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
          </div>

          {/* Dismiss indicator */}
          <div className="text-muted-foreground/40 text-xs flex-shrink-0">✕</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
