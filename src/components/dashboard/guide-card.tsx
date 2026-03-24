import Link from "next/link";

interface GuideCardProps {
  guideName: string;
  guideSlug?: string | null;
  guideRole?: string | null;
  guideTagline?: string | null;
}

export function GuideCard({ guideName, guideSlug, guideRole, guideTagline }: GuideCardProps) {
  const roleLabel = guideRole === "high_priest" ? "High Priest" : "High Priestess";

  return (
    <div className="glass-card px-5 py-4 border border-violet-500/20 bg-violet-500/[0.04]">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-lg">
          🌙
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-violet-400/60 uppercase tracking-widest mb-0.5">
            Your {roleLabel}
          </p>
          {guideSlug ? (
            <Link
              href={`/guides/${guideSlug}`}
              className="text-sm font-medium text-violet-200 hover:text-violet-100 transition-colors leading-snug"
            >
              {guideName}
            </Link>
          ) : (
            <p className="text-sm font-medium text-violet-200 leading-snug">{guideName}</p>
          )}
          {guideTagline && (
            <p className="text-xs text-violet-300/50 mt-0.5 truncate">{guideTagline}</p>
          )}
        </div>

        {/* Link to guidance inbox */}
        <Link
          href="/guidance"
          className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors"
        >
          My Readings →
        </Link>
      </div>
    </div>
  );
}
