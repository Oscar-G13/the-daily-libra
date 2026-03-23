"use client";

import { motion } from "framer-motion";
import { useGamification } from "./provider";
import { getLevelDef, getLevelProgress, getXPForNextLevel } from "@/lib/gamification/levels";

interface Props {
  initialXP: number;
  initialLevel: number;
}

export function XPBar({ initialXP, initialLevel }: Props) {
  const { xpTotal, xpLevel } = useGamification();

  // Use live values from context (updated after XP awards)
  const xp = xpTotal || initialXP;
  const level = xpLevel || initialLevel;
  const progress = getLevelProgress(xp);
  const def = getLevelDef(level);
  const nextMin = getXPForNextLevel(level);
  const toNext = nextMin === Infinity ? 0 : nextMin - xp;
  const nearLevelUp = progress >= 0.9;

  return (
    <div className="px-5 py-3 border-b border-white/[0.04] space-y-2">
      {/* Level badge + name */}
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
            nearLevelUp
              ? "bg-gold/30 border border-gold/50 text-gold shadow-[0_0_8px_rgba(201,168,76,0.4)]"
              : "bg-gold/10 border border-gold/20 text-gold/80"
          }`}
        >
          {level}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground/80 truncate">{def.name}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            nearLevelUp
              ? "bg-gradient-to-r from-gold to-amber-300 shadow-[0_0_6px_rgba(201,168,76,0.6)]"
              : "bg-gradient-to-r from-gold/60 to-gold/40"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* XP label */}
      <p className="text-[10px] text-muted-foreground/60">
        {xp.toLocaleString()} XP
        {toNext > 0 && <span className="ml-1">· {toNext} to next level</span>}
        {toNext === 0 && <span className="ml-1 text-gold/60">· Max level ✦</span>}
      </p>
    </div>
  );
}
