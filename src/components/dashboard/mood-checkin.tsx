"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGamification } from "@/components/gamification/provider";
import type { GamificationResult } from "@/types";

const MOODS = [
  { value: 10, label: "Radiant", emoji: "✨" },
  { value: 8, label: "Good", emoji: "🌸" },
  { value: 6, label: "Okay", emoji: "☁️" },
  { value: 4, label: "Low", emoji: "🌑" },
  { value: 2, label: "Hard", emoji: "🌊" },
];

interface MoodCheckinProps {
  userId: string;
  todaysMood: Record<string, number | string | null> | null;
}

export function MoodCheckin({ userId: _userId, todaysMood }: MoodCheckinProps) {
  const [saved, setSaved] = useState(!!todaysMood);
  const [selected, setSelected] = useState<number | null>(
    todaysMood ? (todaysMood.mood_score as number) : null
  );
  const [saving, setSaving] = useState(false);
  const { handleGamificationResult } = useGamification();

  async function saveMood(score: number) {
    setSelected(score);
    setSaving(true);

    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood_score: score }),
      });
      const data = await res.json();
      setSaved(true);
      if (data.gamification) {
        handleGamificationResult(data.gamification as GamificationResult);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Today&apos;s Energy
        </p>
        <span className="text-lg">🎚️</span>
      </div>

      {saved && selected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center py-4"
        >
          <span className="text-3xl mb-2">
            {MOODS.find((m) => m.value === selected)?.emoji ?? "✦"}
          </span>
          <p className="text-sm text-foreground/80">
            {MOODS.find((m) => m.value === selected)?.label ?? "Noted"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Logged for today</p>
        </motion.div>
      ) : (
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            How are you feeling right now?
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => saveMood(mood.value)}
                disabled={saving}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-white/[0.06] hover:border-gold/20 hover:bg-gold/5 transition-all group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {mood.emoji}
                </span>
                <span className="text-[10px] text-muted-foreground">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
