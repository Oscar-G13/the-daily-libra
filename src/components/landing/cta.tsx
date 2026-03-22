"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function LandingCTA() {
  return (
    <section className="relative z-10 py-24 px-6">
      <div className="container max-w-3xl mx-auto text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-plum/20 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <span className="font-serif text-5xl block mb-6">⚖</span>
          <h2 className="font-serif text-display-lg text-foreground mb-4">
            Your chart.{" "}
            <span className="text-gold-gradient italic">Your contradictions.</span>{" "}
            Your balance.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Start free. Discover your Libra archetype in 5 minutes. Get your first AI reading today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-base hover:opacity-90 transition-opacity glow-gold"
          >
            Start Your Libra Profile
            <span>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
