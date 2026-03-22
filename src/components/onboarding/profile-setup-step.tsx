"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TONE_LABELS } from "@/types";
import type { ReadingTone } from "@/types";

const PRONOUNS = ["she/her", "he/him", "they/them", "she/they", "he/they", "prefer not to say"];

const GOALS = [
  "Love & relationships",
  "Career & purpose",
  "Self-confidence",
  "Healing",
  "Better decisions",
  "Setting boundaries",
  "Friendships",
  "Creativity",
];

const TONES: ReadingTone[] = ["gentle", "blunt", "poetic", "practical", "seductive"];

interface ProfileSetupData {
  pronouns: string;
  relationshipStatus: string;
  goals: string[];
  tonePreference: string;
}

interface ProfileSetupStepProps {
  onComplete: (data: ProfileSetupData) => void;
  saving: boolean;
}

export function ProfileSetupStep({ onComplete, saving }: ProfileSetupStepProps) {
  const [pronouns, setPronouns] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [tone, setTone] = useState<ReadingTone>("gentle");

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function handleSubmit() {
    onComplete({
      pronouns,
      relationshipStatus,
      goals: selectedGoals,
      tonePreference: tone,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-widest text-gold/60 mb-2">Final Step</p>
          <h2 className="font-serif text-display-sm text-foreground mb-2">A few more things.</h2>
          <p className="text-sm text-muted-foreground mb-8">All optional — but they make your readings sharper.</p>

          {/* Pronouns */}
          <div className="mb-7">
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Pronouns</label>
            <div className="flex flex-wrap gap-2">
              {PRONOUNS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPronouns(pronouns === p ? "" : p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    pronouns === p
                      ? "border-gold/40 bg-gold/5 text-gold-200"
                      : "border-white/[0.06] text-muted-foreground hover:border-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Relationship status */}
          <div className="mb-7">
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">
              Current relationship status
            </label>
            <select
              value={relationshipStatus}
              onChange={(e) => setRelationshipStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-gold/40 transition-colors text-sm"
            >
              <option value="">Prefer not to say</option>
              <option value="single">Single</option>
              <option value="dating">Dating</option>
              <option value="in-relationship">In a relationship</option>
              <option value="married">Married</option>
              <option value="healing">Healing from something</option>
              <option value="complicated">It&apos;s complicated</option>
            </select>
          </div>

          {/* Goals */}
          <div className="mb-7">
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">
              What do you want help with most? <span className="normal-case text-muted-foreground/50">(pick all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedGoals.includes(goal)
                      ? "border-gold/40 bg-gold/5 text-gold-200"
                      : "border-white/[0.06] text-muted-foreground hover:border-white/10"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Reading tone */}
          <div className="mb-10">
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">
              How do you want your readings delivered?
            </label>
            <div className="space-y-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                    tone === t
                      ? "border-gold/40 bg-gold/5 text-foreground"
                      : "border-white/[0.06] text-muted-foreground hover:border-white/10"
                  }`}
                >
                  {TONE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 glow-gold"
          >
            {saving ? "Building your profile..." : "Enter The Daily Libra →"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
