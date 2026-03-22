"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BirthDataStep } from "./birth-data-step";
import { QuizStep } from "./quiz-step";
import { ArchetypeResultStep } from "./archetype-result-step";
import { ProfileSetupStep } from "./profile-setup-step";
import type { QuizResult } from "@/types";

interface OnboardingFlowProps {
  userId: string;
  displayName: string;
}

export type OnboardingStep = "welcome" | "birth-data" | "quiz" | "result" | "profile-setup";

interface OnboardingData {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  timezone: string;
  latitude: number;
  longitude: number;
  quizAnswers: Record<string, string>;
  quizResult?: QuizResult;
  pronouns: string;
  relationshipStatus: string;
  goals: string[];
  tonePreference: string;
}

const STEP_ORDER: OnboardingStep[] = ["welcome", "birth-data", "quiz", "result", "profile-setup"];

export function OnboardingFlow({ userId: _userId, displayName }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [saving, setSaving] = useState(false);

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const progress = (currentStepIndex / (STEP_ORDER.length - 1)) * 100;

  function updateData(updates: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...updates }));
  }

  function nextStep() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1]);
    }
  }

  async function completeOnboarding(finalData: Partial<OnboardingData>) {
    setSaving(true);
    try {
      const mergedData = { ...data, ...finalData };

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedData),
      });

      if (!res.ok) throw new Error("Failed to save onboarding");

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      {step !== "welcome" && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/[0.04]">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-200 to-bronze"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {step === "welcome" && <WelcomeStep displayName={displayName} onNext={nextStep} />}
          {step === "birth-data" && (
            <BirthDataStep
              onNext={(birthData) => {
                updateData(birthData);
                nextStep();
              }}
            />
          )}
          {step === "quiz" && (
            <QuizStep
              onComplete={(answers, result) => {
                updateData({ quizAnswers: answers, quizResult: result });
                nextStep();
              }}
            />
          )}
          {step === "result" && data.quizResult && (
            <ArchetypeResultStep result={data.quizResult} onNext={nextStep} />
          )}
          {step === "profile-setup" && (
            <ProfileSetupStep
              onComplete={(profileData) => completeOnboarding(profileData)}
              saving={saving}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function WelcomeStep({ displayName, onNext }: { displayName: string; onNext: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="font-serif text-6xl block mb-6">⚖</span>
          <h1 className="font-serif text-display-lg text-foreground mb-4">
            Welcome{displayName ? `, ${displayName}` : ""}.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            We&apos;re about to build your Libra profile.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto">
            This is not a standard sign-up. We&apos;re going to ask for your birth data, profile
            your Libra psychology across 12 categories, and assign your archetype. It takes about 5
            minutes.
          </p>
          <button
            onClick={onNext}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity glow-gold"
          >
            Begin
          </button>
        </motion.div>
      </div>
    </div>
  );
}
