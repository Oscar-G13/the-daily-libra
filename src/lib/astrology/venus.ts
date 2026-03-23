// ─────────────────────────────────────────────────────────────────────────────
//  Venus Tracker — Libra's ruling planet, deep insights
// ─────────────────────────────────────────────────────────────────────────────

import { getCurrentTransits, type ZodiacSign } from "./transits";

export interface VenusStatus {
  sign: ZodiacSign;
  degree: number;
  retrograde: boolean;
  longitude: number;
  influence: string;
  theme: string;
  daysUntilRetrograde: number | null; // null = already retrograde or no upcoming soon
  daysInCurrentSign: number;
  daysRemainingInSign: number;
  venusReturnCountdown: number | null; // days until Venus returns to natal Venus position
}

// Venus moves ~1.2°/day and spends ~26 days in each sign
// Retrograde period: ~40 days every 18 months
const VENUS_SPEED_DEG_PER_DAY = 1.2;

const VENUS_SIGN_THEMES: Record<ZodiacSign, { influence: string; theme: string }> = {
  Aries: {
    influence: "Impulsive attraction and bold declarations. You pursue what you want directly.",
    theme: "Desire & Initiative",
  },
  Taurus: {
    influence: "Sensual pleasure and material beauty. Slow down and savor what you love.",
    theme: "Pleasure & Abundance",
  },
  Gemini: {
    influence: "Witty, curious connections. You're attracted to minds as much as hearts.",
    theme: "Connection & Curiosity",
  },
  Cancer: {
    influence: "Emotional depth in love. Nurturing and being nurtured feels essential now.",
    theme: "Nurture & Belonging",
  },
  Leo: {
    influence: "Dramatic romance and creative expression. Love should feel like magic.",
    theme: "Romance & Radiance",
  },
  Virgo: {
    influence: "Love through devotion and detail. Acts of service speak loudest now.",
    theme: "Devotion & Refinement",
  },
  Libra: {
    influence: "Venus is home. Harmony, beauty, and partnership are at their most powerful.",
    theme: "Harmony & Beauty",
  },
  Scorpio: {
    influence: "Intense, transformative love. Surface connections won't satisfy you.",
    theme: "Depth & Transformation",
  },
  Sagittarius: {
    influence: "Freedom-loving attraction. Adventure and philosophy fuel desire.",
    theme: "Freedom & Philosophy",
  },
  Capricorn: {
    influence: "Commitment and ambition merge. You're drawn to stability and legacy.",
    theme: "Commitment & Mastery",
  },
  Aquarius: {
    influence:
      "Unconventional connections and humanitarian love. You value freedom in partnership.",
    theme: "Innovation & Independence",
  },
  Pisces: {
    influence: "Venus is exalted here. Romantic, spiritual, and deeply compassionate love.",
    theme: "Spiritual Love & Surrender",
  },
};

export function getVenusStatus(natalVenusLongitude?: number): VenusStatus {
  const transits = getCurrentTransits();
  const venus = transits.planets.find((p) => p.planet === "Venus")!;

  const { influence, theme } = VENUS_SIGN_THEMES[venus.sign];

  // Estimate how long Venus has been in this sign and how much remains
  const degreeInSign = venus.degree;
  const daysInCurrentSign = Math.round(degreeInSign / VENUS_SPEED_DEG_PER_DAY);
  const daysRemainingInSign = Math.round((30 - degreeInSign) / VENUS_SPEED_DEG_PER_DAY);

  // Venus Return countdown: days until Venus returns to natal Venus longitude
  let venusReturnCountdown: number | null = null;
  if (natalVenusLongitude !== undefined) {
    const currentLong = venus.longitude;
    let diff = natalVenusLongitude - currentLong;
    if (diff < 0) diff += 360;
    // At ~1.2°/day
    venusReturnCountdown = Math.round(diff / VENUS_SPEED_DEG_PER_DAY);
    if (venusReturnCountdown === 0) venusReturnCountdown = 365; // already there = next year
  }

  // Retrograde note: next retrograde estimated every ~18 months for 40 days
  // This is a simplified indicator — real calculation needs full ephemeris
  const daysUntilRetrograde = venus.retrograde ? null : null; // simplified

  return {
    sign: venus.sign,
    degree: Math.round(venus.degree * 10) / 10,
    retrograde: venus.retrograde,
    longitude: venus.longitude,
    influence,
    theme,
    daysUntilRetrograde,
    daysInCurrentSign,
    daysRemainingInSign,
    venusReturnCountdown,
  };
}

export function getVenusHouseInsight(venusSign: ZodiacSign, ascendantSign: ZodiacSign): string {
  // Simplified house position based on rising sign
  const ZODIAC_ORDER: ZodiacSign[] = [
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
  ];

  const ascIdx = ZODIAC_ORDER.indexOf(ascendantSign);
  const venusIdx = ZODIAC_ORDER.indexOf(venusSign);
  const house = ((venusIdx - ascIdx + 12) % 12) + 1;

  const HOUSE_INSIGHTS: Record<number, string> = {
    1: "Venus in your 1st house — your presence radiates beauty and charm. People are drawn to you.",
    2: "Venus in your 2nd house — financial luck and sensory pleasure are highlighted. Value yourself.",
    3: "Venus in your 3rd house — love flows through words and ideas. Write, speak, connect.",
    4: "Venus in your 4th house — home and family bring deep comfort. Beautify your sanctuary.",
    5: "Venus in your 5th house — creative and romantic expression peaks. Play and create freely.",
    6: "Venus in your 6th house — love through acts of service. Your daily rituals become sacred.",
    7: "Venus in your 7th house — partnerships and one-on-one connections flourish. Your natural domain.",
    8: "Venus in your 8th house — deep intimacy and transformation through love. Nothing stays surface-level.",
    9: "Venus in your 9th house — love of learning and travel. Romance may come from afar.",
    10: "Venus in your 10th house — professional life and public image benefit from Venusian charm.",
    11: "Venus in your 11th house — friendships deepen into chosen family. Community nourishes you.",
    12: "Venus in your 12th house — hidden desires and secret admirers. Love unfolds in private.",
  };

  return HOUSE_INSIGHTS[house] ?? "Venus illuminates your chart with beauty and connection.";
}
