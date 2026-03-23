import Link from "next/link";

export function AssessmentCTA() {
  return (
    <div className="glass-card p-5 border-gold/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs text-gold/60 uppercase tracking-widest mb-1">Deep Profile</p>
        <p className="text-sm text-foreground/85 leading-relaxed">
          Your readings are running on archetypes alone. Take the 15-minute assessment to unlock
          readings that actually know you.
        </p>
      </div>
      <Link
        href="/assessment"
        className="shrink-0 px-5 py-2.5 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        Take the assessment
      </Link>
    </div>
  );
}
