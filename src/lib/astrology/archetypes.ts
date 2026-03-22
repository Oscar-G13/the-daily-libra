import type { LibraArchetype, ArchetypeModifier, QuizQuestion, QuizResult } from "@/types";

export const ARCHETYPE_DESCRIPTIONS: Record<
  LibraArchetype,
  { tagline: string; description: string; traits: string[] }
> = {
  velvet_diplomat: {
    tagline: "You navigate every room with grace and intention.",
    description:
      "You understand people deeply and move through conflict with poise. Your power is social intelligence — but the cost is sometimes your own unspoken truth.",
    traits: [
      "Emotionally attuned",
      "Socially gifted",
      "Natural mediator",
      "Avoids hard edges",
      "Quietly strategic",
    ],
  },
  romantic_strategist: {
    tagline: "Love is your art form and your battlefield.",
    description:
      "You approach love with intention, vision, and a quiet plan. You feel deeply but move with care. You want the fairy tale — and you believe in it — but you're also paying attention.",
    traits: [
      "Deliberate in love",
      "High standards",
      "Pattern-aware",
      "Deeply romantic",
      "Strategically patient",
    ],
  },
  mirror_heart: {
    tagline: "You reflect back what others need — but who sees you?",
    description:
      "You have an extraordinary ability to attune to others, to feel what they feel, to become what the room needs. The shadow: losing yourself in that reflection.",
    traits: [
      "Deeply empathic",
      "People-attuned",
      "Self-erasing tendencies",
      "Craves deep connection",
      "Needs more mirrors turned inward",
    ],
  },
  silent_scales: {
    tagline: "You observe everything and say less than you know.",
    description:
      "You process internally before you speak, and your silences carry more than most people's words. You choose harmony over conflict — but sometimes at the cost of honest expression.",
    traits: [
      "Reflective and private",
      "Highly observant",
      "Non-confrontational",
      "Internally turbulent",
      "Quietly wise",
    ],
  },
  golden_idealist: {
    tagline: "You see the world as it could be — beautifully, painfully.",
    description:
      "You have an almost dangerous capacity to imagine the best version of everything — people, love, outcomes. Reality sometimes disappoints you, but your vision never stops.",
    traits: [
      "Romantic idealism",
      "High expectations",
      "Visionary",
      "Disappointed by reality",
      "Beautiful inner world",
    ],
  },
  aesthetic_oracle: {
    tagline: "Beauty is not superficial to you — it's a language.",
    description:
      "You are attuned to the aesthetics of everything — spaces, people, energy, language. Your taste is sharp, your eye is precise, and your standard for beauty extends inward too.",
    traits: [
      "Aesthetically sensitive",
      "Curated self-expression",
      "Visual intelligence",
      "High environmental standards",
      "Style as identity",
    ],
  },
  people_pleaser_in_recovery: {
    tagline: "You're finally learning that not everyone deserves your peace.",
    description:
      "You spent years — maybe decades — optimizing yourself for other people's comfort. You're waking up to the cost. This archetype is one of the most powerful because you're in active transformation.",
    traits: [
      "Healing fawn response",
      "Learning to say no",
      "High self-awareness",
      "Recovering people-pleaser",
      "Building real self-worth",
    ],
  },
  elegant_overthinker: {
    tagline: "Your mind is a palace — and sometimes a maze.",
    description:
      "You think beautifully, analyze everything, and have an inner world richer than most people suspect. But decisions get caught in the loop. Action waits on perfect clarity.",
    traits: [
      "Analytical",
      "Overthinks decisions",
      "Elegant inner narrative",
      "Paralysis by analysis",
      "Brilliant but often late to act",
    ],
  },
  soft_power_libra: {
    tagline: "Your influence is real — you just rarely use it loudly.",
    description:
      "You move through the world with quiet magnetism. You rarely need to demand attention because you have a gravitational quality. Your power is gentle but unmistakable.",
    traits: [
      "Magnetic energy",
      "Non-aggressive power",
      "Subtle influence",
      "Calm confidence",
      "Does not need to perform",
    ],
  },
  cosmic_charmer: {
    tagline: "Everyone feels chosen when they're with you.",
    description:
      "You have a gift for making people feel seen, special, and elevated. Social situations are your element. The depth under that charm, though, is real — and it asks to be honored.",
    traits: [
      "Natural charisma",
      "Socially effortless",
      "Charming but deep",
      "Craves genuine connection underneath",
      "Performs and then wants to retreat",
    ],
  },
};

// ─── Quiz Questions ───────────────────────────────────────────────────────────

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q_decision",
    category: "Decision Making Style",
    text: "A major decision lands on you. What's your instinct?",
    options: [
      {
        id: "q_decision_a",
        text: "I research every angle until I feel certain.",
        archetypeWeights: { elegant_overthinker: 3, golden_idealist: 1 },
      },
      {
        id: "q_decision_b",
        text: "I read the room and consider how each choice affects everyone.",
        archetypeWeights: { velvet_diplomat: 3, mirror_heart: 2 },
      },
      {
        id: "q_decision_c",
        text: "I wait. I need to feel into it before I move.",
        archetypeWeights: { silent_scales: 3, soft_power_libra: 1 },
      },
      {
        id: "q_decision_d",
        text: "I ask someone I trust and use their reaction to clarify my own.",
        archetypeWeights: { mirror_heart: 2, people_pleaser_in_recovery: 2 },
      },
    ],
  },
  {
    id: "q_conflict",
    category: "Conflict Style",
    text: "Someone you care about says something that genuinely hurts you. What do you do?",
    options: [
      {
        id: "q_conflict_a",
        text: "I go quiet and process it alone for days.",
        archetypeWeights: { silent_scales: 3, elegant_overthinker: 2 },
      },
      {
        id: "q_conflict_b",
        text: "I find a diplomatic way to address it without creating drama.",
        archetypeWeights: { velvet_diplomat: 3, romantic_strategist: 1 },
      },
      {
        id: "q_conflict_c",
        text: "I forgive quickly because peace matters more to me than being right.",
        archetypeWeights: { people_pleaser_in_recovery: 2, mirror_heart: 2 },
      },
      {
        id: "q_conflict_d",
        text: "I name it clearly and expect them to take accountability.",
        archetypeWeights: { people_pleaser_in_recovery: 3, soft_power_libra: 2 },
      },
    ],
  },
  {
    id: "q_love",
    category: "Romantic Attachment Style",
    text: "In love, what do you want most?",
    options: [
      {
        id: "q_love_a",
        text: "A deep, intoxicating connection that feels like destiny.",
        archetypeWeights: { romantic_strategist: 3, golden_idealist: 2 },
      },
      {
        id: "q_love_b",
        text: "A partnership where I feel truly understood.",
        archetypeWeights: { mirror_heart: 3, silent_scales: 2 },
      },
      {
        id: "q_love_c",
        text: "Someone who appreciates my mind, taste, and depth.",
        archetypeWeights: { aesthetic_oracle: 3, elegant_overthinker: 2 },
      },
      {
        id: "q_love_d",
        text: "A calm, beautiful, stable relationship I can build on.",
        archetypeWeights: { velvet_diplomat: 2, soft_power_libra: 3 },
      },
    ],
  },
  {
    id: "q_social",
    category: "Social Energy",
    text: "After a long social event, you feel:",
    options: [
      {
        id: "q_social_a",
        text: "Energized. I thrive in a room.",
        archetypeWeights: { cosmic_charmer: 3, velvet_diplomat: 2 },
      },
      {
        id: "q_social_b",
        text: "Satisfied but ready to decompress.",
        archetypeWeights: { soft_power_libra: 2, elegant_overthinker: 2 },
      },
      {
        id: "q_social_c",
        text: "Emotionally drained — I gave too much.",
        archetypeWeights: { mirror_heart: 3, people_pleaser_in_recovery: 2 },
      },
      {
        id: "q_social_d",
        text: "Quiet. I observed more than participated.",
        archetypeWeights: { silent_scales: 3, aesthetic_oracle: 1 },
      },
    ],
  },
  {
    id: "q_beauty",
    category: "Aesthetic Sensitivity",
    text: "Your environment has a direct effect on your mood.",
    options: [
      {
        id: "q_beauty_a",
        text: "Yes — I can't function in ugly or chaotic spaces.",
        archetypeWeights: { aesthetic_oracle: 4, golden_idealist: 1 },
      },
      {
        id: "q_beauty_b",
        text: "Yes, but it's more about energy than looks.",
        archetypeWeights: { soft_power_libra: 2, silent_scales: 2 },
      },
      {
        id: "q_beauty_c",
        text: "Somewhat — I create beauty but I can adapt.",
        archetypeWeights: { velvet_diplomat: 2, romantic_strategist: 2 },
      },
      {
        id: "q_beauty_d",
        text: "I'm aware of it, but my inner world is louder than my outer one.",
        archetypeWeights: { elegant_overthinker: 3, mirror_heart: 1 },
      },
    ],
  },
  {
    id: "q_validation",
    category: "Validation Needs",
    text: "Be honest: how much do other people's opinions shape your choices?",
    options: [
      {
        id: "q_validation_a",
        text: "More than I want to admit.",
        archetypeWeights: { people_pleaser_in_recovery: 4, mirror_heart: 2 },
        modifierWeights: { validation_driven: 2 },
      },
      {
        id: "q_validation_b",
        text: "I care, but I can override it when I need to.",
        archetypeWeights: { romantic_strategist: 2, velvet_diplomat: 2 },
      },
      {
        id: "q_validation_c",
        text: "I value input, but my own clarity matters more.",
        archetypeWeights: { silent_scales: 2, soft_power_libra: 2 },
      },
      {
        id: "q_validation_d",
        text: "Very little — I have strong internal standards.",
        archetypeWeights: { aesthetic_oracle: 2, elegant_overthinker: 1 },
        modifierWeights: { emotionally_guarded: 1 },
      },
    ],
  },
  {
    id: "q_selfimage",
    category: "Self Image",
    text: "When you imagine the best version of yourself, it looks like:",
    options: [
      {
        id: "q_selfimage_a",
        text: "Someone radiant, magnetic, and loved by everyone.",
        archetypeWeights: { cosmic_charmer: 3, golden_idealist: 2 },
      },
      {
        id: "q_selfimage_b",
        text: "Someone with clear boundaries, full of peace and self-trust.",
        archetypeWeights: { people_pleaser_in_recovery: 4 },
        modifierWeights: { harmony_seeking: 2 },
      },
      {
        id: "q_selfimage_c",
        text: "Someone deeply understood by a few, with a beautiful life.",
        archetypeWeights: { silent_scales: 2, mirror_heart: 2 },
      },
      {
        id: "q_selfimage_d",
        text: "Someone who moves through the world with quiet power and refined taste.",
        archetypeWeights: { soft_power_libra: 3, aesthetic_oracle: 2 },
      },
    ],
  },
];

// ─── Archetype calculation ────────────────────────────────────────────────────

export function calculateArchetype(answers: Record<string, string>): QuizResult {
  const scores: Record<LibraArchetype, number> = {
    velvet_diplomat: 0,
    romantic_strategist: 0,
    mirror_heart: 0,
    silent_scales: 0,
    golden_idealist: 0,
    aesthetic_oracle: 0,
    people_pleaser_in_recovery: 0,
    elegant_overthinker: 0,
    soft_power_libra: 0,
    cosmic_charmer: 0,
  };

  const modifierScores: Record<ArchetypeModifier, number> = {
    venus_heavy: 0,
    emotionally_guarded: 0,
    harmony_seeking: 0,
    validation_driven: 0,
    deeply_intuitive: 0,
    detached_under_pressure: 0,
    beauty_obsessed: 0,
    indecisive_but_insightful: 0,
  };

  for (const question of QUIZ_QUESTIONS) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const option = question.options.find((o) => o.id === selectedOptionId);
    if (!option) continue;

    for (const [archetype, weight] of Object.entries(option.archetypeWeights)) {
      scores[archetype as LibraArchetype] += weight ?? 0;
    }

    if (option.modifierWeights) {
      for (const [modifier, weight] of Object.entries(option.modifierWeights)) {
        modifierScores[modifier as ArchetypeModifier] += weight ?? 0;
      }
    }
  }

  // Check if overthinking pattern (4+ questions with slow/analytical answers)
  const indecisiveAnswers = ["q_decision_a", "q_decision_c", "q_conflict_a"].filter((id) =>
    Object.values(answers).includes(id)
  );
  if (indecisiveAnswers.length >= 2) {
    modifierScores.indecisive_but_insightful += 2;
  }

  const primaryArchetype = Object.entries(scores).sort(
    ([, a], [, b]) => b - a
  )[0][0] as LibraArchetype;
  const secondaryModifier = Object.entries(modifierScores).sort(
    ([, a], [, b]) => b - a
  )[0][0] as ArchetypeModifier;

  return { primaryArchetype, secondaryModifier, scores };
}
