"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface JournalPromptsProps {
  onSelect: (prompt: string) => void;
}

export function JournalPrompts({ onSelect }: JournalPromptsProps) {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Cache daily prompts in sessionStorage
    const cached = sessionStorage.getItem("journal-prompts");
    const cachedDate = sessionStorage.getItem("journal-prompts-date");
    const today = new Date().toISOString().split("T")[0];

    if (cached && cachedDate === today) {
      setPrompts(JSON.parse(cached));
      setLoading(false);
      return;
    }

    fetch("/api/ai/journal-prompts")
      .then((r) => r.json())
      .then((data) => {
        if (data.prompts) {
          setPrompts(data.prompts);
          sessionStorage.setItem("journal-prompts", JSON.stringify(data.prompts));
          sessionStorage.setItem("journal-prompts-date", today);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground/50 py-2">
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ✦
        </motion.span>
        Generating your cosmic prompts...
      </div>
    );
  }

  if (prompts.length === 0) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-xs text-gold/60 hover:text-gold/80 transition-colors"
      >
        <span>✦</span>
        <span>{expanded ? "Hide" : "Show"} cosmic prompts</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1">
              {prompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => {
                    onSelect(prompt);
                    setExpanded(false);
                  }}
                  className="w-full text-left text-xs text-foreground/70 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2.5 hover:border-gold/20 hover:text-foreground/90 hover:bg-white/[0.04] transition-all leading-relaxed"
                >
                  <span className="text-gold/40 mr-1.5">✦</span>
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
