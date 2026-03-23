"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { READING_CATEGORY_LABELS, TONE_LABELS } from "@/types";
import type { ReadingCategory, ReadingTone, GamificationResult } from "@/types";
import { getReadingEmoji, cn } from "@/lib/utils";
import { useGamification } from "@/components/gamification/provider";

const FREE_CATEGORIES: ReadingCategory[] = ["daily"];
const ALL_CATEGORIES: ReadingCategory[] = [
  "daily",
  "love",
  "friendship",
  "career",
  "confidence",
  "healing",
  "decision",
  "shadow",
  "beauty",
  "weekly",
  "monthly",
];

interface ReadingHubProps {
  isPremium: boolean;
  defaultTone: string;
}

export function ReadingHub({ isPremium, defaultTone }: ReadingHubProps) {
  const { handleGamificationResult } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState<ReadingCategory>("daily");
  const [selectedTone, setSelectedTone] = useState<ReadingTone>(
    (defaultTone as ReadingTone) ?? "gentle"
  );
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tones: ReadingTone[] = isPremium
    ? ["gentle", "blunt", "poetic", "practical", "seductive"]
    : ["gentle"];

  async function generateReading() {
    setLoading(true);
    setError(null);
    setReading("");

    try {
      const res = await fetch("/api/ai/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, tone: selectedTone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setReading((prev) => (prev ?? "") + decoder.decode(value, { stream: true }));
      }

      // Award XP after successful reading
      fetch("/api/gamification/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reading" }),
      })
        .then((r) => r.json())
        .then((data: GamificationResult) => handleGamificationResult(data))
        .catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Category grid */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Choose a reading
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {ALL_CATEGORIES.map((cat) => {
            const locked = !isPremium && !FREE_CATEGORIES.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => {
                  if (locked) return;
                  setSelectedCategory(cat);
                  setReading(null);
                }}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all",
                  locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                  selectedCategory === cat && !locked
                    ? "border-gold/40 bg-gold/5"
                    : "border-white/[0.06] hover:border-white/[0.12]"
                )}
              >
                <span className="text-lg block mb-1">{getReadingEmoji(cat)}</span>
                <span className="text-xs text-foreground/70">{READING_CATEGORY_LABELS[cat]}</span>
                {locked && <span className="block text-[10px] text-gold/40 mt-0.5">Premium</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone selector */}
      {isPremium && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Tone</p>
          <div className="flex flex-wrap gap-2">
            {tones.map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-all",
                  selectedTone === tone
                    ? "border-gold/40 bg-gold/5 text-gold-200"
                    : "border-white/[0.06] text-muted-foreground hover:border-white/10"
                )}
              >
                {TONE_LABELS[tone]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={generateReading}
        disabled={loading}
        className="px-8 py-3.5 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
      >
        {loading ? "Generating..." : `Generate ${READING_CATEGORY_LABELS[selectedCategory]}`}
      </button>

      {/* Reading output */}
      <AnimatePresence>
        {(reading !== null || error) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="reading-card"
          >
            {error ? (
              <p className="text-sm text-red-300/80">{error}</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getReadingEmoji(selectedCategory)}</span>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        {READING_CATEGORY_LABELS[selectedCategory]}
                      </p>
                      <p className="text-xs text-gold/50">{TONE_LABELS[selectedTone]}</p>
                    </div>
                  </div>
                  {!loading && reading && (
                    <ShareButton text={reading} category={selectedCategory} />
                  )}
                </div>
                <p className="font-serif text-base leading-relaxed text-foreground/90">
                  {reading}
                  {loading && (
                    <span className="inline-block w-1 h-4 bg-gold/60 animate-pulse ml-1 align-middle" />
                  )}
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShareButton({ text, category }: { text: string; category: string }) {
  const [copied, setCopied] = useState(false);

  const excerpt = text.slice(0, 180).replace(/\n/g, " ");
  const ogUrl = `/api/og/reading?excerpt=${encodeURIComponent(excerpt)}&category=${category}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Daily Libra Reading",
          text: excerpt + "...",
          url: window.location.origin,
        });
        return;
      } catch {
        // fallback to copy
      }
    }
    await navigator.clipboard.writeText(window.location.origin + ogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold/80 transition-colors px-2 py-1 rounded-lg border border-transparent hover:border-gold/10"
    >
      <span>{copied ? "✓" : "✦"}</span>
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
