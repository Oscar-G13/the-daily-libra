"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUIZ_QUESTIONS } from "@/lib/astrology/archetypes";
import { calculateArchetype } from "@/lib/astrology/archetypes";
import type { QuizResult } from "@/types";

interface QuizStepProps {
  onComplete: (answers: Record<string, string>, result: QuizResult) => void;
}

export function QuizStep({ onComplete }: QuizStepProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const question = QUIZ_QUESTIONS[currentQ];
  const isLast = currentQ === QUIZ_QUESTIONS.length - 1;

  function selectOption(optionId: string) {
    if (transitioning) return;
    setSelected(optionId);
  }

  function handleNext() {
    if (!selected || transitioning) return;
    setTransitioning(true);

    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (isLast) {
        const result = calculateArchetype(newAnswers);
        onComplete(newAnswers, result);
      } else {
        setCurrentQ((q) => q + 1);
        setSelected(null);
        setTransitioning(false);
      }
    }, 300);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>Step 2 of 4 — Libra Archetype Quiz</span>
            <span>
              {currentQ + 1} / {QUIZ_QUESTIONS.length}
            </span>
          </div>
          <div className="h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-200 to-bronze"
              animate={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-gold/50 uppercase tracking-widest mb-3">
              {question.category}
            </p>
            <h2 className="font-serif text-display-xs text-foreground mb-8 leading-snug">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectOption(option.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm leading-relaxed ${
                    selected === option.id
                      ? "border-gold/40 bg-gold/5 text-foreground"
                      : "border-white/[0.06] text-muted-foreground hover:border-white/10 hover:text-foreground bg-white/[0.02]"
                  }`}
                >
                  <span className="text-gold/40 mr-3 font-serif">
                    {String.fromCharCode(65 + question.options.indexOf(option))}.
                  </span>
                  {option.text}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!selected || transitioning}
              className="mt-8 w-full py-3.5 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity disabled:opacity-30 text-sm"
            >
              {isLast ? "Reveal My Archetype →" : "Continue →"}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
