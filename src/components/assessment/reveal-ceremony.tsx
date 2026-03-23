"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { RadarChart } from "./radar-chart";
import { PsycheGlobe } from "./psyche-globe";
import type { ProfileSummary, TraitScore } from "@/types/assessment";

type RevealStage = "archetype" | "summary" | "traits" | "cta";

interface RevealCeremonyProps {
  profile: ProfileSummary;
  traitScores: Record<string, TraitScore>;
}

const SUMMARY_BLOCKS: { key: keyof ProfileSummary; label: string }[] = [
  { key: "profile_summary", label: "Overview" },
  { key: "relational_summary", label: "In Relationships" },
  { key: "emotional_summary", label: "Emotional World" },
  { key: "ritual_summary", label: "Self-Care" },
];

// Globe clip-path values
const CLIP = {
  full: "circle(150% at 50% 50%)",
  corner: "circle(68px at calc(100% - 76px) 76px)",
  explode: "circle(250% at calc(100% - 76px) 76px)",
};

export function RevealCeremony({ profile, traitScores }: RevealCeremonyProps) {
  const [stage, setStage] = useState<RevealStage>("archetype");
  const [exploding, setExploding] = useState(false);
  const router = useRouter();

  // Auto-advance archetype → summary after 4s
  useEffect(() => {
    if (stage !== "archetype") return;
    const t = setTimeout(() => setStage("summary"), 4000);
    return () => clearTimeout(t);
  }, [stage]);

  const handleEnterDashboard = () => {
    setExploding(true);
    setTimeout(() => router.push("/dashboard"), 900);
  };

  const clipPath = exploding ? CLIP.explode : stage === "archetype" ? CLIP.full : CLIP.corner;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* PsycheGlobe — single canvas, clip-path morphs from full-screen → corner orb */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        animate={{
          clipPath,
          opacity: exploding ? 0 : 1,
        }}
        transition={{
          clipPath: {
            duration: exploding ? 0.65 : 1.0,
            ease: "easeInOut",
          },
          opacity: {
            duration: 0.5,
            delay: exploding ? 0.3 : 0,
          },
        }}
      >
        <PsycheGlobe className="w-full h-full" />
      </motion.div>

      {/* Orb ring — appears when globe collapses to corner */}
      <AnimatePresence>
        {stage !== "archetype" && !exploding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="fixed z-1 pointer-events-none rounded-full"
            style={{
              top: 8,
              right: 8,
              width: 136,
              height: 136,
              border: "1px solid rgba(196,160,90,0.22)",
              boxShadow: "0 0 24px rgba(196,160,90,0.1)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Content layer */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* ── Stage 1: Archetype ── */}
            {stage === "archetype" && (
              <motion.div
                key="archetype"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.06 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-center space-y-5"
              >
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-xs text-gold/50 uppercase tracking-widest"
                >
                  Your Archetype
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 1.1, ease: "easeOut" }}
                  className="font-serif text-5xl sm:text-6xl text-gold-gradient leading-tight"
                >
                  {profile.archetype_label}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.7 }}
                  className="text-base text-foreground/70 italic"
                >
                  {profile.archetype_subtitle}
                </motion.p>
              </motion.div>
            )}

            {/* ── Stage 2: Summary ── */}
            {stage === "summary" && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 sm:p-10 space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-center"
                >
                  <p className="text-xs text-gold/50 uppercase tracking-widest mb-2">
                    Your Profile
                  </p>
                  <h2 className="font-serif text-2xl text-gold-gradient">
                    {profile.archetype_label}
                  </h2>
                </motion.div>

                <div className="space-y-6">
                  {SUMMARY_BLOCKS.map(({ key, label }, i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.14, duration: 0.5 }}
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                        {label}
                      </p>
                      <p className="text-sm text-foreground/85 leading-relaxed">
                        {profile[key] as string}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  onClick={() => setStage("traits")}
                  className="w-full py-3 rounded-xl border border-gold/20 text-xs text-gold/60 hover:border-gold/40 hover:text-gold/80 transition-all"
                >
                  See your trait map →
                </motion.button>
              </motion.div>
            )}

            {/* ── Stage 3: Traits ── */}
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

                <RadarChart traitScores={traitScores} />

                <button
                  onClick={() => setStage("cta")}
                  className="w-full py-3 rounded-xl border border-gold/20 text-xs text-gold/60 hover:border-gold/40 hover:text-gold/80 transition-all"
                >
                  Continue →
                </button>
              </motion.div>
            )}

            {/* ── Stage 4: CTA ── */}
            {stage === "cta" && (
              <motion.div
                key="cta"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: exploding ? 0 : 1, scale: exploding ? 0.92 : 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="relative inline-block"
                >
                  <div className="absolute -inset-4 rounded-full bg-gold/5 blur-xl animate-pulse" />
                  <p className="relative text-5xl">✦</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="space-y-3"
                >
                  <h2 className="font-serif text-2xl text-foreground">Your profile is ready.</h2>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Every reading and reflection from here on is built around who you actually are.
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={handleEnterDashboard}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Enter your dashboard
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
