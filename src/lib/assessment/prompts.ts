import type { TraitKey } from "./scoring";

export function buildProfileGenerationSystemPrompt(): string {
  return `You are the intelligence layer of The Daily Libra — a precision astrology and self-knowledge platform built for people who take their inner world seriously.

You have just received the results of a 130-question deep psychographic assessment. Your job is to transform these trait scores into a rich, coherent psychological portrait.

Write as though you're a brilliant therapist who also happens to know astrology. Be honest, specific, and luminous. Avoid generic wellness-speak. Every sentence should feel like it was written for this person specifically.

Your output must be a JSON object with exactly these fields:
{
  "archetype_label": "2-4 word title that defines their core identity pattern (e.g. 'The Quiet Architect', 'The Devoted Dreamer')",
  "archetype_subtitle": "one poetic line that elaborates the archetype",
  "profile_summary": "3-4 sentences describing their overall psychology — who they are at their core, their dominant way of moving through the world, their central tension",
  "relational_summary": "2-3 sentences on how they love, what they need from relationships, their attachment style and relational blind spot",
  "emotional_summary": "2-3 sentences on their emotional processing style, their sensitivity signature, what dysregulates them and what grounds them",
  "ritual_summary": "1-2 sentences on what kind of self-care, routines, or sensory rituals would serve them best",
  "system_prompt_fragment": "A dense 3-5 sentence paragraph written in second person — this text will be injected into every AI prompt going forward to personalize readings and companion responses. Write as though briefing a perceptive advisor on who this person is. Include their dominant traits, relational patterns, emotional sensitivities, and the kind of tone that lands for them.",
  "tone_rules": {
    "preferred_tone": "gentle | blunt | poetic | practical | seductive",
    "avoid": ["list of 2-3 things to never say or do in this user's readings"]
  },
  "content_preferences": {
    "high_resonance_topics": ["list of 3-4 topics that will land well for this person"],
    "low_resonance_topics": ["list of 1-2 topics that rarely resonate"]
  }
}

Return ONLY valid JSON. No markdown. No explanation outside the JSON object.`;
}

export function buildProfileGenerationUserPrompt(
  traits: Partial<Record<TraitKey, number>>
): string {
  const traitDescriptions: Record<TraitKey, string> = {
    big_five_openness: "Openness to Experience",
    big_five_conscientiousness: "Conscientiousness / Structure",
    big_five_extraversion: "Extraversion / Social Energy",
    big_five_agreeableness: "Agreeableness / Cooperation",
    big_five_emotional_sensitivity: "Emotional Sensitivity / Neuroticism",
    cognition_intuitive: "Intuitive Thinking Style",
    cognition_structured: "Structured / Analytical Thinking",
    cognition_internal_processing: "Internal Processing Preference",
    relational_security: "Secure Attachment Tendency",
    relational_reassurance_need: "Need for Reassurance in Relationships",
    conflict_avoidance: "Conflict Avoidance",
    beauty_sensitivity: "Sensitivity to Beauty / Aesthetics",
    fairness_sensitivity: "Fairness / Justice Sensitivity",
    romantic_idealism: "Romantic Idealism",
    ritual_receptivity: "Receptivity to Rituals / Routine",
    sensory_sensitivity: "Sensory Sensitivity",
    solitude_recovery_need: "Need for Solitude to Recharge",
    overthinking_tendency: "Overthinking / Rumination Tendency",
    self_expression_aesthetic: "Aesthetic Self-Expression Drive",
    emotional_intensity: "Emotional Intensity",
    reciprocity_expectation: "Expectation of Reciprocity",
    ambiguity_tolerance: "Tolerance for Ambiguity / Uncertainty",
    validation_need: "Need for External Validation",
    harmony_drive: "Drive to Create and Maintain Harmony",
  };

  const formatted = Object.entries(traits)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .map(([key, score]) => {
      const label = traitDescriptions[key as TraitKey] ?? key;
      const pct = Math.round(score ?? 0);
      const band =
        pct < 20
          ? "very low"
          : pct < 40
            ? "low"
            : pct < 60
              ? "moderate"
              : pct < 80
                ? "high"
                : "very high";
      return `• ${label}: ${pct}/100 (${band})`;
    })
    .join("\n");

  return `Here are the psychographic trait scores for this user (0–100 scale, higher = stronger presence of the trait):\n\n${formatted}\n\nGenerate their complete psychological profile now.`;
}
