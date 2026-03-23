"use client";

import { motion } from "framer-motion";

interface MoodEntry {
  log_date: string;
  mood_score: number | null;
}

interface MoodTrendCardProps {
  logs: MoodEntry[];
}

function moodLabel(avg: number): { label: string; color: string } {
  if (avg >= 8) return { label: "Elevated", color: "text-emerald-400" };
  if (avg >= 6) return { label: "Steady", color: "text-gold/80" };
  if (avg >= 4) return { label: "Neutral", color: "text-foreground/60" };
  return { label: "Low", color: "text-rose-400/80" };
}

function Sparkline({ values }: { values: (number | null)[] }) {
  const h = 36;
  const w = 120;
  const filled = values.filter((v): v is number => v !== null);
  if (filled.length < 2) return null;

  const min = Math.min(...filled);
  const max = Math.max(...filled);
  const range = max - min || 1;
  const step = w / (values.length - 1);

  const points = values
    .map((v, i) => {
      if (v === null) return null;
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="rgba(196,160,90,0.5)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* End dot */}
      {(() => {
        const lastIdx = values.map((v, i) => (v !== null ? i : -1)).filter((i) => i >= 0).pop();
        if (lastIdx === undefined) return null;
        const v = values[lastIdx]!;
        const x = lastIdx * step;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return <circle cx={x} cy={y} r="2.5" fill="#c4a05a" />;
      })()}
    </svg>
  );
}

export function MoodTrendCard({ logs }: MoodTrendCardProps) {
  // Build 7-day window (today backwards)
  const today = new Date();
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const logMap = new Map(logs.map((l) => [l.log_date, l.mood_score]));
  const week = days7.map((d) => logMap.get(d) ?? null);
  const weekFilled = week.filter((v): v is number => v !== null);

  const prev7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });
  const prevFilled = prev7.map((d) => logMap.get(d) ?? null).filter((v): v is number => v !== null);

  const thisAvg = weekFilled.length
    ? Math.round(weekFilled.reduce((a, b) => a + b, 0) / weekFilled.length)
    : null;
  const prevAvg = prevFilled.length
    ? Math.round(prevFilled.reduce((a, b) => a + b, 0) / prevFilled.length)
    : null;

  const delta = thisAvg !== null && prevAvg !== null ? thisAvg - prevAvg : null;
  const { label, color } = thisAvg !== null ? moodLabel(thisAvg) : { label: "—", color: "" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card p-5 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Mood This Week</p>
          <p className={`font-serif text-lg leading-tight ${color}`}>{label}</p>
        </div>
        <Sparkline values={week} />
      </div>

      <div className="flex gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Avg score</p>
          <p className="text-sm text-foreground/80 font-medium">{thisAvg ?? "—"}/10</p>
        </div>
        {delta !== null && (
          <div>
            <p className="text-xs text-muted-foreground">vs last week</p>
            <p
              className={`text-sm font-medium ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400/80" : "text-foreground/50"}`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Entries</p>
          <p className="text-sm text-foreground/80 font-medium">{weekFilled.length}/7</p>
        </div>
      </div>

      {weekFilled.length === 0 && (
        <p className="text-xs text-muted-foreground">Log your mood daily to see trends here.</p>
      )}
    </motion.div>
  );
}
