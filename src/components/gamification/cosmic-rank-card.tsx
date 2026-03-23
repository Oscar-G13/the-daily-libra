"use client";

import { motion } from "framer-motion";
import { useGamification } from "./provider";
import {
  getLevelDef,
  getLevelProgress,
  getXPForNextLevel,
  getCosmicTier,
} from "@/lib/gamification/levels";

interface Props {
  initialXP: number;
  initialLevel: number;
  weeklyXP: number;
  weeklyXPBest: number;
  appStreak: number;
  trophyCount: number;
  totalTrophies: number;
}

export function CosmicRankCard({
  initialXP,
  initialLevel,
  weeklyXP,
  weeklyXPBest,
  appStreak,
  trophyCount,
  totalTrophies,
}: Props) {
  const { xpTotal, xpLevel } = useGamification();

  const xp = xpTotal || initialXP;
  const level = xpLevel || initialLevel;
  const progress = getLevelProgress(xp);
  const def = getLevelDef(level);
  const cosmicTier = getCosmicTier(level);
  const nextXP = getXPForNextLevel(level);
  const toNext = nextXP === Infinity ? 0 : nextXP - xp;
  const weeklyPct = weeklyXPBest > 0 ? Math.min(weeklyXP / weeklyXPBest, 1) : 0;

  // Arc SVG for XP progress
  const r = 40;
  const cx = 50;
  const cy = 54;
  const circumference = Math.PI * r; // semicircle
  const arcOffset = circumference * (1 - progress);

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Cosmic Rank</p>
          <p className={`font-serif text-xl ${cosmicTier.color}`}>{cosmicTier.tier}</p>
        </div>
        {appStreak >= 7 && (
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-gold/70 text-lg"
          >
            ✦
          </motion.div>
        )}
      </div>

      {/* XP Arc */}
      <div className="flex items-center gap-5">
        <div className="relative w-[100px] h-[60px] flex-shrink-0">
          <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
            {/* Background arc */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <motion.path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: arcOffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
          {/* Level number in centre */}
          <div className="absolute inset-0 flex items-end justify-center pb-0">
            <span className="font-serif text-2xl text-gold-gradient leading-none">{level}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className="font-serif text-sm text-foreground">{def.name}</p>
          {toNext > 0 && (
            <p className="text-xs text-muted-foreground">
              {toNext.toLocaleString()} XP to level {level + 1}
            </p>
          )}
          <div className="flex gap-4 text-xs text-muted-foreground pt-1">
            <span>{xp.toLocaleString()} XP total</span>
            <span>
              {trophyCount}/{totalTrophies} trophies
            </span>
          </div>
        </div>
      </div>

      {/* Weekly XP */}
      <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">This week</span>
          <span className="text-foreground/70">{weeklyXP} XP</span>
        </div>
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold/50 to-gold/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${weeklyPct * 100}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          />
        </div>
        {weeklyXPBest > 0 && (
          <p className="text-[10px] text-muted-foreground/50">
            Personal best: {weeklyXPBest} XP/week
          </p>
        )}
      </div>

      {/* Streak reminder */}
      {appStreak > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-gold/60">🔥</span>
          <span>{appStreak}-day streak</span>
        </div>
      )}
    </div>
  );
}
