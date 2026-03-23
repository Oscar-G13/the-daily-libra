"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLevelDef } from "@/lib/gamification/levels";
import { Confetti } from "./confetti";

interface Props {
  fromLevel: number;
  toLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ fromLevel, toLevel, onClose }: Props) {
  const [stage, setStage] = useState<"number" | "name" | "done">("number");
  const newDef = getLevelDef(toLevel);

  useEffect(() => {
    const t1 = setTimeout(() => setStage("name"), 1000);
    return () => clearTimeout(t1);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="level-up-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201,168,76,0.12) 0%, rgba(10,10,11,0.96) 70%)",
        }}
        onClick={onClose}
      >
        <Confetti active />

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card border border-gold/30 p-10 text-center max-w-sm w-full shadow-2xl shadow-gold/10 relative overflow-hidden"
        >
          {/* Gold glow ring */}
          <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-gold/20 to-transparent pointer-events-none" />

          <p className="text-xs text-gold/60 uppercase tracking-[0.2em] mb-6">Level Up</p>

          {/* Level number transition */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="font-serif text-5xl text-muted-foreground"
            >
              {fromLevel}
            </motion.span>
            <span className="text-gold/60 text-2xl">→</span>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", damping: 10, stiffness: 200 }}
              className="font-serif text-6xl text-gold-gradient"
            >
              {toLevel}
            </motion.span>
          </div>

          {/* Level name */}
          <AnimatePresence>
            {stage !== "number" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-serif text-display-xs text-foreground mb-2">{newDef.name}</p>
                <p className="text-xs text-muted-foreground mb-8">
                  You&apos;ve risen to a new cosmic tier.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex flex-col gap-2"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full px-6 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-gold-200 to-bronze text-obsidian hover:opacity-90 transition-opacity"
            >
              Continue ✦
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
