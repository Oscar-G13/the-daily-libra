"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DailyChallenge } from "@/lib/challenges/definitions";

interface ChallengeWithStatus extends DailyChallenge {
  completed: boolean;
}

export function DailyChallenges() {
  const [challenges, setChallenges] = useState<ChallengeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState<{ id: string; xp: number } | null>(null);

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((d) => {
        setChallenges(d.challenges ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function complete(id: string) {
    setCompleting(id);
    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: id }),
    });
    const data = await res.json();
    if (res.ok && !data.already_completed) {
      setXpEarned({ id, xp: data.xp });
      setTimeout(() => setXpEarned(null), 2500);
    }
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: true } : c))
    );
    setCompleting(null);
  }

  const completedCount = challenges.filter((c) => c.completed).length;

  if (loading) {
    return (
      <div className="glass-card p-6 space-y-4">
        <div className="h-4 w-32 rounded bg-white/[0.06] animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Daily Challenges
          </p>
          <p className="text-xs text-muted-foreground/50 mt-0.5">Reset at midnight</p>
        </div>
        <div className="flex items-center gap-1.5">
          {challenges.map((c, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                c.completed ? "bg-gold/70" : "bg-white/[0.12]"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {completedCount}/{challenges.length}
          </span>
        </div>
      </div>

      {completedCount === challenges.length && challenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-gold/[0.06] border border-gold/20 text-center"
        >
          <p className="text-xs text-gold/80">✦ All challenges complete for today</p>
        </motion.div>
      )}

      <div className="space-y-2">
        {challenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            layout
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all",
              challenge.completed
                ? "bg-white/[0.02] border-white/[0.04] opacity-60"
                : "bg-white/[0.03] border-white/[0.06] hover:border-gold/20"
            )}
          >
            <span className="text-xl shrink-0">{challenge.icon}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    challenge.completed ? "line-through text-muted-foreground/50" : "text-foreground/90"
                  )}
                >
                  {challenge.title}
                </p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/[0.08] text-gold/60 border border-gold/10 shrink-0">
                  +{challenge.xp} XP
                </span>
              </div>
              <p className="text-xs text-muted-foreground/50 mt-0.5 truncate">
                {challenge.description}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <AnimatePresence>
                {xpEarned?.id === challenge.id && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-gold font-medium"
                  >
                    +{xpEarned.xp} XP
                  </motion.span>
                )}
              </AnimatePresence>

              {challenge.completed ? (
                <span className="text-gold/70 text-base">✓</span>
              ) : (
                <div className="flex items-center gap-1.5">
                  {challenge.action && (
                    <Link
                      href={challenge.action.href}
                      className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] text-muted-foreground hover:border-gold/30 hover:text-gold/70 transition-all"
                    >
                      {challenge.action.label}
                    </Link>
                  )}
                  <button
                    onClick={() => complete(challenge.id)}
                    disabled={completing === challenge.id}
                    className="text-xs px-2.5 py-1 rounded-full bg-gold/[0.08] border border-gold/20 text-gold/70 hover:bg-gold/[0.15] hover:text-gold transition-all disabled:opacity-40"
                  >
                    {completing === challenge.id ? "..." : "Done"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
