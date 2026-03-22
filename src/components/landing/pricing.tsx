"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const freeTier = {
  name: "Free",
  price: "$0",
  interval: "forever",
  features: [
    "One daily reading",
    "Basic chart summary",
    "Libra archetype result",
    "Limited AI companion (5 messages/day)",
    "3 journal entries/month",
    "1 compatibility check/week",
  ],
};

const premiumTier = {
  name: "Premium",
  price: "$12",
  interval: "/month",
  annualNote: "or $96/year — save 33%",
  features: [
    "Unlimited AI readings (all 13 categories)",
    "Full chart breakdown + Venus deep dive",
    "Memory-aware AI reflections",
    "Compatibility Lab — unlimited",
    "Decision Decoder",
    "Unlimited journal + AI trend analysis",
    "5 reading style modes",
    "Advanced ritual plans",
    "Shareable premium cards",
    "Mood tracking + insights",
  ],
};

export function LandingPricing() {
  return (
    <section id="pricing" className="relative z-10 py-24 px-6">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-widest text-gold/60 mb-4">Pricing</p>
          <h2 className="font-serif text-display-md text-foreground">
            Start free. <span className="text-gold-gradient italic">Go deeper with Premium.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-7"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              {freeTier.name}
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-serif text-3xl text-foreground">{freeTier.price}</span>
              <span className="text-sm text-muted-foreground">{freeTier.interval}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {freeTier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-gold/50 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block text-center px-6 py-3 rounded-full border border-white/10 text-foreground hover:border-gold/30 transition-colors text-sm"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="premium-border"
          >
            <div className="premium-border-inner p-7">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-widest text-gold/70">{premiumTier.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold-200 border border-gold/20">
                  Most Popular
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-3xl text-gold-gradient">{premiumTier.price}</span>
                <span className="text-sm text-muted-foreground">{premiumTier.interval}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{premiumTier.annualNote}</p>
              <ul className="space-y-3 mb-8">
                {premiumTier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center px-6 py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity text-sm glow-gold"
              >
                Start Premium Free Trial
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
