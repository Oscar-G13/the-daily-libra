"use client";

import { motion } from "framer-motion";

const TRAIT_LABELS: Record<string, string> = {
  big_five_openness: "Openness",
  big_five_conscientiousness: "Conscientiousness",
  big_five_extraversion: "Extraversion",
  big_five_agreeableness: "Agreeableness",
  big_five_emotional_sensitivity: "Emo. Sensitivity",
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

interface TraitEntry {
  trait_key: string;
  normalized_score: number;
  percentile_band: string | null;
}

interface TraitPulseCardProps {
  traits: TraitEntry[];
}

const BAND_COLOR: Record<string, string> = {
  very_high: "text-gold",
  high: "text-gold/75",
  moderate: "text-foreground/60",
  low: "text-foreground/40",
  very_low: "text-foreground/30",
};

export function TraitPulseCard({ traits }: TraitPulseCardProps) {
  if (traits.length === 0) return null;

  // Sort by score descending, take top 5
  const top5 = [...traits].sort((a, b) => b.normalized_score - a.normalized_score).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-5 space-y-4"
    >
      <div>
        <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Dominant Traits</p>
        <p className="font-serif text-lg text-foreground leading-tight">Your Psyche Map</p>
      </div>

      <div className="space-y-2.5">
        {top5.map((t, i) => {
          const label = TRAIT_LABELS[t.trait_key] ?? t.trait_key;
          const bandColor = BAND_COLOR[t.percentile_band ?? "moderate"] ?? "text-foreground/60";

          return (
            <motion.div
              key={t.trait_key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-foreground/75">{label}</span>
                <span className={`text-xs font-medium ${bandColor}`}>{t.normalized_score}</span>
              </div>
              <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${t.normalized_score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 + i * 0.07 }}
                  className="h-full bg-gradient-to-r from-gold-200/60 to-bronze/60 rounded-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
