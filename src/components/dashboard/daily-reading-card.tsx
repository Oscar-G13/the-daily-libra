"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DailyReadingCardProps {
  userId: string;
  tone: string;
  existingReading: string | null;
  readingDate: string | null;
}

export function DailyReadingCard({
  userId,
  tone,
  existingReading,
  readingDate,
}: DailyReadingCardProps) {
  const today = new Date().toISOString().split("T")[0];
  const hasToday = readingDate === today && existingReading;

  const [reading, setReading] = useState<string | null>(existingReading && hasToday ? existingReading : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateReading() {
    setLoading(true);
    setError(null);
    setReading("");

    try {
      const res = await fetch("/api/ai/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "daily", tone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to generate reading");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setReading((prev) => (prev ?? "") + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate reading");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reading-card h-full min-h-[280px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Daily Reading</p>
          <span className="text-xs text-gold/50">{tone.charAt(0).toUpperCase() + tone.slice(1)} tone</span>
        </div>
        <span className="text-xl">☀️</span>
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {reading ? (
            <motion.div
              key="reading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-serif text-base leading-relaxed text-foreground/90"
            >
              {reading}
              {loading && <span className="inline-block w-1 h-4 bg-gold/60 animate-pulse ml-1 align-middle" />}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full py-8 text-center"
            >
              {error ? (
                <p className="text-sm text-red-300/80 mb-4">{error}</p>
              ) : (
                <p className="text-sm text-muted-foreground mb-6">
                  Your daily reading is waiting.<br />Generated fresh from your chart and archetype.
                </p>
              )}
              <button
                onClick={generateReading}
                disabled={loading}
                className={cn(
                  "px-7 py-2.5 rounded-full text-sm font-medium transition-all",
                  "bg-gradient-to-r from-gold-200 to-bronze text-obsidian hover:opacity-90 disabled:opacity-50"
                )}
              >
                {loading ? "Generating..." : "Get Today's Reading"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {reading && !loading && (
        <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-3">
          <button
            onClick={generateReading}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Regenerate
          </button>
          <span className="text-white/10">|</span>
          <a href="/reading" className="text-xs text-gold/60 hover:text-gold transition-colors">
            More readings →
          </a>
        </div>
      )}
    </div>
  );
}
