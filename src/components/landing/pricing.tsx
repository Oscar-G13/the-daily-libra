"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BILLING_PLANS, FREE_PLAN, type BillingPlanKey } from "@/lib/billing/catalog";

const PAID_PLAN_LAYOUT: Array<{
  key: BillingPlanKey;
  desktopOrder: string;
  cardClassName: string;
}> = [
  {
    key: "premium_annual",
    desktopOrder: "md:order-2",
    cardClassName: "pricing-card pricing-card-hero pricing-card-premium-yearly",
  },
  {
    key: "premium_monthly",
    desktopOrder: "md:order-1",
    cardClassName: "pricing-card pricing-card-premium-monthly",
  },
  {
    key: "high_priestess_annual",
    desktopOrder: "md:order-3",
    cardClassName: "pricing-card pricing-card-high-priestess",
  },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="relative z-10 px-6 pb-10 pt-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="editorial-pill mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
            3-day free trial on every paid plan
          </span>
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-gold/60">Pricing</p>
          <h2 className="font-serif text-display-md text-foreground md:text-display-lg">
            The paid experience should feel
            <span className="block italic text-gold-gradient">as intentional as the product.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Start free, then step into the tier that matches your depth. Premium is built for daily
            ritual. High Priestess is built for people guiding others through theirs.
          </p>
        </motion.div>

        <div className="pricing-stage mt-14 md:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-6 flex max-w-fit items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs tracking-[0.24em] text-muted-foreground"
          >
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/50" />
            Paid plans centered around Premium Yearly
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/50" />
          </motion.div>

          <div className="grid items-end gap-6 md:grid-cols-3">
            {PAID_PLAN_LAYOUT.map(({ key, desktopOrder, cardClassName }, index) => {
              const plan = BILLING_PLANS[key];
              const isHero = key === "premium_annual";
              const isHighPriestess = plan.tier === "high_priestess";

              return (
                <motion.article
                  key={plan.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * (index + 1) }}
                  className={`${cardClassName} ${desktopOrder}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-[11px] uppercase tracking-[0.28em] ${
                        isHighPriestess ? "text-violet-200/80" : "text-gold/70"
                      }`}
                    >
                      {isHero ? "Premium Favorite" : plan.shortLabel}
                    </p>
                    {plan.badge && (
                      <span
                        className={`pricing-badge ${
                          isHighPriestess ? "pricing-badge-priestess" : "pricing-badge-premium"
                        }`}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-7 text-center">
                    <h3 className="font-serif text-3xl text-foreground md:text-[2.2rem]">
                      {plan.shortLabel}
                    </h3>
                    <div className="mt-6 flex items-end justify-center gap-2">
                      <span
                        className={`font-serif text-5xl leading-none md:text-6xl ${
                          isHighPriestess ? "text-violet-100" : "text-gold-gradient"
                        }`}
                      >
                        {plan.displayPrice}
                      </span>
                      <span className="pb-1 text-lg text-muted-foreground">
                        {plan.renewalLabel}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {plan.trialDays}-day trial, then {plan.displayPrice}
                      {plan.renewalLabel}
                    </p>
                    {plan.monthlyEquivalent && (
                      <p className="mt-1 text-sm text-muted-foreground/70">
                        {plan.monthlyEquivalent}
                      </p>
                    )}
                  </div>

                  <p className="mx-auto mt-7 max-w-xs text-center text-sm leading-relaxed text-foreground/75">
                    {plan.landingTagline ?? plan.tagline}
                  </p>

                  <ul className="mt-8 flex-1 space-y-3">
                    {(plan.landingFeatures ?? plan.features).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-foreground/82"
                      >
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            isHighPriestess ? "text-violet-300" : "text-gold"
                          }`}
                        />
                        <span className="text-balance">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className={`mt-8 block rounded-full px-6 py-4 text-center text-base font-semibold transition-all ${
                      isHighPriestess
                        ? "border border-violet-400/25 bg-violet-500/[0.12] text-violet-50 hover:bg-violet-500/20"
                        : isHero
                          ? "bg-gradient-to-r from-gold-200 via-[#dfc063] to-bronze text-obsidian shadow-[0_18px_50px_rgba(201,168,76,0.2)] hover:opacity-92"
                          : "border border-gold/20 bg-gold/[0.08] text-gold-100 hover:bg-gold/[0.14]"
                    }`}
                  >
                    Start {plan.shortLabel} Trial
                  </Link>
                </motion.article>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="pricing-free-card mt-8"
          >
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground/80">
                Free Entry
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-serif text-4xl text-foreground">
                  {FREE_PLAN.displayPrice}
                </span>
                <span className="pb-1 text-base text-muted-foreground">
                  {FREE_PLAN.renewalLabel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Start with the core Daily Libra ritual, then step up when you want memory, unlimited
                tools, and deeper chart-driven guidance.
              </p>
            </div>

            <div className="flex flex-1 flex-wrap gap-2">
              {FREE_PLAN.highlights.map((feature) => (
                <span key={feature} className="pricing-free-chip">
                  {feature}
                </span>
              ))}
            </div>

            <Link
              href="/signup"
              className="shrink-0 rounded-full border border-white/10 px-6 py-3 text-center text-sm font-medium text-foreground transition-colors hover:border-gold/30 hover:text-gold-100"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
