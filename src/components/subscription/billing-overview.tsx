"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BILLING_PLANS, type SubscriptionTier } from "@/lib/billing/catalog";
import type { BillingSummary } from "@/lib/billing/summary";

interface BillingOverviewProps {
  summary: BillingSummary;
  showEmptyState?: boolean;
}

function TierChip({ tier }: { tier: SubscriptionTier }) {
  if (tier === "high_priestess") {
    return (
      <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-violet-200">
        High Priestess
      </span>
    );
  }

  if (tier === "premium") {
    return (
      <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gold-100">
        Premium
      </span>
    );
  }

  return null;
}

export function BillingOverview({ summary, showEmptyState = true }: BillingOverviewProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  async function openPortal() {
    setLoadingPortal(true);
    setPortalError(null);

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Unable to open Stripe billing portal.");
      }

      window.location.href = data.url as string;
    } catch (error) {
      setPortalError(
        error instanceof Error ? error.message : "Unable to open Stripe billing portal."
      );
      setLoadingPortal(false);
    }
  }

  if (!summary.products.length && !showEmptyState) {
    return null;
  }

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Billing</p>
          <p className="text-sm text-foreground/80">
            {summary.products.length
              ? "Your active subscriptions, renewal timing, and Stripe billing controls."
              : "You’re on the free tier. Upgrade anytime to unlock Premium or High Priestess."}
          </p>
        </div>
        <TierChip tier={summary.highestTier} />
      </div>

      {summary.products.length ? (
        <div className="space-y-4">
          {summary.products.map((product) => {
            const plan = product.planKey ? BILLING_PLANS[product.planKey] : null;
            const isHighPriestess = product.tier === "high_priestess";
            const progressWidth = product.progressPercent ?? 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 ${
                  isHighPriestess
                    ? "border-violet-400/20 bg-violet-500/[0.04]"
                    : "border-gold/15 bg-gold/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-lg text-foreground">{product.planLabel}</p>
                      {product.isPrimary && <TierChip tier={product.tier} />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {plan
                        ? `${plan.trialDays}-day trial, then ${plan.displayPrice}${plan.renewalLabel}`
                        : "Paid subscription"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${
                      isHighPriestess
                        ? "border border-violet-400/20 bg-violet-500/10 text-violet-200"
                        : "border border-gold/20 bg-gold/10 text-gold-100"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.stateCopy}</span>
                    <span>
                      {product.daysRemaining === null
                        ? "No end date"
                        : `${product.daysRemaining} days left`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className={`h-full rounded-full ${
                        isHighPriestess
                          ? "bg-gradient-to-r from-violet-300 to-fuchsia-300"
                          : "bg-gradient-to-r from-gold-200 to-bronze"
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {summary.proMemberSince && (
                    <span>
                      Pro member since{" "}
                      {new Date(summary.proMemberSince).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {product.renewalDateCopy && (
                    <span>
                      {product.cancelAtPeriodEnd ? "Access ends" : "Next renewal"}{" "}
                      {product.renewalDateCopy}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm text-foreground/80">Need to change or cancel?</p>
                <p className="text-xs text-muted-foreground">
                  We send billing changes through Stripe so the cancellation path is always visible.
                </p>
              </div>
              <button
                onClick={openPortal}
                disabled={!summary.hasCustomer || loadingPortal}
                className="rounded-full bg-gradient-to-r from-gold-200 to-bronze px-5 py-2.5 text-sm font-semibold text-obsidian transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loadingPortal ? "Opening Stripe..." : "Manage / Cancel in Stripe"}
              </button>
            </div>
            {!summary.hasCustomer && (
              <p className="mt-2 text-xs text-muted-foreground">
                Stripe customer data has not synced yet for this account.
              </p>
            )}
            {portalError && <p className="mt-2 text-xs text-red-300/80">{portalError}</p>}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-muted-foreground">
          <p>No active paid products yet.</p>
          <a
            href="/subscription"
            className="mt-3 inline-flex rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-sm text-gold transition-all hover:bg-gold/15"
          >
            View plans
          </a>
        </div>
      )}
    </div>
  );
}
