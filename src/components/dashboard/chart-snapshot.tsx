import Link from "next/link";
import type { NatalChart } from "@/types";

interface ChartSnapshotProps {
  chart: NatalChart | null;
}

export function ChartSnapshot({ chart }: ChartSnapshotProps) {
  if (!chart) {
    return (
      <div className="glass-card p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          Chart Snapshot
        </p>
        <p className="text-sm text-muted-foreground/60">No chart data yet.</p>
      </div>
    );
  }

  const keyPlacements = [
    { label: "Sun", value: chart.sun?.sign, icon: "☀️" },
    { label: "Moon", value: chart.moon?.sign, icon: "🌙" },
    { label: "Rising", value: chart.ascendant?.sign, icon: "↑" },
    { label: "Venus", value: chart.venus?.sign, icon: "♀" },
    { label: "Mars", value: chart.mars?.sign, icon: "♂" },
  ];

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Chart Snapshot</p>
        <span className="text-lg">🌙</span>
      </div>

      <div className="space-y-2.5 flex-1">
        {keyPlacements.map(({ label, value, icon }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="text-base">{icon}</span>
              {label}
            </span>
            <span className="text-xs text-foreground/80 font-medium">{value ?? "—"}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04]">
        <Link href="/chart" className="text-xs text-gold/60 hover:text-gold transition-colors">
          Full chart breakdown →
        </Link>
      </div>
    </div>
  );
}
