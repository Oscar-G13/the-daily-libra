"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AESTHETIC_QUIZ,
  AESTHETIC_PROFILES,
  scoreAestheticQuiz,
  type QuizChoice,
} from "@/lib/aesthetic/profiles";
import type { AestheticStyle } from "@/types";
import { useGamification } from "@/components/gamification/provider";

// ─── Reveal animation ────────────────────────────────────────────────────────

function RevealCeremony({
  style,
  onComplete,
}: {
  style: AestheticStyle;
  onComplete: () => void;
}) {
  const profile = AESTHETIC_PROFILES[style];
  const [phase, setPhase] = useState<"intro" | "reveal">("intro");

  return (
    <AnimatePresence mode="wait">
      {phase === "intro" ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-16 space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl"
          >
            {profile.icon}
          </motion.div>
          <p className="text-sm text-muted-foreground/60 uppercase tracking-widest">
            Reading your aesthetic signature…
          </p>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            onClick={() => setPhase("reveal")}
            className="px-6 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-all"
          >
            Reveal my aesthetic ✦
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          key="reveal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Style name */}
          <div className={`glass-card p-8 border ${profile.accentClass} space-y-4`}>
            <div className="text-center space-y-3">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-muted-foreground uppercase tracking-widest"
              >
                Your aesthetic identity
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <span className="text-4xl">{profile.icon}</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-serif text-display-sm text-gold-gradient"
              >
                {profile.name}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-serif text-sm italic text-foreground/70"
              >
                &ldquo;{profile.tagline}&rdquo;
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-4 border-t border-white/[0.04]"
            >
              <p className="text-sm text-foreground/75 leading-relaxed text-center">
                {profile.description}
              </p>
            </motion.div>
          </div>

          {/* Traits + palette */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card p-4 space-y-3"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Your traits</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.traits.map((trait) => (
                  <span
                    key={trait}
                    className="text-xs px-2.5 py-1 rounded-full border border-white/[0.07] text-muted-foreground"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card p-4 space-y-3"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Your palette
              </p>
              <p className="text-xs text-foreground/70 leading-relaxed">{profile.palette}</p>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onComplete}
            className="w-full py-3.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-all"
          >
            Save my aesthetic ✦
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main quiz ───────────────────────────────────────────────────────────────

interface AestheticQuizProps {
  existingStyle?: AestheticStyle | null;
  onComplete?: (style: AestheticStyle) => void;
}

export function AestheticQuiz({ existingStyle, onComplete }: AestheticQuizProps) {
  const [phase, setPhase] = useState<"intro" | "quiz" | "scoring" | "reveal" | "saved">(
    existingStyle ? "saved" : "intro"
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AestheticStyle>>({});
  const [result, setResult] = useState<AestheticStyle | null>(existingStyle ?? null);
  const [saving, setSaving] = useState(false);
  const { handleGamificationResult } = useGamification();

  function selectAnswer(choice: QuizChoice) {
    const newAnswers = { ...answers, [AESTHETIC_QUIZ[currentQ].id]: choice.style };
    setAnswers(newAnswers);

    if (currentQ < AESTHETIC_QUIZ.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setPhase("scoring");
      const scored = scoreAestheticQuiz(newAnswers);
      setResult(scored);
      setTimeout(() => setPhase("reveal"), 800);
    }
  }

  async function saveResult() {
    if (!result || saving) return;
    setSaving(true);
    try {
      await fetch("/api/aesthetic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style: result }),
      });

      const xpRes = await fetch("/api/gamification/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "profile_setup" }),
      });
      if (xpRes.ok) {
        const data = await xpRes.json();
        handleGamificationResult(data);
      }

      setPhase("saved");
      onComplete?.(result);
    } finally {
      setSaving(false);
    }
  }

  function retake() {
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setPhase("intro");
  }

  const question = AESTHETIC_QUIZ[currentQ];
  const progress = ((currentQ) / AESTHETIC_QUIZ.length) * 100;
  const profile = result ? AESTHETIC_PROFILES[result] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-display-sm text-foreground">Aesthetic Profile</h1>
        <p className="text-sm text-muted-foreground">
          Discover your Libra aesthetic identity — the visual language that is yours.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Intro */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            <div className="glass-card p-7 space-y-5">
              <div className="text-center space-y-3">
                <p className="text-3xl">♀</p>
                <h2 className="font-serif text-lg text-foreground/90">
                  Your aesthetic is already there.
                </h2>
                <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm mx-auto">
                  Six questions. No right answer. You will be mapped to one of six Libra aesthetic
                  identities — each distinct, each beautiful.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                {Object.values(AESTHETIC_PROFILES).map((p) => (
                  <div
                    key={p.key}
                    className="text-center p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <span className="text-lg block mb-1">{p.icon}</span>
                    <p className="text-xs text-muted-foreground/60 leading-tight">{p.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPhase("quiz")}
              className="w-full py-3.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-all"
            >
              Discover my aesthetic ✦
            </button>
          </motion.div>
        )}

        {/* Quiz */}
        {phase === "quiz" && (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground/50">
                <span>
                  Question {currentQ + 1} of {AESTHETIC_QUIZ.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold/40 rounded-full"
                  initial={{ width: `${progress}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="glass-card p-6 space-y-5">
              <p className="font-serif text-lg text-foreground/90">{question.prompt}</p>
              <div className="space-y-2.5">
                {question.choices.map((choice, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => selectAnswer(choice)}
                    className="w-full text-left p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-gold/[0.05] hover:border-gold/20 transition-all group"
                  >
                    <p className="text-sm text-foreground/85 group-hover:text-foreground transition-colors">
                      {choice.text}
                    </p>
                    {choice.subtext && (
                      <p className="text-xs text-muted-foreground/50 mt-0.5 group-hover:text-muted-foreground/70 transition-colors">
                        {choice.subtext}
                      </p>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Scoring transition */}
        {phase === "scoring" && (
          <motion.div
            key="scoring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4"
          >
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="text-3xl"
            >
              ♀
            </motion.p>
            <p className="text-sm text-muted-foreground/60 uppercase tracking-widest">
              Mapping your aesthetic signature…
            </p>
          </motion.div>
        )}

        {/* Reveal */}
        {phase === "reveal" && result && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <RevealCeremony style={result} onComplete={saveResult} />
            {saving && (
              <p className="text-center text-xs text-muted-foreground/50 mt-2">Saving…</p>
            )}
          </motion.div>
        )}

        {/* Saved / profile view */}
        {phase === "saved" && result && profile && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className={`glass-card p-8 border ${profile.accentClass} space-y-5`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Your aesthetic identity
                  </p>
                  <h2 className="font-serif text-display-xs text-gold-gradient">{profile.name}</h2>
                  <p className="font-serif text-sm italic text-foreground/60">
                    &ldquo;{profile.tagline}&rdquo;
                  </p>
                </div>
                <span className="text-3xl">{profile.icon}</span>
              </div>

              <p className="text-sm text-foreground/75 leading-relaxed">{profile.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.traits.map((trait) => (
                  <span
                    key={trait}
                    className="text-xs px-2.5 py-1 rounded-full border border-white/[0.07] text-muted-foreground"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-white/[0.04]">
                <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-1">
                  Your palette
                </p>
                <p className="text-xs text-foreground/60">{profile.palette}</p>
              </div>
            </div>

            <button
              onClick={retake}
              className="w-full py-3 rounded-xl border border-white/[0.06] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all"
            >
              Retake the quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
