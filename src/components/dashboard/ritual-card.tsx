"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DAILY_RITUALS = [
  {
    theme: "Balance",
    items: [
      { label: "Today's energy", value: "Lean into stillness before decisions." },
      { label: "What to lean toward", value: "A conversation you've been avoiding — gently." },
      { label: "What to avoid", value: "Overcommitting to keep the peace." },
      { label: "Beauty ritual", value: "Wear or hold something gold today." },
      { label: "Mirror affirmation", value: "I am allowed to want what I want." },
      { label: "Journal prompt", value: "Where am I giving more than I receive?" },
    ],
  },
  {
    theme: "Clarity",
    items: [
      { label: "Today's energy", value: "Mental clarity arrives when you stop seeking permission." },
      { label: "What to lean toward", value: "One decision you've been deferring." },
      { label: "What to avoid", value: "Asking for opinions on something you already know." },
      { label: "Beauty ritual", value: "Declutter one physical space today." },
      { label: "Mirror affirmation", value: "My instincts are trustworthy." },
      { label: "Journal prompt", value: "What am I pretending not to know?" },
    ],
  },
];

interface RitualCardProps {
  userId: string;
}

export function RitualCard({ userId: _userId }: RitualCardProps) {
  const [ritual, setRitual] = useState(DAILY_RITUALS[0]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Rotate ritual based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    setRitual(DAILY_RITUALS[dayOfYear % DAILY_RITUALS.length]);
  }, []);

  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Daily Ritual</p>
        <span className="text-lg">🕯️</span>
      </div>

      <p className="text-xs text-gold/60 mb-3">Theme: {ritual.theme}</p>

      <div className="space-y-2.5 flex-1">
        {ritual.items.slice(0, expanded ? ritual.items.length : 3).map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs"
          >
            <span className="text-muted-foreground">{item.label}: </span>
            <span className="text-foreground/80">{item.value}</span>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-4 text-xs text-gold/60 hover:text-gold transition-colors text-left"
      >
        {expanded ? "Show less" : "Show full ritual →"}
      </button>
    </div>
  );
}
