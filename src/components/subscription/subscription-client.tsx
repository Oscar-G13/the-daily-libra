"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BILLING_PLAN_ORDER, BILLING_PLANS, type BillingPlanKey } from "@/lib/billing/catalog";
import type { BillingSummary } from "@/lib/billing/summary";
import { BillingOverview } from "@/components/subscription/billing-overview";

interface SubscriptionClientProps {
  summary: BillingSummary;
  guideRole?: string | null;
}

export function SubscriptionClient({ summary, guideRole }: SubscriptionClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<BillingPlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activePlanKeys = new Set(
    summary.products
      .map((product) => product.planKey)
      .filter((planKey): planKey is BillingPlanKey => Boolean(planKey))
  );

  async function handleCheckout(planKey: BillingPlanKey) {
    setLoadingPlan(planKey);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Failed to create checkout.");
      }

      window.location.href = data.url as string;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Something went wrong.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 space-y-2">
          <h1 className="font-serif text-display-sm text-foreground">
            {summary.products.length ? "Your billing." : "Choose your plan."}
          </h1>
          <p className="text-muted-foreground">
            {summary.products.length
              ? "Your active products, renewal timing, and cancel path all live here."
              : "All paid plans start with a 3-day trial. Pick the subscription that fits how deeply you want to use the app."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <BillingOverview summary={summary} guideRole={guideRole} />

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Available Plans
              </p>
              <p className="text-sm text-muted-foreground">
                Public pricing and the in-app checkout now reflect the same live offers.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {BILLING_PLAN_ORDER.map((planKey) => {
                const plan = BILLING_PLANS[planKey];
                const isHighPriestess = plan.tier === "high_priestess";
                const isActive = activePlanKeys.has(planKey);

                return (
                  <div
                    key={plan.key}
                    className={`glass-card flex h-full flex-col p-6 ${
                      isHighPriestess ? "border-violet-400/20" : "border-gold/15"
                    }`}
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <p
                          className={`text-xs uppercase tracking-[0.18em] ${
                            isHighPriestess ? "text-violet-200/80" : "text-gold/70"
                          }`}
                        >
                          {plan.shortLabel}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`font-serif text-3xl ${
                              isHighPriestess ? "text-violet-200" : "text-gold-gradient"
                            }`}
                          >
                            {plan.displayPrice}
                          </span>
                          <span className="text-sm text-muted-foreground">{plan.renewalLabel}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {plan.trialDays}-day trial, then {plan.displayPrice}
                          {plan.renewalLabel}
                        </p>
                        {plan.monthlyEquivalent && (
                          <p className="text-xs text-muted-foreground/70">
                            {plan.monthlyEquivalent}
                          </p>
                        )}
                      </div>

                      {isActive ? (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${
                            isHighPriestess
                              ? "border-violet-400/20 bg-violet-500/10 text-violet-200"
                              : "border-gold/20 bg-gold/10 text-gold-100"
                          }`}
                        >
                          Active
                        </span>
                      ) : plan.badge ? (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${
                            isHighPriestess
                              ? "border-violet-400/20 bg-violet-500/10 text-violet-200"
                              : "border-gold/20 bg-gold/10 text-gold-100"
                          }`}
                        >
                          {plan.badge}
                        </span>
                      ) : null}
                    </div>

                    <p className="mb-5 text-sm text-foreground/75">{plan.tagline}</p>

                    <ul className="mb-6 flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-foreground/80"
                        >
                          <Check
                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                              isHighPriestess ? "text-violet-300" : "text-gold"
                            }`}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => !isActive && handleCheckout(plan.key)}
                      disabled={isActive || loadingPlan === plan.key}
                      className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                        isHighPriestess
                          ? "border border-violet-400/20 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20"
                          : "bg-gradient-to-r from-gold-200 to-bronze text-obsidian hover:opacity-90"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {isActive
                        ? "Already active"
                        : loadingPlan === plan.key
                          ? "Redirecting..."
                          : `Start ${plan.shortLabel}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
