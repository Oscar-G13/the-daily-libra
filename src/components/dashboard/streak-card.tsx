"use client";

import { motion } from "framer-motion";

interface StreakCardProps {
  appStreak: number;
  journalStreak: number;
  activeDays: string[]; // ISO date strings of days user was active (last 7 days)
}

export function StreakCard({ appStreak, journalStreak, activeDays }: StreakCardProps) {
  // Build last-7-days dot grid
  const today = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const activeSet = new Set(activeDays);
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-5 space-y-4"
    >
      <p className="text-xs text-gold/50 uppercase tracking-widest">Streaks</p>

      <div className="flex gap-6">
        <div>
          <div className="flex items-end gap-1.5">
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
              className="font-serif text-4xl text-gold-gradient leading-none"
            >
              {appStreak}
            </motion.span>
            <span className="text-xs text-muted-foreground mb-1">day streak</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">App visits</p>
        </div>

        {journalStreak > 0 && (
          <div>
            <div className="flex items-end gap-1.5">
              <span className="font-serif text-4xl text-foreground/60 leading-none">
                {journalStreak}
              </span>
              <span className="text-xs text-muted-foreground mb-1">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Journal streak</p>
          </div>
        )}
      </div>

      {/* 7-day activity dots */}
      <div className="flex gap-2">
        {last7.map((dateStr, i) => {
          const isActive = activeSet.has(dateStr);
          const dow = new Date(dateStr + "T12:00:00").getDay();
          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isActive
                    ? "bg-gold/20 border border-gold/40 text-gold/80"
                    : "bg-white/[0.04] border border-white/[0.08] text-foreground/20"
                }`}
              >
                {isActive ? "✦" : "·"}
              </motion.div>
              <span className="text-[9px] text-muted-foreground">{dayLabels[dow]}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
