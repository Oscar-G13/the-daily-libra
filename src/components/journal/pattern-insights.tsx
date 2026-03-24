"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryPattern {
  category: string;
  label: string;
  count: number;
}

interface TagPattern {
  value: string;
  count: number;
}

interface PatternsData {
  readingCount: number;
  journalCount: number;
  topCategories: CategoryPattern[];
  topMoodTags: TagPattern[];
  avgMood: number | null;
  moodTrend: "improving" | "declining" | "stable" | null;
  insights: string[];
  periodDays: number;
}

export function PatternInsights() {
  const [patterns, setPatterns] = useState<PatternsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || patterns) return;
    setLoading(true);
    fetch("/api/journal/patterns")
      .then((r) => r.json())
      .then((data) => setPatterns(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, patterns]);

  const moodTrendIcon = {
    improving: "↑",
    declining: "↓",
    stable: "→",
  };

  return (
    <div className="glass-card p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
            Cosmic Patterns
          </p>
          <p className="text-sm text-foreground/80">Your 30-day reflection</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">🔭</span>
          <span className="text-xs text-muted-foreground/50">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-4">
              {loading && (
                <p className="text-xs text-muted-foreground/50 animate-pulse text-center py-2">
                  Reading your patterns...
                </p>
              )}

              {patterns && !loading && (
                <>
                  {/* Stat row */}
                  <div className="flex gap-4 text-center">
                    <div className="flex-1 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <p className="font-serif text-lg text-gold-gradient">{patterns.journalCount}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">Journal entries</p>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <p className="font-serif text-lg text-gold-gradient">{patterns.readingCount}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">Readings</p>
                    </div>
                    {patterns.avgMood !== null && (
                      <div className="flex-1 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <p className="font-serif text-lg text-gold-gradient">
                          {patterns.avgMood}
                          {patterns.moodTrend && (
                            <span className={`text-sm ml-0.5 ${
                              patterns.moodTrend === "improving" ? "text-emerald-400" :
                              patterns.moodTrend === "declining" ? "text-rose-400" :
                              "text-gold/60"
                            }`}>
                              {moodTrendIcon[patterns.moodTrend]}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">Avg mood</p>
                      </div>
                    )}
                  </div>

                  {/* Top categories */}
                  {patterns.topCategories.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gold/40 uppercase tracking-widest mb-2">Most pulled readings</p>
                      <div className="space-y-1.5">
                        {patterns.topCategories.map((c) => (
                          <div key={c.category} className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gold/40 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(c.count / (patterns.topCategories[0]?.count ?? 1)) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-xs text-foreground/70 w-28 text-right">{c.label}</span>
                            <span className="text-[10px] text-muted-foreground/40 w-5 text-right">{c.count}×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top mood tags */}
                  {patterns.topMoodTags.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gold/40 uppercase tracking-widest mb-2">Recurring moods</p>
                      <div className="flex flex-wrap gap-1.5">
                        {patterns.topMoodTags.map((t) => (
                          <span
                            key={t.value}
                            className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-foreground/70"
                          >
                            {t.value} <span className="text-gold/40">{t.count}×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {patterns.insights.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gold/40 uppercase tracking-widest">Oracle reads your patterns</p>
                      {patterns.insights.map((insight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-2 text-xs text-foreground/70 leading-relaxed"
                        >
                          <span className="text-gold/30 flex-shrink-0 mt-0.5">✦</span>
                          <span>{insight}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {patterns.insights.length === 0 && patterns.journalCount < 3 && (
                    <p className="text-xs text-muted-foreground/50 text-center py-2">
                      Write a few more entries to unlock your pattern insights.
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export button — always visible */}
      <div className="mt-4 pt-3 border-t border-white/[0.04] flex justify-between items-center">
        <p className="text-[10px] text-muted-foreground/40">Export your Cosmic Story</p>
        <a
          href="/api/journal/export"
          download
          className="text-xs text-gold/60 hover:text-gold transition-colors"
        >
          Download ↓
        </a>
      </div>
    </div>
  );
}
