"use client";

import { motion } from "framer-motion";
import type { HarmonyResult } from "@/lib/astrology/harmony";

interface HarmonyScoreCardProps {
  harmony: HarmonyResult;
}

function BalanceScale({ score }: { score: number }) {
  // score 0–100, 50 = balanced
  const tilt = ((score - 50) / 50) * 18; // max 18deg tilt

  return (
    <svg width="64" height="52" viewBox="0 0 64 52">
      {/* Pole */}
      <line x1="32" y1="6" x2="32" y2="46" stroke="rgba(201,168,76,0.3)" strokeWidth="1.5" />

      {/* Beam — rotates based on score */}
      <g transform={`rotate(${-tilt}, 32, 16)`}>
        <line x1="6" y1="16" x2="58" y2="16" stroke="rgba(201,168,76,0.6)" strokeWidth="1.5" />

        {/* Left pan */}
        <line x1="12" y1="16" x2="12" y2="26" stroke="rgba(201,168,76,0.4)" strokeWidth="1" />
        <ellipse
          cx="12"
          cy="28"
          rx="8"
          ry="3"
          fill="rgba(201,168,76,0.15)"
          stroke="rgba(201,168,76,0.3)"
          strokeWidth="1"
        />

        {/* Right pan */}
        <line x1="52" y1="16" x2="52" y2="26" stroke="rgba(201,168,76,0.4)" strokeWidth="1" />
        <ellipse
          cx="52"
          cy="28"
          rx="8"
          ry="3"
          fill="rgba(201,168,76,0.15)"
          stroke="rgba(201,168,76,0.3)"
          strokeWidth="1"
        />
      </g>

      {/* Center pin */}
      <circle cx="32" cy="6" r="2.5" fill="rgba(201,168,76,0.5)" />
    </svg>
  );
}

function ScoreDial({ score }: { score: number }) {
  const r = 36;
  const circumference = Math.PI * r; // semicircle
  const progress = (score / 100) * circumference;

  // Color interpolation: rose (low) → gold (high)
  const color = score >= 55 ? "#C9A84C" : "#f87171";

  return (
    <svg width="100" height="58" viewBox="0 0 100 58">
      {/* Track */}
      <path
        d="M 10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Progress */}
      <path
        d="M 10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        style={{ filter: score >= 70 ? `drop-shadow(0 0 6px ${color}80)` : undefined }}
      />
      {/* Score text */}
      <text x="50" y="45" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
        {score}
      </text>
    </svg>
  );
}

export function HarmonyScoreCard({ harmony }: HarmonyScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Harmony Score</p>
          <p className={`font-serif text-lg leading-tight ${harmony.color}`}>{harmony.label}</p>
        </div>
        <BalanceScale score={harmony.score} />
      </div>

      {/* Dial */}
      <div className="flex items-center justify-center">
        <ScoreDial score={harmony.score} />
      </div>

      {/* Factor bars */}
      <div className="space-y-2">
        {[
          { label: "Moon Phase", value: harmony.factors.moonPhaseScore, max: 20 },
          { label: "Venus Energy", value: harmony.factors.venusScore, max: 20 },
          { label: "Your Mood", value: harmony.factors.moodScore, max: 20 },
          { label: "Streak", value: harmony.factors.streakScore, max: 20 },
          { label: "Archetype", value: harmony.factors.archetypeScore, max: 20 },
        ].map((f, i) => (
          <div key={f.label} className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="text-foreground/60">
                {f.value}/{f.max}
              </span>
            </div>
            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(f.value / f.max) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-gold/40 to-gold/70 rounded-full"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="space-y-2 pt-1">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          What&apos;s shaping today
        </p>
        {harmony.insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex gap-2 text-xs text-foreground/70 leading-relaxed"
          >
            <span className="text-gold/50 mt-0.5 shrink-0">◈</span>
            <span>{insight}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
