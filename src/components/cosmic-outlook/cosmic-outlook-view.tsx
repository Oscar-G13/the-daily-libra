"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { WeeklyOutlook } from "@/app/api/cosmic-outlook/route";

const HIGHLIGHT_CONFIG = {
  best_window: { label: "Best Window", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  challenge:   { label: "Navigate Carefully", color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20"    },
  neutral:     { label: "Steady Flow",        color: "text-gold/70",     bg: "bg-gold/5",         border: "border-gold/15"         },
};

function EnergyBar({ score, animate = true }: { score: number; animate?: boolean }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? "bg-emerald-400/70" : score <= 4 ? "bg-rose-400/60" : "bg-gold/50";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={animate ? { duration: 0.8, ease: "easeOut" } : { duration: 0 }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground/50 w-4 text-right">{score}</span>
    </div>
  );
}

interface Props {
  isPremium: boolean;
}

export function CosmicOutlookView({ isPremium }: Props) {
  const [weeks, setWeeks] = useState<WeeklyOutlook[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(isPremium ? 30 : 7);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/cosmic-outlook?days=${days}`)
      .then((r) => r.json())
      .then((data) => setWeeks(data.weeks ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="space-y-4">
      {/* Range selector — premium only */}
      {isPremium && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground/50 mr-2">Forecast range:</p>
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                days === d
                  ? "border-gold/30 bg-gold/10 text-gold-200"
                  : "border-white/[0.06] text-muted-foreground hover:border-gold/20 hover:text-foreground"
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-3 bg-white/[0.04] rounded w-32 mb-2" />
              <div className="h-2 bg-white/[0.03] rounded w-full mb-1" />
              <div className="h-2 bg-white/[0.03] rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!loading && weeks.length === 0 && (
        <p className="text-sm text-muted-foreground/50 text-center py-8">
          Could not load cosmic forecast. Try again shortly.
        </p>
      )}

      {!loading && weeks.map((week, idx) => {
        const config = HIGHLIGHT_CONFIG[week.highlight_type];
        const isExpanded = expandedWeek === week.week_start;
        const isCurrentWeek = idx === 0;

        return (
          <motion.div
            key={week.week_start}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <button
              onClick={() => setExpandedWeek(isExpanded ? null : week.week_start)}
              className="w-full glass-card p-4 text-left hover:border-white/[0.08] transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Energy score column */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 w-8">
                  <span className="font-serif text-lg text-foreground/80">{week.energy_score}</span>
                  <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest">XP</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-medium text-foreground">{week.week_label}</span>
                    {isCurrentWeek && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold-200 border border-gold/20">
                        This week
                      </span>
                    )}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                      {config.label}
                    </span>
                  </div>

                  <EnergyBar score={week.energy_score} animate={idx < 5} />

                  {/* Moon phases */}
                  {week.moon_phases.length > 0 && (
                    <div className="flex gap-2 mt-1.5">
                      {week.moon_phases.map((mp) => (
                        <span key={mp.date} className="text-[10px] text-muted-foreground/40">
                          {mp.phase === "New Moon" ? "🌑" : mp.phase === "Full Moon" ? "🌕" : mp.phase === "First Quarter" ? "🌓" : "🌗"}
                          {" "}{mp.phase}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-muted-foreground/30 text-xs flex-shrink-0 mt-1">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-2"
              >
                <div className={`border-x border-b ${config.border} rounded-b-xl px-4 pb-4 pt-3 bg-white/[0.01] space-y-3`}>
                  <p className="text-sm text-foreground/80 leading-relaxed">{week.transit_summary}</p>

                  {week.retrogrades.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-400/70">☿ Retrograde:</span>
                      <span className="text-xs text-muted-foreground">{week.retrogrades.join(", ")}</span>
                    </div>
                  )}

                  {week.key_transit && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gold/50">Key transit:</span>
                      <span className="text-xs text-muted-foreground">{week.key_transit}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Upgrade prompt for free users */}
      {!isPremium && weeks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-5 text-center border-gold/10"
        >
          <p className="text-sm text-muted-foreground mb-3">
            See your full 90-day cosmic forecast — best windows, retrograde periods, and eclipse seasons.
          </p>
          <a
            href="/subscription"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold-200 hover:text-gold transition-colors"
          >
            Upgrade to Premium ✦
          </a>
        </motion.div>
      )}
    </div>
  );
}
