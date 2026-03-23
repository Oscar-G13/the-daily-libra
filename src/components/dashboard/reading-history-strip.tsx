"use client";

import { motion } from "framer-motion";

interface ReadingEntry {
  id: string;
  category: string;
  tone: string;
  reading_date: string;
  output_text: string;
}

interface ReadingHistoryStripProps {
  readings: ReadingEntry[];
}

const CATEGORY_LABELS: Record<string, string> = {
  daily: "Daily",
  love: "Love",
  shadow: "Shadow",
  career: "Career",
  lunar: "Lunar",
  ritual: "Ritual",
  reflection: "Reflection",
};

const CATEGORY_COLOR: Record<string, string> = {
  daily: "text-gold/80 border-gold/25 bg-gold/8",
  love: "text-rose-300/80 border-rose-400/25 bg-rose-400/8",
  shadow: "text-purple-300/80 border-purple-400/25 bg-purple-400/8",
  career: "text-blue-300/80 border-blue-400/25 bg-blue-400/8",
  lunar: "text-foreground/60 border-white/15 bg-white/5",
  ritual: "text-emerald-300/80 border-emerald-400/25 bg-emerald-400/8",
  reflection: "text-foreground/60 border-white/15 bg-white/5",
};

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ReadingHistoryStrip({ readings }: ReadingHistoryStripProps) {
  if (readings.length === 0) {
    return (
      <div className="glass-card p-5">
        <p className="text-xs text-gold/50 uppercase tracking-widest mb-2">Reading History</p>
        <p className="text-xs text-muted-foreground">
          Your readings will appear here. Generate your first daily reading above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gold/50 uppercase tracking-widest">Reading History</p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {readings.map((reading, i) => {
          const colorClass =
            CATEGORY_COLOR[reading.category] ?? "text-foreground/60 border-white/15 bg-white/5";
          const excerpt = reading.output_text.slice(0, 80).trim();
          const label = CATEGORY_LABELS[reading.category] ?? reading.category;

          return (
            <motion.div
              key={reading.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.08 }}
              className="flex-shrink-0 w-52 glass-card p-4 space-y-2 cursor-default"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${colorClass}`}
                >
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatShortDate(reading.reading_date)}
                </span>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">
                {excerpt}
                {reading.output_text.length > 80 ? "…" : ""}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">{reading.tone}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
