"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Enter your birth data",
    description:
      "Date, time, and city. This powers your natal chart — Venus, Moon, Rising, and every placement that shapes how you love, think, and move.",
  },
  {
    number: "02",
    title: "Take the Libra archetype quiz",
    description:
      "12 categories. 7 questions. Profiling your decision style, attachment patterns, conflict avoidance, validation needs, and more. Not cheesy. Not fast.",
  },
  {
    number: "03",
    title: "Get your archetype",
    description:
      "One primary archetype. One secondary modifier. A profile built around who you actually are as a Libra — not the average Libra.",
  },
  {
    number: "04",
    title: "The app learns you over time",
    description:
      "Journal entries, mood logs, what you ask the AI, what you save — all of it builds an evolving model that makes every reading sharper than the last.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="relative z-10 py-24 px-6">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-gold/60 mb-4">
            Personalization that actually works
          </p>
          <h2 className="font-serif text-display-md text-foreground">
            Four layers of knowing you.
          </h2>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 flex gap-6 items-start"
            >
              <span className="font-serif text-3xl text-gold/20 shrink-0 w-12">{step.number}</span>
              <div>
                <h3 className="font-serif text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
