// ─────────────────────────────────────────────────────────────────────────────
//  Harmony Score — Libra's daily balance metric (0–100)
// ─────────────────────────────────────────────────────────────────────────────

import type { TransitSnapshot } from "./transits";
import { SIGN_ELEMENTS } from "./transits";

export interface HarmonyFactors {
  moonPhaseScore: number; // 0–20: full/new moon = high, quarters = lower
  venusScore: number; // 0–20: Venus in air/Libra = high
  moodScore: number; // 0–20: based on today's mood log (1–10 scale)
  streakScore: number; // 0–20: based on app streak
  archetypeScore: number; // 0–20: based on archetype harmony
}

export interface HarmonyResult {
  score: number; // 0–100
  label: string; // "Radiant Balance" etc.
  color: string; // tailwind class
  factors: HarmonyFactors;
  insights: string[]; // 3 bullet points
}

function moonPhaseScore(phase: number): number {
  // Full moon (0.5) and New moon (0/1) = peak energy = 20 pts
  // Quarter moons (0.25, 0.75) = tension = 8 pts
  const distToFull = Math.abs(phase - 0.5);
  const distToNew = Math.min(phase, 1 - phase);
  const distToPeak = Math.min(distToFull, distToNew);
  // distToPeak: 0 = at peak, 0.25 = at quarter
  return Math.round(20 - distToPeak * 40);
}

function venusScore(transits: TransitSnapshot): number {
  const venus = transits.planets.find((p) => p.planet === "Venus");
  if (!venus) return 10;

  // Best: Libra, Taurus (Venus rules), Pisces (exaltation) = 20
  // Good: air signs = 16, earth signs = 14
  // Challenging: Scorpio (detriment), Aries (fall) = 6
  if (venus.sign === "Libra" || venus.sign === "Taurus") return 20;
  if (venus.sign === "Pisces") return 18;
  if (venus.sign === "Scorpio" || venus.sign === "Aries") return 6;
  if (venus.retrograde) return Math.max(4, venusSignBase(venus.sign) - 6);
  return venusSignBase(venus.sign);
}

function venusSignBase(sign: string): number {
  const element = SIGN_ELEMENTS[sign as keyof typeof SIGN_ELEMENTS];
  if (element === "air") return 16;
  if (element === "earth") return 14;
  if (element === "water") return 12;
  return 10; // fire
}

function moodToScore(moodScore: number | null | undefined): number {
  if (!moodScore) return 10; // neutral if no mood logged
  // mood 1–10 → 2–20 pts
  return Math.round(moodScore * 2);
}

function streakToScore(streak: number): number {
  // 0 streak = 4 pts, 7+ streak = 20 pts
  return Math.min(20, Math.round(4 + streak * 2.3));
}

function archetypeHarmonyScore(archetype: string | null | undefined): number {
  // Archetypes naturally harmonious with Libra themes score higher
  const highHarmony = ["the-diplomat", "the-beloved", "the-aesthete", "the-peacemaker"];
  const midHarmony = ["the-idealist", "the-socialite", "the-romantic"];
  if (!archetype) return 10;
  if (highHarmony.includes(archetype)) return 20;
  if (midHarmony.includes(archetype)) return 15;
  return 12;
}

function scoreToLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Radiant Balance", color: "text-gold" };
  if (score >= 70) return { label: "Flowing Harmony", color: "text-gold/80" };
  if (score >= 55) return { label: "Seeking Equilibrium", color: "text-foreground/80" };
  if (score >= 40) return { label: "In Tension", color: "text-rose-400/80" };
  return { label: "Recalibrating", color: "text-rose-400" };
}

export function computeHarmonyScore({
  transits,
  moodScore,
  streak,
  archetype,
}: {
  transits: TransitSnapshot;
  moodScore?: number | null;
  streak: number;
  archetype?: string | null;
}): HarmonyResult {
  const factors: HarmonyFactors = {
    moonPhaseScore: moonPhaseScore(transits.moonPhase),
    venusScore: venusScore(transits),
    moodScore: moodToScore(moodScore),
    streakScore: streakToScore(streak),
    archetypeScore: archetypeHarmonyScore(archetype),
  };

  const score = Math.min(
    100,
    factors.moonPhaseScore +
      factors.venusScore +
      factors.moodScore +
      factors.streakScore +
      factors.archetypeScore
  );

  const { label, color } = scoreToLabel(score);

  // Build insights
  const venus = transits.planets.find((p) => p.planet === "Venus");
  const moon = transits.planets.find((p) => p.planet === "Moon");
  const mercury = transits.planets.find((p) => p.planet === "Mercury");

  const insights: string[] = [];

  // Moon insight
  const moonPhase = transits.moonPhase;
  if (moonPhase < 0.03 || moonPhase >= 0.97) {
    insights.push("New Moon energy supports fresh intentions — set one clear desire today.");
  } else if (moonPhase > 0.47 && moonPhase < 0.53) {
    insights.push("Full Moon peaks emotions. Let yourself feel without immediately fixing.");
  } else if (moonPhase < 0.5) {
    insights.push(`Waxing Moon in ${moon?.sign ?? "the sky"} — build, initiate, say yes.`);
  } else {
    insights.push(`Waning Moon in ${moon?.sign ?? "the sky"} — release, simplify, let go.`);
  }

  // Venus insight
  if (venus) {
    if (venus.retrograde) {
      insights.push(
        `Venus retrograde in ${venus.sign} — revisit old relationships and your values around worth.`
      );
    } else if (venus.sign === "Libra") {
      insights.push(
        "Venus in your home sign amplifies charm and magnetism. Step into beauty consciously."
      );
    } else {
      insights.push(
        `Venus in ${venus.sign} colors your love and aesthetics with ${SIGN_ELEMENTS[venus.sign]} energy.`
      );
    }
  }

  // Mercury / general insight
  if (mercury) {
    if (mercury.retrograde) {
      insights.push(
        `Mercury retrograde in ${mercury.sign} — pause before sending. Review, don't launch.`
      );
    } else {
      insights.push(
        streak >= 7
          ? "Your consistent practice is building real cosmic momentum. Trust the compound effect."
          : "Daily rituals strengthen your connection to your own rhythm. Show up again tomorrow."
      );
    }
  }

  return { score, label, color, factors, insights };
}
