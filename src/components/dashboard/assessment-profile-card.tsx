interface AssessmentProfileCardProps {
  archetypeLabel: string | null;
  archetypeSubtitle: string | null;
}

export function AssessmentProfileCard({
  archetypeLabel,
  archetypeSubtitle,
}: AssessmentProfileCardProps) {
  if (!archetypeLabel) return null;

  return (
    <div className="glass-card p-5 border-gold/10">
      <p className="text-xs text-gold/50 uppercase tracking-widest mb-2">Your Archetype</p>
      <p className="font-serif text-lg text-gold-gradient">{archetypeLabel}</p>
      {archetypeSubtitle && (
        <p className="text-xs text-muted-foreground italic mt-1">{archetypeSubtitle}</p>
      )}
    </div>
  );
}
