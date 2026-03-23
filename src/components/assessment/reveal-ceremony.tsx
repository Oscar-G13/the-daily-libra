"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { TraitMapVisual } from "./trait-map-visual";
import type { ProfileSummary, TraitScore } from "@/types/assessment";

type RevealStage = "archetype" | "summary" | "traits" | "cta";

interface RevealCeremonyProps {
  profile: ProfileSummary;
  traitScores: Record<string, TraitScore>;
}

export function RevealCeremony({ profile, traitScores }: RevealCeremonyProps) {
  const [stage, setStage] = useState<RevealStage>("archetype");
  const router = useRouter();

  // Auto-advance from archetype → summary after 3s
  useEffect(() => {
    if (stage !== "archetype") return;
    const timer = setTimeout(() => setStage("summary"), 3500);
    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {stage === "archetype" && (
            <motion.div
              key="archetype"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <p className="text-xs text-gold/50 uppercase tracking-widest mb-6">
                  Your Archetype
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl text-gold-gradient leading-tight">
                  {profile.archetype_label}
                </h1>
                <p className="text-base text-foreground/70 italic mt-4">
                  {profile.archetype_subtitle}
                </p>
              </motion.div>
            </motion.div>
          )}

          {stage === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-8 sm:p-10 space-y-8"
            >
              <div className="text-center">
                <p className="text-xs text-gold/50 uppercase tracking-widest mb-2">Your Profile</p>
                <h2 className="font-serif text-2xl text-gold-gradient">
                  {profile.archetype_label}
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Overview
                  </p>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {profile.profile_summary}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    In Relationships
                  </p>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {profile.relational_summary}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Emotional World
                  </p>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {profile.emotional_summary}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Self-Care
                  </p>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {profile.ritual_summary}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStage("traits")}
                className="w-full py-3 rounded-xl border border-gold/20 text-xs text-gold/60 hover:border-gold/40 hover:text-gold/80 transition-all"
              >
                See your trait map →
              </button>
            </motion.div>
          )}

          {stage === "traits" && (
            <motion.div
              key="traits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-8 sm:p-10 space-y-6"
            >
              <div className="text-center">
                <p className="text-xs text-gold/50 uppercase tracking-widest mb-2">Trait Map</p>
                <h2 className="font-serif text-xl text-foreground">24 Dimensions</h2>
              </div>

              <TraitMapVisual traitScores={traitScores} />

              <button
                onClick={() => setStage("cta")}
                className="w-full py-3 rounded-xl border border-gold/20 text-xs text-gold/60 hover:border-gold/40 hover:text-gold/80 transition-all"
              >
                Continue →
              </button>
            </motion.div>
          )}

          {stage === "cta" && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <div className="relative inline-block">
                <div className="absolute -inset-4 rounded-full bg-gold/5 blur-xl animate-pulse" />
                <p className="relative text-5xl">✦</p>
              </div>
              <div className="space-y-3">
                <h2 className="font-serif text-2xl text-foreground">Your profile is ready.</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Every reading and reflection from here on is built around who you actually are.
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Enter your dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
