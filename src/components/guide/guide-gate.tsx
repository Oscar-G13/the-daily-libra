import Link from "next/link";

interface GuideGateProps {
  feature?: string;
}

export function GuideGate({ feature }: GuideGateProps) {
  return (
    <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-8">
      <div>
        <span className="text-5xl block mb-4">🌙</span>
        <h1 className="font-serif text-display-xs text-foreground mb-3">
          Guide Studio
        </h1>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          {feature === "guide_studio"
            ? "The Guide Studio is exclusively available to High Priestess and High Priest subscribers. Manage clients, deliver personalized readings, and build your practice — all in one place."
            : "This feature requires the High Priestess or High Priest tier."}
        </p>
      </div>

      <div className="glass-card p-6 space-y-3 text-left">
        <p className="text-xs text-gold/60 uppercase tracking-widest mb-4">
          What you get with the Guide tier
        </p>
        {[
          "Guide Studio with client management dashboard",
          "Invite up to 3 clients (expandable)",
          "Create & deliver custom readings directly to clients",
          "Client transit + chart overview",
          "All standard premium features included",
          "$160 / year",
        ].map((item) => (
          <div key={item} className="flex items-start gap-2.5">
            <span className="text-gold/50 mt-0.5 shrink-0">✦</span>
            <p className="text-sm text-foreground/70">{item}</p>
          </div>
        ))}
      </div>

      <Link
        href="/subscription"
        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Upgrade to Guide Studio →
      </Link>
    </div>
  );
}
