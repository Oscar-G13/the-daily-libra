"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface AetherBalanceCardProps {
  balance: number;
}

export function AetherBalanceCard({ balance }: AetherBalanceCardProps) {
  return (
    <div className="glass-card p-5 border border-gold/10 relative overflow-hidden">
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.03] to-violet-500/[0.03] pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Aether orb */}
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-violet-500/20 border border-gold/20 flex items-center justify-center text-lg shrink-0"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            ✦
          </motion.div>

          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Aether Balance
            </p>
            <motion.p
              key={balance}
              className="text-2xl font-serif text-gold-gradient leading-none mt-0.5"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {balance.toLocaleString()}
            </motion.p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">
              spiritual energy
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Link
            href="/shop"
            className="text-xs px-3 py-1.5 rounded-lg bg-gold/[0.08] border border-gold/15 text-gold/70 hover:bg-gold/[0.14] hover:text-gold transition-colors"
          >
            Open Shop ✦
          </Link>
          <p className="text-[10px] text-muted-foreground/30 text-right">
            Earn daily · Spend freely
          </p>
        </div>
      </div>
    </div>
  );
}
