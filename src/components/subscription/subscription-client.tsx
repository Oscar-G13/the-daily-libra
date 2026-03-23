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

const HP_FEATURES = [
  "Everything in Premium",
  "Guide Studio — manage up to 3 client profiles",
  "Send custom readings directly to clients",
  "Client inbox with read receipts",
  "Birth data + transit tracking per client",
  "Invitation link with your branded profile page",
  "Private notes per client",
  "Reading notification emails to clients",
];

interface SubscriptionClientProps {
  isActive: boolean;
  planName: string | null;
  periodEnd: string | null;
  hasCustomer: boolean;
  tier?: string;
}

export function SubscriptionClient({
  isActive,
  planName,
  periodEnd,
  hasCustomer,
  tier = "free",
}: SubscriptionClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [loadingHP, setLoadingHP] = useState(false);
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

  async function handleHPCheckout() {
    setLoadingHP(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "high_priestess_annual" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Failed to create checkout");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingHP(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Failed to open portal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const periodEndDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-serif text-display-sm text-foreground">
            {isActive ? "Your subscription." : "Go Premium."}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isActive
              ? "Manage your plan, update billing, or cancel anytime."
              : "Unlock the full experience — unlimited readings, memory-aware AI, and everything built for Libras who take their inner life seriously."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-red-300">
            {error}
          </div>
        )}

        {isActive ? (
          /* Active subscriber view */
          <div className={`glass-card p-7 space-y-6 ${tier === "high_priestess" ? "border-violet-500/15" : "border-gold/10"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${tier === "high_priestess" ? "bg-violet-400" : "bg-gold"}`} />
              <p className="text-sm text-foreground/80 font-medium">
                {tier === "high_priestess" ? "High Priestess — Active" : "Premium — Active"}
              </p>
            </div>

            {planName && (
              <p className="text-xs text-muted-foreground capitalize">
                {planName.replace(/_/g, " ")} plan
              </p>
            )}

            {periodEndDate && (
              <p className="text-xs text-muted-foreground">Next renewal: {periodEndDate}</p>
            )}

            {tier === "high_priestess" && (
              <a
                href="/guide"
                className="block text-center py-2.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium hover:bg-violet-500/20 transition-all"
              >
                Open Guide Studio →
              </a>
            )}

            <div className="pt-2 space-y-3">
              {hasCustomer && (
                <button
                  onClick={handlePortal}
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Opening portal..." : "Manage subscription"}
                </button>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Update billing, change plan, or cancel — all in the Stripe portal.
              </p>
            </div>
          </div>
        ) : (
          /* Upgrade view */
          <>
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

            {/* Premium tier card */}
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

            {/* High Priestess tier card */}
            <div className="glass-card p-7 border-violet-500/15 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🌙</span>
                <p className="text-xs uppercase tracking-widest text-violet-400/70">High Priestess</p>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-serif text-3xl text-violet-300">$160</span>
                <span className="text-sm text-muted-foreground">/ year ($13.33/mo)</span>
              </div>
              <p className="text-xs text-muted-foreground/60 mb-5">
                For tarot readers, astrologers, and spiritual coaches who manage clients inside the app.
              </p>

              <ul className="space-y-3 mb-8">
                {HP_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <Check className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleHPCheckout}
                disabled={loadingHP}
                className="w-full py-4 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 font-semibold hover:bg-violet-500/20 transition-all disabled:opacity-50"
              >
                {loadingHP ? "Redirecting..." : "Become a High Priestess"}
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Includes all Premium features. Secure checkout via Stripe.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
