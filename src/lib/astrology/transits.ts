// ─────────────────────────────────────────────────────────────────────────────
//  Transit Engine — current planetary positions + aspects
//  Uses the same simplified ephemeris as chart.ts
// ─────────────────────────────────────────────────────────────────────────────

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const SIGN_ELEMENTS: Record<ZodiacSign, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire",
  Taurus: "earth",
  Gemini: "air",
  Cancer: "water",
  Leo: "fire",
  Virgo: "earth",
  Libra: "air",
  Scorpio: "water",
  Sagittarius: "fire",
  Capricorn: "earth",
  Aquarius: "air",
  Pisces: "water",
};

export interface TransitPlanet {
  planet: string;
  sign: ZodiacSign;
  degree: number;
  longitude: number;
  retrograde: boolean;
  symbol: string;
}

export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  orb: number;
  isHarmonious: boolean;
}

export interface TransitSnapshot {
  date: Date;
  planets: TransitPlanet[];
  aspects: PlanetaryAspect[];
  moonPhase: number;
  moonSign: ZodiacSign;
  summary: string;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "⛢",
  Neptune: "♆",
  Pluto: "♇",
};

function toJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  return jdn + (hour - 12) / 24;
}

function longitudeToSign(longitude: number): { sign: ZodiacSign; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(normalized / 30);
  return { sign: ZODIAC_SIGNS[idx], degree: normalized % 30 };
}

function calcSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = (M * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  return (((L0 + C) % 360) + 360) % 360;
}

function calcMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 218.3165 + 481267.8813 * T;
  const M = 134.9634 + 477198.8676 * T;
  const Mprime = 93.272 + 483202.0175 * T;
  const D = 297.8502 + 445267.1115 * T;
  const Mr = (M * Math.PI) / 180;
  const Mpr = (Mprime * Math.PI) / 180;
  const Dr = (D * Math.PI) / 180;
  const long =
    L0 +
    6.289 * Math.sin(Mpr) +
    1.274 * Math.sin(2 * Dr - Mpr) +
    0.658 * Math.sin(2 * Dr) +
    0.214 * Math.sin(2 * Mpr) -
    0.186 * Math.sin(Mr);
  return ((long % 360) + 360) % 360;
}

// Returns { longitude, retrograde } for each planet
function calcPlanetaryLongitudes(
  jd: number
): Record<string, { longitude: number; retrograde: boolean }> {
  const T = (jd - 2451545.0) / 36525.0;
  const T_prev = (jd - 1 - 2451545.0) / 36525.0;

  const rawLongitudes = (t: number) => ({
    Mercury: (((252.251 + 149472.675 * t) % 360) + 360) % 360,
    Venus: (((181.979 + 58517.816 * t) % 360) + 360) % 360,
    Mars: (((355.433 + 19140.299 * t) % 360) + 360) % 360,
    Jupiter: (((34.351 + 3034.906 * t) % 360) + 360) % 360,
    Saturn: (((50.077 + 1222.114 * t) % 360) + 360) % 360,
    Uranus: (((314.055 + 428.048 * t) % 360) + 360) % 360,
    Neptune: (((304.349 + 218.461 * t) % 360) + 360) % 360,
    Pluto: (((238.929 + 145.201 * t) % 360) + 360) % 360,
  });

  const current = rawLongitudes(T);
  const previous = rawLongitudes(T_prev);

  const result: Record<string, { longitude: number; retrograde: boolean }> = {};
  for (const [planet, long] of Object.entries(current)) {
    const prevLong = previous[planet as keyof typeof previous];
    let diff = long - prevLong;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    result[planet] = { longitude: long, retrograde: diff < 0 };
  }
  return result;
}

function calcAspects(planets: TransitPlanet[]): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];
  const ASPECT_TYPES: {
    angle: number;
    type: PlanetaryAspect["type"];
    orb: number;
    harmonious: boolean;
  }[] = [
    { angle: 0, type: "conjunction", orb: 8, harmonious: true },
    { angle: 60, type: "sextile", orb: 6, harmonious: true },
    { angle: 90, type: "square", orb: 8, harmonious: false },
    { angle: 120, type: "trine", orb: 8, harmonious: true },
    { angle: 180, type: "opposition", orb: 8, harmonious: false },
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].longitude - planets[j].longitude);
      const angle = diff > 180 ? 360 - diff : diff;

      for (const asp of ASPECT_TYPES) {
        const orb = Math.abs(angle - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planet1: planets[i].planet,
            planet2: planets[j].planet,
            type: asp.type,
            orb: Math.round(orb * 10) / 10,
            isHarmonious: asp.harmonious,
          });
          break;
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb).slice(0, 6);
}

export function getCurrentTransits(date: Date = new Date()): TransitSnapshot {
  const jd = toJulianDay(date);

  const sunLong = calcSunLongitude(jd);
  const moonLong = calcMoonLongitude(jd);
  const planetData = calcPlanetaryLongitudes(jd);

  const moonPhase = (() => {
    const knownNew = new Date("2000-01-06T18:14:00Z");
    const elapsed = (date.getTime() - knownNew.getTime()) / (1000 * 60 * 60 * 24);
    const cycles = elapsed / 29.53058867;
    return ((cycles % 1) + 1) % 1;
  })();

  const allPlanets: TransitPlanet[] = [
    {
      planet: "Sun",
      ...longitudeToSign(sunLong),
      longitude: sunLong,
      retrograde: false,
      symbol: PLANET_SYMBOLS["Sun"],
    },
    {
      planet: "Moon",
      ...longitudeToSign(moonLong),
      longitude: moonLong,
      retrograde: false,
      symbol: PLANET_SYMBOLS["Moon"],
    },
    ...Object.entries(planetData).map(([name, { longitude, retrograde }]) => ({
      planet: name,
      ...longitudeToSign(longitude),
      longitude,
      retrograde,
      symbol: PLANET_SYMBOLS[name] ?? "✦",
    })),
  ];

  const aspects = calcAspects(allPlanets);
  const moonSign = longitudeToSign(moonLong).sign;

  // Build summary
  const retroPlanets = allPlanets.filter((p) => p.retrograde).map((p) => p.planet);
  const keyAspect = aspects[0];
  let summary = `Sun in ${allPlanets[0].sign}, Moon in ${moonSign}.`;
  if (retroPlanets.length > 0) {
    summary += ` ${retroPlanets.join(", ")} ${retroPlanets.length === 1 ? "is" : "are"} retrograde.`;
  }
  if (keyAspect) {
    summary += ` ${keyAspect.planet1} ${keyAspect.type} ${keyAspect.planet2}.`;
  }

  return { date, planets: allPlanets, aspects, moonPhase, moonSign, summary };
}

export function getTransitsForDate(date: Date): TransitSnapshot {
  return getCurrentTransits(date);
}

// Get a formatted string for injecting into AI prompts
export function formatTransitsForPrompt(transits: TransitSnapshot): string {
  const lines: string[] = [
    `Current Planetary Positions (${transits.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}):`,
  ];

  for (const p of transits.planets) {
    lines.push(`  ${p.symbol} ${p.planet} in ${p.sign}${p.retrograde ? " (Rx)" : ""}`);
  }

  if (transits.aspects.length > 0) {
    lines.push("Key Aspects:");
    for (const a of transits.aspects.slice(0, 3)) {
      lines.push(`  ${a.planet1} ${a.type} ${a.planet2} (orb ${a.orb}°)`);
    }
  }

  const retroPlanets = transits.planets.filter((p) => p.retrograde);
  if (retroPlanets.length > 0) {
    lines.push(`Retrograde: ${retroPlanets.map((p) => p.planet).join(", ")}`);
  }

  return lines.join("\n");
}

// Sign influence descriptions for Libra
export const SIGN_INFLUENCES: Record<ZodiacSign, string> = {
  Aries: "Bold, impulsive energy. Push forward but avoid conflict.",
  Taurus: "Stability and sensory pleasure. Ground yourself.",
  Gemini: "Mental agility. Connections and communication flourish.",
  Cancer: "Emotional depth. Nurture yourself and close bonds.",
  Leo: "Creative fire. Confidence and self-expression peak.",
  Virgo: "Detail and discernment. Perfect your craft.",
  Libra: "Your power zone. Beauty, balance, and relationships align.",
  Scorpio: "Intensity and transformation. Dive beneath the surface.",
  Sagittarius: "Expansion and truth-seeking. Broaden your horizons.",
  Capricorn: "Ambition and structure. Build toward your goals.",
  Aquarius: "Innovation and liberation. Break old patterns.",
  Pisces: "Intuition and surrender. Trust the flow.",
};
