"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { AssessmentSection } from "@/types/assessment";

interface SectionIntroProps {
  section: AssessmentSection;
  sectionNumber: number;
  totalSections: number;
  onContinue: () => void;
}

export function SectionIntro({
  section,
  sectionNumber,
  totalSections,
  onContinue,
}: SectionIntroProps) {
  // Auto-advance after 4s
  useEffect(() => {
    const timer = setTimeout(onContinue, 4000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card p-10 sm:p-14 max-w-lg text-center space-y-5"
      >
        <p className="text-xs text-gold/50 uppercase tracking-widest">
          Section {sectionNumber} of {totalSections}
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl text-foreground">{section.title}</h2>
        {section.subtitle && (
          <p className="text-sm text-foreground/70 italic">{section.subtitle}</p>
        )}
        {section.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{section.description}</p>
        )}
        <button
          onClick={onContinue}
          className="text-xs text-gold/50 hover:text-gold/80 transition-colors pt-2"
        >
          Continue →
        </button>
      </motion.div>
    </div>
  );
}
