"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ARCHETYPE_DESCRIPTIONS } from "@/lib/astrology/archetypes";
import { ARCHETYPE_LABELS } from "@/types";
import type { LibraArchetype } from "@/types";

const showcased: LibraArchetype[] = [
  "velvet_diplomat",
  "romantic_strategist",
  "mirror_heart",
  "elegant_overthinker",
  "soft_power_libra",
  "people_pleaser_in_recovery",
];

export function LandingArchetypes() {
  return (
    <section id="archetypes" className="relative z-10 py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-gold/60 mb-4">Who are you, really?</p>
          <h2 className="font-serif text-display-md text-foreground mb-4">
            10 Libra archetypes.{" "}
            <span className="text-gold-gradient italic">One is yours.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our onboarding quiz profiles your Libra psychology across 12 categories and assigns your archetype. Not just a name — a mirror.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {showcased.map((archetype, i) => {
            const data = ARCHETYPE_DESCRIPTIONS[archetype];
            return (
              <motion.div
                key={archetype}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="glass-card p-5 group cursor-default"
              >
                <p className="text-xs text-gold/50 uppercase tracking-widest mb-2">Archetype</p>
                <h3 className="font-serif text-lg text-foreground mb-1">{ARCHETYPE_LABELS[archetype]}</h3>
                <p className="text-sm text-gold/70 italic mb-3">&ldquo;{data.tagline}&rdquo;</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.traits.slice(0, 3).map((trait) => (
                    <span key={trait} className="text-xs px-2 py-0.5 rounded-full border border-white/[0.08] text-muted-foreground">
                      {trait}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-5">+ 4 more archetypes and 8 secondary modifiers</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-gold/30 text-gold-200 hover:bg-gold/5 transition-colors text-sm font-medium"
          >
            Discover Your Archetype
            <span>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
