"use client";

import { motion } from "framer-motion";

interface XPPopProps {
  amount: number;
}

export function XPPop({ amount }: XPPopProps) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -56, scale: 0.85 }}
      transition={{ duration: 1.6, ease: "easeOut" }}
      className="font-serif text-sm font-medium text-gold-gradient bg-obsidian/80 border border-gold/20 px-3 py-1 rounded-full shadow-lg backdrop-blur-sm select-none"
    >
      +{amount} XP ✦
    </motion.div>
  );
}
