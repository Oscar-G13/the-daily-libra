"use client";

import { motion } from "framer-motion";
import type { TraitScore } from "@/types/assessment";

const TRAIT_CATEGORIES: { label: string; color: string; traits: string[] }[] = [
  {
    label: "Core Personality",
    color: "from-gold-200/60 to-bronze/60",
    traits: [
      "big_five_openness",
      "big_five_conscientiousness",
      "big_five_extraversion",
      "big_five_agreeableness",
      "big_five_emotional_sensitivity",
    ],
  },
  {
    label: "Cognition",
    color: "from-plum/60 to-purple-500/60",
    traits: ["cognition_intuitive", "cognition_structured", "cognition_internal_processing"],
  },
  {
    label: "Relational",
    color: "from-rose/60 to-pink-500/60",
    traits: [
      "relational_security",
      "relational_reassurance_need",
      "conflict_avoidance",
      "reciprocity_expectation",
      "validation_need",
      "harmony_drive",
    ],
  },
  {
    label: "Emotional",
    color: "from-blue-400/60 to-cyan-400/60",
    traits: [
      "emotional_intensity",
      "overthinking_tendency",
      "ambiguity_tolerance",
      "solitude_recovery_need",
      "sensory_sensitivity",
    ],
  },
  {
    label: "Aesthetic & Libra",
    color: "from-emerald-400/60 to-teal-400/60",
    traits: [
      "beauty_sensitivity",
      "fairness_sensitivity",
      "romantic_idealism",
      "ritual_receptivity",
      "self_expression_aesthetic",
    ],
  },
];

const TRAIT_LABELS: Record<string, string> = {
  big_five_openness: "Openness",
  big_five_conscientiousness: "Conscientiousness",
  big_five_extraversion: "Extraversion",
  big_five_agreeableness: "Agreeableness",
  big_five_emotional_sensitivity: "Emotional Sensitivity",
  cognition_intuitive: "Intuitive",
  cognition_structured: "Structured",
  cognition_internal_processing: "Internal Processing",
  relational_security: "Secure Attachment",
  relational_reassurance_need: "Reassurance Need",
  conflict_avoidance: "Conflict Avoidance",
  reciprocity_expectation: "Reciprocity",
  validation_need: "Validation Need",
  harmony_drive: "Harmony Drive",
  emotional_intensity: "Emotional Intensity",
  overthinking_tendency: "Overthinking",
  ambiguity_tolerance: "Ambiguity Tolerance",
  solitude_recovery_need: "Solitude Need",
  sensory_sensitivity: "Sensory Sensitivity",
  beauty_sensitivity: "Beauty Sensitivity",
  fairness_sensitivity: "Fairness",
  romantic_idealism: "Romantic Idealism",
  ritual_receptivity: "Ritual Receptivity",
  self_expression_aesthetic: "Aesthetic Expression",
};

interface TraitMapVisualProps {
  traitScores: Record<string, TraitScore>;
}

export function TraitMapVisual({ traitScores }: TraitMapVisualProps) {
  return (
    <div className="space-y-6">
      {TRAIT_CATEGORIES.map((category) => (
        <div key={category.label}>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            {category.label}
          </p>
          <div className="space-y-2.5">
            {category.traits.map((traitKey) => {
              const score = traitScores[traitKey];
              const value = score?.normalized_score ?? 0;
              const label = TRAIT_LABELS[traitKey] ?? traitKey;

              return (
                <div key={traitKey}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-foreground/70">{label}</span>
                    <span className="text-xs text-muted-foreground">{value}</span>
                  </div>
                  <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      className={`h-full bg-gradient-to-r ${category.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
