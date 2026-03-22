import Link from "next/link";
import { cn } from "@/lib/utils";

const actions = [
  { label: "Love Reading", href: "/reading/love", icon: "♥️", premium: true },
  { label: "Career Reading", href: "/reading/career", icon: "⚖️", premium: true },
  { label: "Shadow Work", href: "/reading/shadow", icon: "🌑", premium: true },
  { label: "AI Companion", href: "/companion", icon: "🪞", premium: false },
  { label: "Journal", href: "/journal", icon: "📖", premium: false },
  { label: "Birth Chart", href: "/chart", icon: "🌙", premium: false },
];

interface QuickActionsProps {
  tier: string;
}

export function QuickActions({ tier }: QuickActionsProps) {
  const isPremium = tier === "premium";

  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Quick Access</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => {
          const locked = action.premium && !isPremium;
          return (
            <Link
              key={action.href}
              href={locked ? "/subscription" : action.href}
              className={cn(
                "glass-card p-4 flex flex-col items-center gap-2 text-center group transition-all",
                locked ? "opacity-60" : "hover:border-gold/20"
              )}
            >
              <span className="text-2xl group-hover:scale-105 transition-transform">
                {action.icon}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {action.label}
              </span>
              {locked && <span className="text-[10px] text-gold/50 mt-0.5">Premium</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
