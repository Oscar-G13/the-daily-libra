"use client";

import { motion } from "framer-motion";
import type { VenusStatus } from "@/lib/astrology/venus";

interface VenusTrackerCardProps {
  venus: VenusStatus;
  houseInsight?: string;
}

function VenusSymbol({ retrograde }: { retrograde: boolean }) {
  return (
    <motion.div
      animate={
        retrograde
          ? { rotate: [0, -5, 5, -5, 0], scale: [1, 0.95, 1] }
          : { rotate: [0, 3, -3, 0], scale: [1, 1.04, 1] }
      }
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border ${
          retrograde ? "border-rose-400/30 bg-rose-400/5" : "border-gold/30 bg-gold/10"
        }`}
        style={retrograde ? undefined : { boxShadow: "0 0 20px rgba(201,168,76,0.2)" }}
      >
        ♀
      </div>
      {retrograde && (
        <span className="absolute -bottom-1 -right-1 text-[10px] bg-rose-400/20 text-rose-400 rounded-full px-1">
          Rx
        </span>
      )}
    </motion.div>
  );
}

function SignProgressBar({ daysIn, daysRemaining }: { daysIn: number; daysRemaining: number }) {
  const total = daysIn + daysRemaining;
  const progress = total > 0 ? daysIn / total : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{daysIn}d in sign</span>
        <span>{daysRemaining}d remaining</span>
      </div>
      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-gold/50 to-gold/80 rounded-full"
        />
      </div>
    </div>
  );
}

export function VenusTrackerCard({ venus, houseInsight }: VenusTrackerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Venus Tracker</p>
          <p className="font-serif text-lg text-foreground leading-tight">{venus.sign}</p>
          <p className="text-xs text-gold/60 mt-0.5">{venus.theme}</p>
        </div>
        <VenusSymbol retrograde={venus.retrograde} />
      </div>

      {/* Sign position */}
      <div className="text-xs text-foreground/70 leading-relaxed bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
        {venus.influence}
      </div>

      {/* Progress through sign */}
      <SignProgressBar daysIn={venus.daysInCurrentSign} daysRemaining={venus.daysRemainingInSign} />

      {/* House insight */}
      {houseInsight && (
        <div className="flex gap-2 text-xs text-foreground/60 leading-relaxed">
          <span className="text-gold/50 shrink-0 mt-0.5">♀</span>
          <span>{houseInsight}</span>
        </div>
      )}

      {/* Venus Return countdown */}
      {venus.venusReturnCountdown !== null && (
        <div className="flex items-center justify-between bg-gold/5 border border-gold/10 rounded-lg px-3 py-2">
          <div>
            <p className="text-xs text-muted-foreground">Venus Return</p>
            <p className="text-xs text-foreground/80 mt-0.5">
              Your ruling planet returns to its natal position
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium text-gold">{venus.venusReturnCountdown}</p>
            <p className="text-[10px] text-muted-foreground">days</p>
          </div>
        </div>
      )}

      {/* Retrograde alert */}
      {venus.retrograde && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 bg-rose-400/5 border border-rose-400/10 rounded-lg px-3 py-2 text-xs"
        >
          <span className="text-rose-400">↺</span>
          <span className="text-foreground/60">
            Venus retrograde — pause on big relationship decisions. Revisit what you value.
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
