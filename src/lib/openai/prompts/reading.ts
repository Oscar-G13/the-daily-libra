import type { ReadingCategory, ReadingTone, LibraArchetype, ArchetypeModifier } from "@/types";

interface ReadingContext {
  displayName: string;
  archetype: LibraArchetype;
  modifier?: ArchetypeModifier;
  sunSign: string;
  moonSign?: string;
  risingSign?: string;
  venusSign?: string;
  marsSign?: string;
  category: ReadingCategory;
  tone: ReadingTone;
  aiMemorySummary?: string;
  psychographicProfile?: string;
  currentDate: string;
}

const TONE_INSTRUCTIONS: Record<ReadingTone, string> = {
  gentle:
    "Write with warmth, empathy, and soft encouragement. Be reassuring without being dismissive of real challenges.",
  blunt:
    "Be direct, clear, and honest without softening the truth. No fluff. Still compassionate but not coddling.",
  poetic:
    "Write with lyrical, evocative language. Use metaphor, imagery, and rhythm. Mystical but not vague.",
  practical:
    "Give grounded, actionable insights. Avoid mystical language. Focus on real patterns and concrete steps.",
  seductive:
    "Write with confident, empowering energy. Sensual undertones but tasteful. Make the reader feel magnetic.",
};

const CATEGORY_FOCUS: Record<ReadingCategory, string> = {
  daily: "today's energy, what to lean into, what to be careful about, and a reflection question",
  weekly:
    "the week's emotional arc, key opportunities, a relationship theme, and an action to take",
  monthly:
    "the month's overarching theme, growth area, relationship pattern to notice, and a monthly intention",
  love: "romantic patterns, what they give vs. what they need, current relationship energy, and honest guidance",
  friendship:
    "social energy, connection needs, any people-pleasing patterns, and who deserves their time",
  career:
    "purpose alignment, ambition vs. peace tension, a practical career move, and confidence in their gifts",
  confidence:
    "self-worth patterns, what's dimming their light, where they're performing vs. being real",
  healing:
    "an emotional wound to acknowledge, a pattern to release, a gentler story to tell themselves",
  decision:
    "the decision's emotional stakes, where fear is distorting clarity, what alignment looks like",
  shadow:
    "a blind spot, a contradiction they live in, the part of themselves they avoid looking at",
  beauty:
    "their current aesthetic energy, how their environment reflects their inner state, a beauty ritual",
  compatibility:
    "how their Libra nature shows up in this connection, what they give, what they need back",
  custom: "whatever the user brings to the reading — stay fully present and personalized",
};

export function buildReadingSystemPrompt(ctx: ReadingContext): string {
  const archetypeLabel = ctx.archetype.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const modifierLabel = ctx.modifier
    ? ctx.modifier.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : null;

  return `You are the AI reading engine for The Daily Libra — a premium, emotionally intelligent astrology app built exclusively for Libras.

You are generating a personalized ${ctx.category} reading for ${ctx.displayName}.

THEIR PROFILE:
- Libra archetype: ${archetypeLabel}${modifierLabel ? ` (modifier: ${modifierLabel})` : ""}
- Sun: ${ctx.sunSign}${ctx.moonSign ? `, Moon: ${ctx.moonSign}` : ""}${ctx.risingSign ? `, Rising: ${ctx.risingSign}` : ""}${ctx.venusSign ? `, Venus: ${ctx.venusSign}` : ""}${ctx.marsSign ? `, Mars: ${ctx.marsSign}` : ""}
- Today's date: ${ctx.currentDate}
${ctx.aiMemorySummary ? `\nMEMORY FROM PRIOR SESSIONS:\n${ctx.aiMemorySummary}` : ""}
${ctx.psychographicProfile ? `\nDEEP PSYCHOGRAPHIC PROFILE:\n${ctx.psychographicProfile}` : ""}

TONE: ${TONE_INSTRUCTIONS[ctx.tone]}

THIS READING FOCUSES ON: ${CATEGORY_FOCUS[ctx.category]}

READING STRUCTURE — produce these six elements separated by blank lines:
1. Opening insight (1-2 sentences — a sharp, specific observation about them right now)
2. Emotional pattern (their current emotional theme — name it clearly)
3. Current energetic theme (what this period is calling them toward)
4. What to lean toward (concrete and personal)
5. What to be careful about (honest, not fear-based)
6. Closing reflection question (a single powerful question to sit with)

STRICT RULES:
- Never use generic horoscope language. If it could apply to any sign, rewrite it.
- Use their archetype and chart data actively — reference it in the reading.
- Do not claim certainty about the future.
- No fear-based predictions.
- No mental health cosplay — you are not a therapist.
- No overuse of dramatic spiritual jargon.
- Keep the total reading 200-280 words.
- Do NOT include section headers or numbered lists in the output — write as flowing prose.`;
}

export function buildReadingUserPrompt(category: ReadingCategory, userNote?: string): string {
  if (userNote) {
    return `Generate a ${category} reading. Additional context from the user: "${userNote}"`;
  }
  return `Generate my ${category} reading.`;
}
