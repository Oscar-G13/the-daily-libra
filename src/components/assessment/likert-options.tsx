"use client";

import { cn } from "@/lib/utils";
import type { AssessmentOption } from "@/types/assessment";

const LIKERT_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

interface LikertOptionsProps {
  options: AssessmentOption[];
  onSelect: (option: AssessmentOption, numericResponse: number) => void;
  disabled?: boolean;
}

export function LikertOptions({ options, onSelect, disabled }: LikertOptionsProps) {
  const sorted = [...options].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col gap-2 w-full sm:flex-row sm:gap-3 sm:justify-center">
      {sorted.map((option, i) => (
        <button
          key={option.id}
          onClick={() => onSelect(option, option.numeric_value)}
          disabled={disabled}
          className={cn(
            "group flex flex-row sm:flex-col items-center gap-3 sm:gap-2 px-4 py-3 sm:px-3 sm:py-4 rounded-xl border transition-all duration-200 text-left sm:text-center sm:w-[5.5rem] sm:min-h-[5.5rem] sm:justify-center",
            "border-white/[0.08] bg-white/[0.02] hover:border-gold/30 hover:bg-gold/5",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <span className="text-lg font-serif text-foreground/60 group-hover:text-gold/70 transition-colors shrink-0 sm:block">
            {option.numeric_value}
          </span>
          <span className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors leading-tight">
            {LIKERT_LABELS[i] ?? option.label}
          </span>
        </button>
      ))}
    </div>
  );
}
