import Link from "next/link";
import { ARCHETYPE_LABELS, MODIFIER_LABELS } from "@/types";
import { ARCHETYPE_DESCRIPTIONS } from "@/lib/astrology/archetypes";
import type { LibraArchetype, ArchetypeModifier } from "@/types";

interface ArchetypeCardProps {
  archetype: string | null;
  modifier: string | null;
}

export function ArchetypeCard({ archetype, modifier }: ArchetypeCardProps) {
  if (!archetype) {
    return (
      <div className="glass-card p-5 h-full">
        <p className="text-xs text-muted-foreground">Complete your profile to see your archetype.</p>
      </div>
    );
  }

  const archetypeKey = archetype as LibraArchetype;
  const modifierKey = modifier as ArchetypeModifier | null;
  const data = ARCHETYPE_DESCRIPTIONS[archetypeKey];

  return (
    <div className="glass-card p-5 h-full flex flex-col border-gold/10">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Your Archetype</p>

      <div className="flex-1">
        <span className="font-serif text-3xl block mb-3">⚖</span>
        <h3 className="font-serif text-lg text-gold-gradient mb-1">
          {ARCHETYPE_LABELS[archetypeKey]}
        </h3>
        {modifierKey && (
          <p className="text-xs text-gold/50 mb-3">+ {MODIFIER_LABELS[modifierKey]}</p>
        )}
        <p className="font-serif text-sm text-foreground/80 italic leading-relaxed">
          &ldquo;{data.tagline}&rdquo;
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04]">
        <Link href="/profile" className="text-xs text-gold/60 hover:text-gold transition-colors">
          View full profile →
        </Link>
      </div>
    </div>
  );
}
