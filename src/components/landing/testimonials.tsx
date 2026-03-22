"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "The archetype result was uncomfortably accurate. I've been showing it to everyone.",
    name: "Aria M.",
    detail: "Velvet Diplomat · Venus in Libra",
  },
  {
    quote:
      "I've tried every astrology app. This is the only one that doesn't feel like it was written for everyone.",
    name: "Jordan R.",
    detail: "Elegant Overthinker · Scorpio Moon",
  },
  {
    quote:
      "The companion remembered what I said about my ex three weeks later and referenced it. I was not ready for that.",
    name: "Celeste T.",
    detail: "Mirror Heart · Rising Libra",
  },
  {
    quote:
      "I came for the daily reading. I stayed because the decision decoder literally helped me leave a situation I'd been stuck in for months.",
    name: "Nadia K.",
    detail: "People Pleaser in Recovery",
  },
];

export function LandingTestimonials() {
  return (
    <section className="relative z-10 py-24 px-6">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-widest text-gold/60 mb-4">
            From Libras who felt seen
          </p>
          <h2 className="font-serif text-display-sm text-foreground">
            The mirror doesn&apos;t flatter you.{" "}
            <span className="text-gold-gradient italic">It sees you.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card p-6"
            >
              <p className="font-serif text-base text-foreground/90 italic leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-gold/50">{t.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
