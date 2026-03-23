"use client";

import { cn } from "@/lib/utils";
import type { AssessmentOption } from "@/types/assessment";

interface ChoiceOptionsProps {
  options: AssessmentOption[];
  onSelect: (option: AssessmentOption) => void;
  disabled?: boolean;
}

export function ChoiceOptions({ options, onSelect, disabled }: ChoiceOptionsProps) {
  const sorted = [...options].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col gap-3 w-full max-w-lg mx-auto">
      {sorted.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={cn(
            "w-full px-5 py-4 rounded-xl border text-left transition-all duration-200",
            "border-white/[0.08] bg-white/[0.02]",
            "hover:border-gold/30 hover:bg-gold/5 hover:text-foreground",
            "text-sm text-foreground/80 leading-relaxed",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
