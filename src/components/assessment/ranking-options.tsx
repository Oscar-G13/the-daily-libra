"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AssessmentOption } from "@/types/assessment";

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

interface RankingOptionsProps {
  options: AssessmentOption[];
  onSubmit: (rankedValueKeys: string[]) => void;
  disabled?: boolean;
}

export function RankingOptions({ options, onSubmit, disabled }: RankingOptionsProps) {
  const sorted = [...options].sort((a, b) => a.sort_order - b.sort_order);
  const [ranked, setRanked] = useState<AssessmentOption[]>([]);

  const unranked = sorted.filter((o) => !ranked.find((r) => r.id === o.id));

  function handleTap(option: AssessmentOption) {
    if (ranked.find((r) => r.id === option.id)) return;
    setRanked((prev) => [...prev, option]);
  }

  function handleRemove(option: AssessmentOption) {
    setRanked((prev) => prev.filter((r) => r.id !== option.id));
  }

  function handleSubmit() {
    onSubmit(ranked.map((r) => r.value_key));
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      <p className="text-xs text-muted-foreground text-center">
        Tap to rank from most to least important
      </p>

      {/* Ranked list */}
      {ranked.length > 0 && (
        <div className="space-y-2">
          {ranked.map((option, i) => (
            <div
              key={option.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gold/20 bg-gold/5"
            >
              <span className="text-xs text-gold/60 font-medium w-8 shrink-0">{ORDINALS[i]}</span>
              <span className="text-sm text-foreground flex-1">{option.label}</span>
              <button
                onClick={() => handleRemove(option)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                disabled={disabled}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Unranked options */}
      {unranked.length > 0 && (
        <div className="space-y-2">
          {unranked.map((option) => (
            <button
              key={option.id}
              onClick={() => handleTap(option)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200",
                "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
                "text-sm text-foreground/70 hover:text-foreground",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <span className="text-xs text-muted-foreground/40 w-8 shrink-0">
                {ORDINALS[ranked.length]}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Confirm button — show when all are ranked */}
      {unranked.length === 0 && ranked.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-200 to-bronze text-obsidian text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Confirm ranking
        </button>
      )}
    </div>
  );
}
