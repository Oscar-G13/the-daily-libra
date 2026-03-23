"use client";

import { motion } from "framer-motion";
import type { AssessmentSession } from "@/types/assessment";

interface ResumePromptProps {
  session: AssessmentSession;
  onResume: () => void;
  onStartFresh: () => void;
}

export function ResumePrompt({ session, onResume, onStartFresh }: ResumePromptProps) {
  const lastSaved = new Date(session.last_saved_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const percent = Math.round(session.progress_percent);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-8 sm:p-12 max-w-md text-center space-y-6"
      >
        <div className="space-y-2">
          <p className="text-xs text-gold/50 uppercase tracking-widest">Assessment in progress</p>
          <h2 className="font-serif text-xl text-foreground">Welcome back.</h2>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-200 to-bronze rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Last saved {lastSaved}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Resume where I left off
          </button>
          <button
            onClick={onStartFresh}
            className="text-xs text-muted-foreground hover:text-foreground/70 transition-colors"
          >
            Start fresh instead
          </button>
        </div>
      </motion.div>
    </div>
  );
}
