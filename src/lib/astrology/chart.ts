// ─────────────────────────────────────────────────────────────────────────────
//  The Daily Libra — Natal Chart Calculation Engine
//  Uses simplified astronomical calculations.
//  For production accuracy, consider integrating:
//  - Swiss Ephemeris (via swisseph npm package)
//  - Astro-Seek API
//  - AstroAPI.io
// ─────────────────────────────────────────────────────────────────────────────

import type { NatalChart, PlanetPlacement } from "@/types";

// Zodiac signs in order
const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export type ZodiacSign = (typeof SIGNS)[number];

// Julian Day Number calculation
function toJulianDay(year: number, month: number, day: number, hour = 12): number {
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

// Get zodiac sign from ecliptic longitude
function longitudeToSign(longitude: number): { sign: ZodiacSign; degree: number } {
  const normalizedLong = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLong / 30);
  const degree = normalizedLong % 30;
  return { sign: SIGNS[signIndex], degree };
}

// Simplified Sun position (approximate — within ~1 degree)
function calculateSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = (M * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  return ((L0 + C) % 360 + 360) % 360;
}

// Simplified Moon position (approximate)
function calculateMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 218.3165 + 481267.8813 * T;
  const M = 134.9634 + 477198.8676 * T;
  const Mprime = 93.272 + 483202.0175 * T;
  const D = 297.8502 + 445267.1115 * T;
  const Mrad = (M * Math.PI) / 180;
  const Mprimerod = (Mprime * Math.PI) / 180;
  const Drad = (D * Math.PI) / 180;
  const longitude =
    L0 +
    6.289 * Math.sin(Mprimerod) +
    1.274 * Math.sin(2 * Drad - Mprimerod) +
    0.658 * Math.sin(2 * Drad) +
    0.214 * Math.sin(2 * Mprimerod) -
    0.186 * Math.sin(Mrad);
  return ((longitude % 360) + 360) % 360;
}

// Approximate ascending node for rising sign calculation
function calculateAscendant(jd: number, latitude: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const RAMC = 280.46061837 + 360.98564736629 * (jd - 2451545) + longitude;
  const e = 23.439291111 - 0.013004167 * T;
  const erad = (e * Math.PI) / 180;
  const RAMCrad = (((RAMC % 360) + 360) % 360) * (Math.PI / 180);
  const latRad = (latitude * Math.PI) / 180;
  const ascRad = Math.atan2(Math.cos(RAMCrad), -(Math.sin(RAMCrad) * Math.cos(erad) + Math.tan(latRad) * Math.sin(erad)));
  let asc = (ascRad * 180) / Math.PI;
  if (asc < 0) asc += 180;
  if (Math.cos(RAMCrad) < 0) asc += 180;
  return ((asc % 360) + 360) % 360;
}

// Simplified planetary positions for outer planets
function getPlanetaryPositions(jd: number): Record<string, number> {
  const T = (jd - 2451545.0) / 36525.0;
  return {
    mercury: ((252.251 + 149472.675 * T) % 360 + 360) % 360,
    venus: ((181.979 + 58517.816 * T) % 360 + 360) % 360,
    mars: ((355.433 + 19140.299 * T) % 360 + 360) % 360,
    jupiter: ((34.351 + 3034.906 * T) % 360 + 360) % 360,
    saturn: ((50.077 + 1222.114 * T) % 360 + 360) % 360,
    uranus: ((314.055 + 428.048 * T) % 360 + 360) % 360,
    neptune: ((304.349 + 218.461 * T) % 360 + 360) % 360,
    pluto: ((238.929 + 145.201 * T) % 360 + 360) % 360,
  };
}

interface BirthData {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  latitude: number;
  longitude: number;
  timezone: string;
}

export function calculateNatalChart(data: BirthData): NatalChart {
  const [year, month, day] = data.birthDate.split("-").map(Number);
  let hour = 12; // default to noon if no birth time

  if (data.birthTime) {
    const [h, m] = data.birthTime.split(":").map(Number);
    hour = h + m / 60;
  }

  const jd = toJulianDay(year, month, day, hour);

  const sunLong = calculateSunLongitude(jd);
  const moonLong = calculateMoonLongitude(jd);
  const ascLong = data.birthTime
    ? calculateAscendant(jd, data.latitude, data.longitude)
    : sunLong; // fallback if no birth time
  const planets = getPlanetaryPositions(jd);

  const sunPlacement = longitudeToSign(sunLong);
  const moonPlacement = longitudeToSign(moonLong);
  const ascPlacement = longitudeToSign(ascLong);
  const mcLong = ((ascLong + 270) % 360 + 360) % 360;
  const mcPlacement = longitudeToSign(mcLong);

  // Build house cusps (Placidus simplified — equal house as fallback)
  const houses = Array.from({ length: 12 }, (_, i) => {
    const cuspLong = ((ascLong + i * 30) % 360 + 360) % 360;
    const { sign, degree } = longitudeToSign(cuspLong);
    return { house: i + 1, sign, degree };
  });

  const getHouseForLongitude = (longitude: number): number => {
    const relLong = ((longitude - ascLong + 360) % 360);
    return Math.floor(relLong / 30) + 1;
  };

  const makePlacement = (planet: string, longitude: number): PlanetPlacement => {
    const { sign, degree } = longitudeToSign(longitude);
    return {
      planet,
      sign,
      degree: Math.round(degree * 100) / 100,
      house: getHouseForLongitude(longitude),
      retrograde: false, // simplified — full retrograde calc requires more ephemeris data
    };
  };

  const chart: NatalChart = {
    sun: makePlacement("Sun", sunLong),
    moon: makePlacement("Moon", moonLong),
    mercury: makePlacement("Mercury", planets.mercury),
    venus: makePlacement("Venus", planets.venus),
    mars: makePlacement("Mars", planets.mars),
    jupiter: makePlacement("Jupiter", planets.jupiter),
    saturn: makePlacement("Saturn", planets.saturn),
    uranus: makePlacement("Uranus", planets.uranus),
    neptune: makePlacement("Neptune", planets.neptune),
    pluto: makePlacement("Pluto", planets.pluto),
    ascendant: { sign: ascPlacement.sign, degree: Math.round(ascPlacement.degree * 100) / 100 },
    midheaven: { sign: mcPlacement.sign, degree: Math.round(mcPlacement.degree * 100) / 100 },
    houses,
    aspects: [],
  };

  return chart;
}

export function getChartSummary(chart: NatalChart): string {
  const parts: string[] = [];
  parts.push(`Sun in ${chart.sun.sign}`);
  if (chart.moon.sign) parts.push(`Moon in ${chart.moon.sign}`);
  parts.push(`Rising ${chart.ascendant.sign}`);
  parts.push(`Venus in ${chart.venus.sign}`);
  parts.push(`Mars in ${chart.mars.sign}`);
  return parts.join(", ");
}
