"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function LandingHero() {
  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-plum/20 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-bronze/10 blur-[80px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-gold-200 text-xs font-medium tracking-widest uppercase mb-8">
          <span>♎</span>
          <span>Libra Only · AI Powered · Deeply Personal</span>
          <span>♎</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={0.1}
          variants={fadeUp}
          className="font-serif text-display-xl md:text-display-2xl text-foreground leading-tight mb-6"
        >
          Built for Libras.{" "}
          <span className="text-gold-gradient italic">Finally.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          custom={0.2}
          variants={fadeUp}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
        >
          AI readings powered by your birth chart, your archetype, and your actual patterns.
          Not a generic horoscope. A mirror.
        </motion.p>

        {/* CTAs */}
        <motion.div custom={0.3} variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-base hover:opacity-90 transition-all glow-gold"
          >
            Start Your Libra Profile
            <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link
            href="#archetypes"
            className="px-8 py-4 rounded-full border border-white/10 text-muted-foreground hover:text-foreground hover:border-gold/30 transition-all text-base"
          >
            See the Archetypes
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div custom={0.4} variants={fadeUp} className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="text-gold">✦</span>
            Personalized to your chart
          </span>
          <span className="hidden sm:block text-white/10">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-gold">✦</span>
            10 Libra archetypes
          </span>
          <span className="hidden sm:block text-white/10">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-gold">✦</span>
            AI that remembers you
          </span>
        </motion.div>
      </motion.div>

      {/* Preview card floating */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 mt-20 max-w-lg mx-auto reading-card"
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">☀️</span>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Daily Reading · Gentle Tone</p>
            <p className="text-xs text-gold/60">The Velvet Diplomat · Venus in Libra</p>
          </div>
        </div>
        <p className="font-serif text-lg leading-relaxed text-foreground/90 italic">
          &ldquo;Today asks you to stop managing everyone else&apos;s comfort and ask what yours actually requires. Your diplomacy is a gift — but not when it costs you the truth.&rdquo;
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-pulse" />
          <span>Generated from your chart · March 21</span>
        </div>
      </motion.div>
    </section>
  );
}
