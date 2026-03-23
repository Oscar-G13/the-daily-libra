"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BILLING_PLAN_ORDER, BILLING_PLANS, FREE_PLAN } from "@/lib/billing/catalog";

export function LandingPricing() {
  return (
    <section id="pricing" className="relative z-10 px-6 py-24">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-widest text-gold/60">Pricing</p>
          <h2 className="font-serif text-display-md text-foreground">
            Start free.{" "}
            <span className="italic text-gold-gradient">Choose the depth you want.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            Every paid plan starts with a 3-day trial. The front page now matches the live offers in
            Stripe: $5/month, $40/year, and High Priestess at $160/year.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-7"
          >
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
              {FREE_PLAN.label}
            </p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="font-serif text-3xl text-foreground">{FREE_PLAN.displayPrice}</span>
              <span className="text-sm text-muted-foreground">{FREE_PLAN.renewalLabel}</span>
            </div>
            <ul className="mb-8 space-y-3">
              {FREE_PLAN.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/50" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block rounded-full border border-white/10 px-6 py-3 text-center text-sm text-foreground transition-colors hover:border-gold/30"
            >
              Get Started Free
            </Link>
          </motion.div>

          {BILLING_PLAN_ORDER.map((planKey, index) => {
            const plan = BILLING_PLANS[planKey];
            const isHighPriestess = plan.tier === "high_priestess";

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * (index + 1) }}
                className={
                  isHighPriestess ? "glass-card border-violet-400/20 p-7" : "premium-border"
                }
              >
                <div className={isHighPriestess ? "space-y-4" : "premium-border-inner p-7"}>
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-xs uppercase tracking-widest ${
                        isHighPriestess ? "text-violet-200/80" : "text-gold/70"
                      }`}
                    >
                      {plan.shortLabel}
                    </p>
                    {plan.badge && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] ${
                          isHighPriestess
                            ? "border-violet-400/20 bg-violet-500/10 text-violet-200"
                            : "border-gold/20 bg-gold/10 text-gold-200"
                        }`}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`font-serif text-3xl ${
                          isHighPriestess ? "text-violet-200" : "text-gold-gradient"
                        }`}
                      >
                        {plan.displayPrice}
                      </span>
                      <span className="text-sm text-muted-foreground">{plan.renewalLabel}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {plan.trialDays}-day trial, then {plan.displayPrice}
                      {plan.renewalLabel}
                    </p>
                    {plan.monthlyEquivalent && (
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {plan.monthlyEquivalent}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-foreground/75">{plan.tagline}</p>

                  <ul className="space-y-3">
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

                  <Link
                    href="/signup"
                    className={`block rounded-full px-6 py-3 text-center text-sm font-semibold transition-all ${
                      isHighPriestess
                        ? "border border-violet-400/20 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20"
                        : "bg-gradient-to-r from-gold-200 to-bronze text-obsidian hover:opacity-90"
                    }`}
                  >
                    Start {plan.shortLabel} Trial
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
