"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BILLING_PLANS } from "@/lib/billing/catalog";
import {
  PREMIUM_FEATURE_LABELS,
  PREMIUM_FEATURE_DESCRIPTIONS,
  type PremiumFeature,
} from "@/lib/premium";

interface PremiumGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  isPremium: boolean;
}

export function PremiumGate({ feature, children, isPremium }: PremiumGateProps) {
  if (isPremium) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none" aria-hidden>
        <div className="blur-sm opacity-40 max-h-64 overflow-hidden">{children}</div>
      </div>

      {/* Gate overlay */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-obsidian/80 backdrop-blur-sm rounded-xl border border-gold/15"
      >
        <div className="text-center space-y-3 max-w-xs">
          <p className="text-2xl">💎</p>
          <h3 className="font-serif text-lg text-foreground">{PREMIUM_FEATURE_LABELS[feature]}</h3>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            {PREMIUM_FEATURE_DESCRIPTIONS[feature]}
          </p>
          <Link
            href="/subscription"
            className="inline-flex items-center gap-1.5 mt-2 px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/25 text-gold text-sm font-medium hover:bg-gold/15 transition-all"
          >
            Start 3-Day Trial ✦
          </Link>
          <p className="text-xs text-muted-foreground/40">
            Premium from {BILLING_PLANS.premium_monthly.displayPrice}
            {BILLING_PLANS.premium_monthly.renewalLabel}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Inline lock badge for nav items or smaller CTAs
export function PremiumBadge() {
  return (
    <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-gold/10 text-gold/70 border border-gold/15 font-medium">
      PRO
    </span>
  );
}

// Full-page premium wall (for page-level gating)
export function PremiumPageGate({ feature }: { feature: PremiumFeature }) {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-5xl"
      >
        💎
      </motion.div>
      <div className="space-y-2">
        <h1 className="font-serif text-display-xs text-foreground">
          {PREMIUM_FEATURE_LABELS[feature]}
        </h1>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          {PREMIUM_FEATURE_DESCRIPTIONS[feature]}
        </p>
      </div>
      <div className="glass-card p-6 space-y-4 text-left">
        <p className="text-xs text-gold/50 uppercase tracking-widest">Premium includes</p>
        <ul className="space-y-2">
          {[
            "All 11 reading categories",
            "Unlimited AI companion sessions",
            "Text Decoder & Red Flag Decoder",
            "Personalized Insight Sessions",
            "Cosmic Room sanctuary",
            "Compatibility Lab (unlimited)",
            "Decision Decoder",
            "Aesthetic Profile",
            "Unlimited journal entries",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-foreground/70">
              <span className="text-gold/50">✦</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Link
        href="/subscription"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gold/10 border border-gold/25 text-gold text-sm font-medium hover:bg-gold/15 transition-all"
      >
        Start 3-Day Trial ✦
      </Link>
      <p className="text-xs text-muted-foreground/40">
        Premium Monthly {BILLING_PLANS.premium_monthly.displayPrice}
        {BILLING_PLANS.premium_monthly.renewalLabel} · Premium Yearly{" "}
        {BILLING_PLANS.premium_annual.displayPrice}
        {BILLING_PLANS.premium_annual.renewalLabel}
      </p>
    </div>
  );
}
