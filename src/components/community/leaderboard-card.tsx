"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { LeaderboardEntry } from "@/app/api/leaderboard/route";

type LBType = "streak" | "weekly_xp" | "journal_count";

const TYPE_CONFIG: Record<LBType, { label: string; icon: string; unit: string }> = {
  streak:        { label: "App Streak",    icon: "🔥", unit: "days"    },
  weekly_xp:     { label: "Weekly XP",     icon: "✦",  unit: "XP"      },
  journal_count: { label: "Journal (month)", icon: "📖", unit: "entries" },
};

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export function LeaderboardCard() {
  const [type, setType] = useState<LBType>("weekly_xp");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?type=${type}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setLabel(data.label ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  const config = TYPE_CONFIG[type];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Rankings</p>
          <p className="text-sm font-medium text-foreground">{label || config.label}</p>
        </div>
        <span className="text-lg">{config.icon}</span>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1.5 mb-4">
        {(Object.keys(TYPE_CONFIG) as LBType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
              type === t
                ? "border-gold/30 bg-gold/10 text-gold-200"
                : "border-white/[0.06] text-muted-foreground/50 hover:text-foreground hover:border-white/10"
            }`}
          >
            {TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-white/[0.02] rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <p className="text-xs text-muted-foreground/50 text-center py-3">
            No data yet — be the first to lead!
          </p>
        )}

        {!loading && entries.map((entry, idx) => (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              entry.is_current_user
                ? "bg-gold/[0.06] border border-gold/10"
                : "hover:bg-white/[0.02]"
            }`}
          >
            {/* Rank */}
            <span className="text-sm w-5 flex-shrink-0 text-center">
              {idx < 3 ? RANK_ICONS[idx] : <span className="text-xs text-muted-foreground/40">{entry.rank}</span>}
            </span>

            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {entry.avatar_url ? (
                <Image src={entry.avatar_url} alt={entry.display_name} width={24} height={24} className="object-cover" />
              ) : (
                <span className="text-[10px] text-gold/50">♎</span>
              )}
            </div>

            {/* Name */}
            <span className={`flex-1 text-xs truncate ${entry.is_current_user ? "text-gold-200 font-medium" : "text-foreground/80"}`}>
              {entry.is_current_user ? `${entry.display_name} (you)` : entry.display_name}
            </span>

            {/* Value */}
            <span className="text-xs text-muted-foreground/60 flex-shrink-0">
              {entry.value.toLocaleString()} <span className="text-[10px] opacity-50">{config.unit}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
