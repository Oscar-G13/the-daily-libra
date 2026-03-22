"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PREMIUM_FEATURES = [
  "Unlimited AI readings — all 13 categories",
  "Full birth chart breakdown + Venus deep dive",
  "Memory-aware AI reflections",
  "Compatibility Lab — unlimited",
  "Decision Decoder",
  "Unlimited journal + AI trend analysis",
  "All 5 reading style modes",
  "Advanced ritual plans",
  "Shareable premium cards",
  "Mood tracking + pattern insights",
];

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan === "monthly" ? "premium_monthly" : "premium_annual",
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Failed to create checkout");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-serif text-display-sm text-foreground">Go Premium.</h1>
          <p className="text-muted-foreground mt-2">
            Unlock the full experience — unlimited readings, memory-aware AI, and everything built
            for Libras who take their inner life seriously.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Plan toggle */}
        <div className="glass-card p-1 flex rounded-full w-fit mb-8">
          {(["monthly", "annual"] as const).map((plan) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedPlan === plan
                  ? "bg-gradient-to-r from-gold-200 to-bronze text-obsidian"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {plan === "monthly" ? "Monthly — $12/mo" : "Annual — $8/mo ✦ Save 33%"}
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="glass-card p-7 mb-6 border-gold/10">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-serif text-3xl text-gold-gradient">
              {selectedPlan === "monthly" ? "$12" : "$96"}
            </span>
            <span className="text-sm text-muted-foreground">
              {selectedPlan === "monthly" ? "/ month" : "/ year ($8/mo)"}
            </span>
          </div>
          {selectedPlan === "annual" && (
            <p className="text-xs text-gold/60 mb-6">Billed annually. Cancel anytime.</p>
          )}

          <ul className="space-y-3 mb-8">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 glow-gold"
          >
            {loading ? "Redirecting to checkout..." : "Unlock Premium"}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Secure checkout via Stripe. Cancel anytime.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
