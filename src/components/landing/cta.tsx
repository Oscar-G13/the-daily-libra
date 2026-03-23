"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function LandingCTA() {
  return (
    <section className="relative z-10 px-6 pb-28 pt-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-plum/[0.18] blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pricing-cta-panel relative"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold/65">Start Here</p>
          <h2 className="font-serif text-display-md text-foreground md:text-display-lg">
            Build the profile first.
            <span className="block italic text-gold-gradient">
              Choose the tier that fits after.
            </span>
          </h2>
          <p className="mx-auto mb-10 mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Your chart, your archetype, and your first reading are enough to begin. Premium and High
            Priestess are there when you want the deeper layer.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-gold-200 via-[#dfc063] to-bronze px-10 py-4 text-base font-semibold text-obsidian transition-opacity hover:opacity-90 glow-gold"
          >
            Start Your Libra Profile
            <span>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
