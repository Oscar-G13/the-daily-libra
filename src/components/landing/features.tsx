"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "🔮",
    title: "AI Reading Engine",
    description:
      "Daily, love, career, shadow, and 9 other reading types — all generated from your birth chart, archetype, and stored emotional context. Not slop. Not filler.",
  },
  {
    icon: "♎",
    title: "Libra Archetype System",
    description:
      "10 primary archetypes. 8 secondary modifiers. A quiz that actually profiles your Libra psychology — not just your birthday.",
  },
  {
    icon: "🌙",
    title: "Natal Chart Breakdown",
    description:
      "Venus, Moon, Rising, Mercury, Mars, seventh house — the placements that matter most for Libra. In plain language. No wall of symbols.",
  },
  {
    icon: "♾️",
    title: "Compatibility Lab",
    description:
      "Enter anyone's birth data. Get a narrative analysis of attraction, conflict risk, chemistry patterns, and where you might over-give.",
  },
  {
    icon: "🪞",
    title: "AI Reflection Companion",
    description:
      "Ask about love, your ex, a decision, your patterns, your chart. Get responses that reference your actual profile — not generic astrology.",
  },
  {
    icon: "📖",
    title: "Mood-Linked Journal",
    description:
      "Write, tag moods, save readings. Over time, the AI notices patterns across your entries — and tells you what it sees.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative z-10 py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-gold/60 mb-4">What it does</p>
          <h2 className="font-serif text-display-md text-foreground">
            Not a horoscope app.
            <br />
            <span className="text-gold-gradient italic">An identity companion.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card p-6 group hover:border-gold/20 transition-colors"
            >
              <span className="text-3xl mb-4 block">{feature.icon}</span>
              <h3 className="font-serif text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
