"use client";

interface AssessmentProgressProps {
  answeredCount: number;
  totalQuestions: number;
  currentSectionName: string;
  currentSectionIndex: number;
  totalSections: number;
}

export function AssessmentProgress({
  answeredCount,
  totalQuestions,
  currentSectionName,
  currentSectionIndex,
  totalSections,
}: AssessmentProgressProps) {
  const percent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-obsidian/80 backdrop-blur-md border-b border-white/[0.04]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-foreground/70">{currentSectionName}</p>
          <p className="text-xs text-muted-foreground">
            {currentSectionIndex + 1} / {totalSections}
          </p>
        </div>
        <div className="h-0.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-200 to-bronze transition-all duration-500 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
