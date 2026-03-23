// ─── Premium feature definitions ─────────────────────────────────────────────

export type PremiumFeature =
  | "text_decoder"
  | "red_flag_decoder"
  | "insight_quiz"
  | "cosmic_room_save"
  | "compatibility_unlimited"
  | "reading_categories"
  | "reading_tones"
  | "journal_unlimited"
  | "companion_unlimited"
  | "aesthetic_profile"
  | "decision_decoder";

export const PREMIUM_FEATURE_LABELS: Record<PremiumFeature, string> = {
  text_decoder: "Text Decoder",
  red_flag_decoder: "Red Flag Decoder",
  insight_quiz: "Insight Session",
  cosmic_room_save: "Cosmic Room",
  compatibility_unlimited: "Unlimited Compatibility Readings",
  reading_categories: "All Reading Categories",
  reading_tones: "All Reading Tones",
  journal_unlimited: "Unlimited Journal Entries",
  companion_unlimited: "Unlimited AI Companion",
  aesthetic_profile: "Aesthetic Profile",
  decision_decoder: "Decision Decoder",
};

export const PREMIUM_FEATURE_DESCRIPTIONS: Record<PremiumFeature, string> = {
  text_decoder: "Decode the emotional truth behind any message — chart-aware, archetype-specific.",
  red_flag_decoder: "Get a clear-eyed pattern analysis of any relationship dynamic.",
  insight_quiz: "Your personalized AI psychological portrait. Questions written just for you.",
  cosmic_room_save: "Your private sanctuary — save readings, quotes, and daily affirmations.",
  compatibility_unlimited: "Unlimited chart-based relationship readings for everyone in your orbit.",
  reading_categories: "Unlock love, career, shadow, healing, confidence, and all 11 reading types.",
  reading_tones: "Choose your reading voice — poetic, blunt, seductive, practical, or gentle.",
  journal_unlimited: "Unlimited journal entries with AI-generated prompts and mood tracking.",
  companion_unlimited: "Unlimited sessions with your Libra-tuned AI reflection companion.",
  aesthetic_profile: "Discover your Libra aesthetic identity across 6 visual archetypes.",
  decision_decoder: "Navigate your most difficult decisions through your chart and current transits.",
};

export function isPremium(tier: string | null | undefined): boolean {
  return tier === "premium";
}

export function isHighPriestess(tier: string | null | undefined): boolean {
  return tier === "high_priestess";
}

/** High Priestess users get all premium features too */
export function hasFullAccess(tier: string | null | undefined): boolean {
  return isPremium(tier) || isHighPriestess(tier);
}

export const isGuide = isHighPriestess;
