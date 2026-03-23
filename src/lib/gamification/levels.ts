// ─────────────────────────────────────────────────────────────────────────────
//  Cosmic Level System — 20 levels
// ─────────────────────────────────────────────────────────────────────────────

export interface LevelDef {
  level: number;
  name: string;
  minXP: number;
}

export const LEVELS: LevelDef[] = [
  { level: 1, name: "Seeker", minXP: 0 },
  { level: 2, name: "Stargazer", minXP: 100 },
  { level: 3, name: "Lunar Initiate", minXP: 250 },
  { level: 4, name: "Celestial Wanderer", minXP: 500 },
  { level: 5, name: "Chart Reader", minXP: 850 },
  { level: 6, name: "Moon Keeper", minXP: 1300 },
  { level: 7, name: "Venus Touched", minXP: 1850 },
  { level: 8, name: "Balance Seeker", minXP: 2500 },
  { level: 9, name: "Shadow Worker", minXP: 3300 },
  { level: 10, name: "Astral Voyager", minXP: 4200 },
  { level: 11, name: "Cosmic Mirror", minXP: 5300 },
  { level: 12, name: "Sacred Scribe", minXP: 6600 },
  { level: 13, name: "Oracle Candidate", minXP: 8100 },
  { level: 14, name: "Archetype Bearer", minXP: 9800 },
  { level: 15, name: "Libra Mystic", minXP: 11700 },
  { level: 16, name: "Celestial Sage", minXP: 13800 },
  { level: 17, name: "Soul Weaver", minXP: 16200 },
  { level: 18, name: "Cosmic Oracle", minXP: 18900 },
  { level: 19, name: "Stellar Architect", minXP: 21900 },
  { level: 20, name: "Cosmic Architect", minXP: 25200 },
];

export const COSMIC_TIERS = [
  { minLevel: 1, maxLevel: 3, tier: "Seeker", color: "text-foreground/60" },
  { minLevel: 4, maxLevel: 6, tier: "Initiate", color: "text-blue-300/80" },
  { minLevel: 7, maxLevel: 9, tier: "Adept", color: "text-purple-300/80" },
  { minLevel: 10, maxLevel: 12, tier: "Oracle", color: "text-rose-300/80" },
  { minLevel: 13, maxLevel: 16, tier: "Sage", color: "text-gold/80" },
  { minLevel: 17, maxLevel: 20, tier: "Cosmic Architect", color: "text-gold-gradient" },
];

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (const def of LEVELS) {
    if (xp >= def.minXP) level = def.level;
    else break;
  }
  return level;
}

export function getLevelDef(level: number): LevelDef {
  return LEVELS[Math.min(level, LEVELS.length) - 1];
}

export function getXPForLevel(level: number): number {
  return LEVELS[Math.min(level, LEVELS.length) - 1].minXP;
}

export function getXPForNextLevel(level: number): number {
  if (level >= LEVELS.length) return Infinity;
  return LEVELS[level].minXP; // level is 1-indexed, so index = level (next level)
}

/** Returns 0–1 progress toward next level */
export function getLevelProgress(xp: number): number {
  const level = getLevelFromXP(xp);
  const currentMin = getXPForLevel(level);
  const nextMin = getXPForNextLevel(level);
  if (nextMin === Infinity) return 1;
  return Math.min((xp - currentMin) / (nextMin - currentMin), 1);
}

export function getCosmicTier(level: number) {
  return (
    COSMIC_TIERS.find((t) => level >= t.minLevel && level <= t.maxLevel) ??
    COSMIC_TIERS[COSMIC_TIERS.length - 1]
  );
}
