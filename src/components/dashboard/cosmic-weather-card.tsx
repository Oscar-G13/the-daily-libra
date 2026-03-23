"use client";

import { motion } from "framer-motion";
import type { TransitSnapshot } from "@/lib/astrology/transits";
import { SIGN_ELEMENTS } from "@/lib/astrology/transits";

const ELEMENT_COLORS = {
  fire: "text-orange-400",
  earth: "text-emerald-400",
  air: "text-sky-400",
  water: "text-blue-400",
};

const PLANET_ORDER = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

interface CosmicWeatherCardProps {
  transits: TransitSnapshot;
}

export function CosmicWeatherCard({ transits }: CosmicWeatherCardProps) {
  const keyPlanets = transits.planets.filter((p) => PLANET_ORDER.includes(p.planet));
  const topAspects = transits.aspects.slice(0, 3);
  const retrogrades = transits.planets.filter((p) => p.retrograde);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Cosmic Weather</p>
          <p className="font-serif text-base text-foreground">Today&apos;s Planetary Field</p>
        </div>
        <span className="text-2xl">🌌</span>
      </div>

      {/* Planet grid */}
      <div className="grid grid-cols-4 gap-2">
        {keyPlanets.map((p, i) => {
          const element = SIGN_ELEMENTS[p.sign];
          return (
            <motion.div
              key={p.planet}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]"
            >
              <span className="text-base">{p.symbol}</span>
              <span className={`text-[10px] font-medium ${ELEMENT_COLORS[element]}`}>{p.sign}</span>
              {p.retrograde && (
                <span className="text-[9px] text-rose-400/80 bg-rose-400/10 px-1 rounded">Rx</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Key aspects */}
      {topAspects.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Key Aspects</p>
          {topAspects.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={a.isHarmonious ? "text-gold/60" : "text-rose-400/60"}>
                {a.isHarmonious ? "◈" : "✕"}
              </span>
              <span className="text-foreground/70">
                {a.planet1}{" "}
                <span className={a.isHarmonious ? "text-gold/80" : "text-rose-400/80"}>
                  {a.type}
                </span>{" "}
                {a.planet2}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Retrograde warning */}
      {retrogrades.length > 0 && (
        <div className="flex items-center gap-2 text-xs bg-rose-400/5 border border-rose-400/10 rounded-lg px-3 py-2">
          <span className="text-rose-400">↺</span>
          <span className="text-foreground/60">
            {retrogrades.map((p) => p.planet).join(", ")} retrograde — review, don&apos;t rush
          </span>
        </div>
      )}
    </motion.div>
  );
}
