"use client";

import { motion } from "framer-motion";
import { ARCHETYPE_DESCRIPTIONS } from "@/lib/astrology/archetypes";
import { ARCHETYPE_LABELS, MODIFIER_LABELS } from "@/types";
import type { QuizResult } from "@/types";

interface ArchetypeResultStepProps {
  result: QuizResult;
  onNext: () => void;
}

export function ArchetypeResultStep({ result, onNext }: ArchetypeResultStepProps) {
  const archetypeData = ARCHETYPE_DESCRIPTIONS[result.primaryArchetype];
  const archetypeLabel = ARCHETYPE_LABELS[result.primaryArchetype];
  const modifierLabel = MODIFIER_LABELS[result.secondaryModifier];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-plum/25 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <p className="text-xs uppercase tracking-widest text-gold/60 mb-4">
            Your Libra Archetype
          </p>

          <div className="glass-card p-8 mb-6 text-left">
            <div className="text-center mb-6">
              <span className="font-serif text-5xl block mb-3">⚖</span>
              <h2 className="font-serif text-display-md text-gold-gradient mb-2">
                {archetypeLabel}
              </h2>
              <span className="text-xs px-3 py-1 rounded-full border border-gold/20 text-gold/60">
                + {modifierLabel}
              </span>
            </div>

            <p className="font-serif text-lg text-foreground/90 italic text-center mb-6 leading-relaxed">
              &ldquo;{archetypeData.tagline}&rdquo;
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-center">
              {archetypeData.description}
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              {archetypeData.traits.map((trait) => (
                <span
                  key={trait}
                  className="text-xs px-3 py-1 rounded-full border border-white/[0.08] text-muted-foreground bg-white/[0.02]"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Every reading, insight, and reflection you receive will be built around this profile. It
            will evolve as the app learns more about you.
          </p>

          <button
            onClick={onNext}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity glow-gold"
          >
            Continue to My Profile →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
