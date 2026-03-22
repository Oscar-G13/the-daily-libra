// ─────────────────────────────────────────────────────────────────────────────
//  The Daily Libra — Core Types
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionTier = "free" | "premium";

export type ReadingCategory =
  | "daily"
  | "weekly"
  | "monthly"
  | "love"
  | "friendship"
  | "career"
  | "confidence"
  | "healing"
  | "decision"
  | "shadow"
  | "beauty"
  | "compatibility"
  | "custom";

export type ReadingTone = "gentle" | "blunt" | "poetic" | "practical" | "seductive";

export type RelationshipType =
  | "romantic"
  | "friendship"
  | "coworker"
  | "ex"
  | "crush"
  | "family";

export type LibraArchetype =
  | "velvet_diplomat"
  | "romantic_strategist"
  | "mirror_heart"
  | "silent_scales"
  | "golden_idealist"
  | "aesthetic_oracle"
  | "people_pleaser_in_recovery"
  | "elegant_overthinker"
  | "soft_power_libra"
  | "cosmic_charmer";

export type ArchetypeModifier =
  | "venus_heavy"
  | "emotionally_guarded"
  | "harmony_seeking"
  | "validation_driven"
  | "deeply_intuitive"
  | "detached_under_pressure"
  | "beauty_obsessed"
  | "indecisive_but_insightful";

export type AestheticStyle =
  | "soft_luxe"
  | "dark_romance"
  | "celestial_editorial"
  | "clean_goddess"
  | "velvet_minimalism"
  | "modern_venus";

// ─── Archetype display data ───────────────────────────────────────────────────

export const ARCHETYPE_LABELS: Record<LibraArchetype, string> = {
  velvet_diplomat: "The Velvet Diplomat",
  romantic_strategist: "The Romantic Strategist",
  mirror_heart: "The Mirror Heart",
  silent_scales: "The Silent Scales",
  golden_idealist: "The Golden Idealist",
  aesthetic_oracle: "The Aesthetic Oracle",
  people_pleaser_in_recovery: "The People Pleaser in Recovery",
  elegant_overthinker: "The Elegant Overthinker",
  soft_power_libra: "The Soft Power Libra",
  cosmic_charmer: "The Cosmic Charmer",
};

export const MODIFIER_LABELS: Record<ArchetypeModifier, string> = {
  venus_heavy: "Venus Heavy",
  emotionally_guarded: "Emotionally Guarded",
  harmony_seeking: "Harmony Seeking",
  validation_driven: "Validation Driven",
  deeply_intuitive: "Deeply Intuitive",
  detached_under_pressure: "Detached Under Pressure",
  beauty_obsessed: "Beauty Obsessed",
  indecisive_but_insightful: "Indecisive But Insightful",
};

export const READING_CATEGORY_LABELS: Record<ReadingCategory, string> = {
  daily: "Daily Reading",
  weekly: "Weekly Forecast",
  monthly: "Monthly Overview",
  love: "Love & Romance",
  friendship: "Friendships",
  career: "Career & Purpose",
  confidence: "Confidence",
  healing: "Healing",
  decision: "Decision Guidance",
  shadow: "Shadow Work",
  beauty: "Beauty & Energy",
  compatibility: "Compatibility",
  custom: "Custom Reading",
};

export const TONE_LABELS: Record<ReadingTone, string> = {
  gentle: "Gentle & Comforting",
  blunt: "Blunt & Honest",
  poetic: "Poetic & Mystical",
  practical: "Practical & Grounded",
  seductive: "Seductive & Empowering",
};

// ─── Birth chart types ────────────────────────────────────────────────────────

export interface PlanetPlacement {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface NatalChart {
  sun: PlanetPlacement;
  moon: PlanetPlacement;
  mercury: PlanetPlacement;
  venus: PlanetPlacement;
  mars: PlanetPlacement;
  jupiter: PlanetPlacement;
  saturn: PlanetPlacement;
  uranus: PlanetPlacement;
  neptune: PlanetPlacement;
  pluto: PlanetPlacement;
  ascendant: { sign: string; degree: number };
  midheaven: { sign: string; degree: number };
  houses: { house: number; sign: string; degree: number }[];
  aspects: ChartAspect[];
}

export interface ChartAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  applying: boolean;
}

// ─── Compatibility types ──────────────────────────────────────────────────────

export interface CompatibilityReport {
  attractionScore: number;
  communicationScore: number;
  emotionalSafetyScore: number;
  conflictRiskScore: number;
  overallScore: number;
  chemistryThemes: string[];
  conflictRiskAreas: string[];
  idealDynamic: string;
  dangerZones: string[];
  librasOvergiving: string;
  balanceAdvice: string;
  narrative: string;
}

// ─── User profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  pronouns?: string;
  subscriptionTier: SubscriptionTier;
  tonePreference: ReadingTone;
  relationshipStatus?: string;
  goals: string[];
  onboardingCompleted: boolean;
}

export interface LibraProfile {
  primaryArchetype: LibraArchetype;
  secondaryModifier?: ArchetypeModifier;
  aestheticStyle?: AestheticStyle;
  relationshipStyle?: string;
  conflictStyle?: string;
  decisionStyle?: string;
  beautyAffinity?: string;
  emotionalPatternSummary?: string;
  aiMemorySummary?: string;
}

// ─── Quiz types ───────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  category: string;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  archetypeWeights: Partial<Record<LibraArchetype, number>>;
  modifierWeights?: Partial<Record<ArchetypeModifier, number>>;
}

export interface QuizResult {
  primaryArchetype: LibraArchetype;
  secondaryModifier: ArchetypeModifier;
  scores: Record<LibraArchetype, number>;
}
