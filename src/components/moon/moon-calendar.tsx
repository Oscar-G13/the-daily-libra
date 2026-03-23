"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface MoonDay {
  date: Date;
  dateStr: string;
  phase: number;
  phaseName: string;
  emoji: string;
  isToday: boolean;
  isMajorPhase: boolean;
  libraNote: string;
}

const PHASE_DATA: Record<string, { emoji: string; libra: string }> = {
  "New Moon": {
    emoji: "🌑",
    libra:
      "Set bold intentions. The slate is clean. What relationship or project do you want to attract?",
  },
  "Waxing Crescent": {
    emoji: "🌒",
    libra: "Plant seeds. Momentum is building. Take one small action toward your desire today.",
  },
  "First Quarter": {
    emoji: "🌓",
    libra:
      "Push through resistance. Tension is productive — this is where Libra's indecision must give way to action.",
  },
  "Waxing Gibbous": {
    emoji: "🌔",
    libra:
      "Refine and adjust. You're so close to clarity. Revisit what you started at the New Moon.",
  },
  "Full Moon": {
    emoji: "🌕",
    libra:
      "Release and receive. Emotions peak. Libra asks: are your relationships truly in balance?",
  },
  "Waning Gibbous": {
    emoji: "🌖",
    libra:
      "Share your wisdom. Gratitude opens the next cycle. What has arrived that you're ready to appreciate?",
  },
  "Last Quarter": {
    emoji: "🌗",
    libra:
      "Let go with grace. Forgiveness is a Libra superpower. Release what no longer serves your equilibrium.",
  },
  "Waning Crescent": {
    emoji: "🌘",
    libra:
      "Rest and restore. Honor your need for stillness before the next New Moon renews the cycle.",
  },
};

function getMoonPhaseForDate(date: Date): { phase: number; name: string } {
  const knownNew = new Date("2000-01-06T18:14:00Z");
  const elapsed = (date.getTime() - knownNew.getTime()) / (1000 * 60 * 60 * 24);
  const cycles = elapsed / 29.53058867;
  const phase = ((cycles % 1) + 1) % 1;

  let name: string;
  if (phase < 0.03 || phase >= 0.97) name = "New Moon";
  else if (phase < 0.22) name = "Waxing Crescent";
  else if (phase < 0.28) name = "First Quarter";
  else if (phase < 0.47) name = "Waxing Gibbous";
  else if (phase < 0.53) name = "Full Moon";
  else if (phase < 0.72) name = "Waning Gibbous";
  else if (phase < 0.78) name = "Last Quarter";
  else name = "Waning Crescent";

  return { phase, name };
}

const MAJOR_PHASES = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"];

function MoonMiniSVG({ phase, id }: { phase: number; id: string }) {
  const size = 24;
  const cx = size / 2;
  const r = size / 2 - 2;
  const isWaxing = phase < 0.5;
  const progress = isWaxing ? phase * 2 : (phase - 0.5) * 2;
  const termX = Math.abs(Math.cos(progress * Math.PI)) * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="rgba(255,255,255,0.06)" />
      <clipPath id={id}>
        <circle cx={cx} cy={cx} r={r} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {isWaxing ? (
          <rect x={cx} y={0} width={r} height={size} fill="rgba(196,160,90,0.6)" />
        ) : (
          <rect x={0} y={0} width={cx} height={size} fill="rgba(196,160,90,0.6)" />
        )}
        <ellipse cx={cx} cy={cx} rx={termX} ry={r} fill="rgba(13,13,20,0.9)" />
      </g>
    </svg>
  );
}

export function MoonCalendar() {
  const days: MoonDay[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const { phase, name } = getMoonPhaseForDate(date);
      const phaseInfo = PHASE_DATA[name];

      return {
        date,
        dateStr,
        phase,
        phaseName: name,
        emoji: phaseInfo?.emoji ?? "🌑",
        isToday: dateStr === todayStr,
        isMajorPhase: MAJOR_PHASES.includes(name),
        libraNote: phaseInfo?.libra ?? "",
      };
    });
  }, []);

  const [selected, setSelected] = useState<MoonDay>(() => days.find((d) => d.isToday) ?? days[0]);

  return (
    <div className="space-y-6">
      {/* Selected day detail */}
      <motion.div
        key={selected.dateStr}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 space-y-4"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-3xl">
              {selected.emoji}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {selected.date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              {selected.isToday && (
                <span className="ml-2 text-[10px] bg-gold/10 text-gold/80 border border-gold/20 px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </p>
            <p className="font-serif text-xl text-foreground">{selected.phaseName}</p>
            <p className="text-sm text-foreground/65 leading-relaxed mt-2">{selected.libraNote}</p>
          </div>
        </div>

        {selected.isMajorPhase && (
          <div className="flex items-center gap-2 text-xs bg-gold/5 border border-gold/10 rounded-lg px-3 py-2">
            <span className="text-gold/60">✦</span>
            <span className="text-foreground/60">
              Major lunar phase — a powerful day for ritual and intention-setting.
            </span>
          </div>
        )}
      </motion.div>

      {/* 30-day grid */}
      <div className="glass-card p-4">
        <p className="text-xs text-gold/50 uppercase tracking-widest mb-4">30-Day Lunar View</p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
          {days.map((day, i) => (
            <motion.button
              key={day.dateStr}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelected(day)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                day.dateStr === selected.dateStr
                  ? "bg-gold/10 border border-gold/20"
                  : day.isToday
                    ? "bg-white/[0.06] border border-white/[0.1]"
                    : "bg-white/[0.02] border border-white/[0.04] hover:border-gold/10 hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-[10px] text-muted-foreground">
                {day.date.toLocaleDateString("en-US", { day: "numeric" })}
              </span>
              <MoonMiniSVG phase={day.phase} id={`mc-${day.dateStr}`} />
              {day.isMajorPhase && <span className="w-1 h-1 rounded-full bg-gold/60" />}
            </motion.button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/60" />
            <span className="text-[10px] text-muted-foreground">Major phase</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MoonMiniSVG phase={0} id="legend-new" />
            <span className="text-[10px] text-muted-foreground">New Moon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MoonMiniSVG phase={0.5} id="legend-full" />
            <span className="text-[10px] text-muted-foreground">Full Moon</span>
          </div>
        </div>
      </div>

      {/* Phase guide */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(PHASE_DATA).map(([name, { emoji }]) => (
          <div key={name} className="glass-card p-3 flex flex-col items-center gap-1 text-center">
            <span className="text-xl">{emoji}</span>
            <p className="text-xs text-foreground/70 font-medium">{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
