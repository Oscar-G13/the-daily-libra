"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

// Moon phase algorithm — well-established J1 formula
function getMoonPhase(date: Date): { phase: number; name: string; emoji: string; libra: string } {
  const knownNew = new Date("2000-01-06T18:14:00Z");
  const synodicPeriod = 29.53058867;
  const elapsed = (date.getTime() - knownNew.getTime()) / (1000 * 60 * 60 * 24);
  const cycles = elapsed / synodicPeriod;
  const phase = ((cycles % 1) + 1) % 1; // 0–1, 0 = new moon, 0.5 = full

  let name: string;
  let emoji: string;
  let libra: string;

  if (phase < 0.03 || phase >= 0.97) {
    name = "New Moon";
    emoji = "🌑";
    libra =
      "Set intentions. The slate is clean — a perfect time to journal what you want to attract.";
  } else if (phase < 0.22) {
    name = "Waxing Crescent";
    emoji = "🌒";
    libra = "Plant seeds. Your desires are gaining momentum. Act on one small thing today.";
  } else if (phase < 0.28) {
    name = "First Quarter";
    emoji = "🌓";
    libra = "Take action. Tension is productive now — push through the resistance.";
  } else if (phase < 0.47) {
    name = "Waxing Gibbous";
    emoji = "🌔";
    libra = "Refine. You're close to clarity. Revisit what you started at the New Moon.";
  } else if (phase < 0.53) {
    name = "Full Moon";
    emoji = "🌕";
    libra =
      "Release and receive. Emotions peak. Libra energy asks: are your relationships in balance?";
  } else if (phase < 0.72) {
    name = "Waning Gibbous";
    emoji = "🌖";
    libra = "Share your wisdom. Gratitude unlocks the next cycle — what has arrived for you?";
  } else if (phase < 0.78) {
    name = "Last Quarter";
    emoji = "🌗";
    libra = "Let go. Forgiveness is a Libra superpower. Release what no longer serves balance.";
  } else {
    name = "Waning Crescent";
    emoji = "🌘";
    libra = "Rest and restore. Honor your need for stillness before the next New Moon begins.";
  }

  return { phase, name, emoji, libra };
}

function daysUntilNextPhase(date: Date, targetFrac: number): number {
  const knownNew = new Date("2000-01-06T18:14:00Z");
  const synodicPeriod = 29.53058867;
  const elapsed = (date.getTime() - knownNew.getTime()) / (1000 * 60 * 60 * 24);
  const currentFrac = (((elapsed / synodicPeriod) % 1) + 1) % 1;
  let diff = targetFrac - currentFrac;
  if (diff <= 0) diff += 1;
  return Math.round(diff * synodicPeriod);
}

// SVG moon shape: uses clip-path to render lit portion
function MoonSVG({ phase }: { phase: number }) {
  const size = 56;
  const cx = size / 2;
  const r = size / 2 - 2;

  // Compute lit side: 0 = new (dark), 0.5 = full (bright), 1 = new again
  // We render a circle + an ellipse overlay for the dark portion
  const isWaxing = phase < 0.5;
  const progress = isWaxing ? phase * 2 : (phase - 0.5) * 2; // 0→1 within each half

  // Ellipse x-radius for terminator line
  const termX = Math.abs(Math.cos(progress * Math.PI)) * r;

  // During waxing: right side lit, ellipse covers left → dark side shrinks
  // During waning: left side lit, ellipse covers right

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Dark base */}
      <circle cx={cx} cy={cx} r={r} fill="rgba(255,255,255,0.08)" />
      {/* Lit hemisphere */}
      <clipPath id="moon-clip">
        <circle cx={cx} cy={cx} r={r} />
      </clipPath>
      <g clipPath="url(#moon-clip)">
        {/* Gold lit half */}
        {isWaxing ? (
          <rect x={cx} y={0} width={r} height={size} fill="rgba(196,160,90,0.7)" />
        ) : (
          <rect x={0} y={0} width={cx} height={size} fill="rgba(196,160,90,0.7)" />
        )}
        {/* Ellipse shadow over lit half to create crescent */}
        <ellipse cx={cx} cy={cx} rx={termX} ry={r} fill="rgba(13,13,20,0.92)" />
      </g>
      {/* Rim glow */}
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(196,160,90,0.2)" strokeWidth="1" />
    </svg>
  );
}

export function MoonPhaseCard() {
  const { phase, name, libra } = useMemo(() => getMoonPhase(new Date()), []);
  const daysToFull = useMemo(() => daysUntilNextPhase(new Date(), 0.5), []);
  const daysToNew = useMemo(() => daysUntilNextPhase(new Date(), 0), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Moon Phase</p>
          <p className="font-serif text-lg text-foreground leading-tight">{name}</p>
        </div>
        <MoonSVG phase={phase} />
      </div>

      <p className="text-xs text-foreground/65 leading-relaxed">{libra}</p>

      <div className="flex gap-4 pt-1">
        <div>
          <p className="text-xs text-muted-foreground">Full Moon</p>
          <p className="text-sm text-gold/80 font-medium">
            {daysToFull === 0 ? "Tonight" : `${daysToFull}d`}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">New Moon</p>
          <p className="text-sm text-gold/80 font-medium">
            {daysToNew === 0 ? "Tonight" : `${daysToNew}d`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
