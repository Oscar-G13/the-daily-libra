"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatShortDate } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useGamification } from "@/components/gamification/provider";
import type { GamificationResult } from "@/types";

const MOOD_TAGS = [
  "grounded",
  "anxious",
  "romantic",
  "clear",
  "conflicted",
  "open",
  "guarded",
  "inspired",
  "drained",
  "powerful",
];

interface JournalEntry {
  id: string;
  title: string | null;
  body: string;
  mood_tag: string | null;
  mood_score: number | null;
  entry_date: string;
  created_at: string;
}

interface JournalViewProps {
  initialEntries: JournalEntry[];
  isPremium: boolean;
}

export function JournalView({ initialEntries, isPremium }: JournalViewProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [saving, setSaving] = useState(false);
  const { handleGamificationResult } = useGamification();

  const freeLimitReached = !isPremium && entries.length >= 3;

  async function saveEntry() {
    if (!body.trim() || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, moodTag }),
      });

      const data = await res.json();
      if (data.entry) {
        setEntries((prev) => [data.entry, ...prev]);
        setComposing(false);
        setTitle("");
        setBody("");
        setMoodTag("");
        if (data.gamification) {
          handleGamificationResult(data.gamification as GamificationResult);
        }
      }
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* New entry button */}
      {!composing && (
        <div>
          {freeLimitReached ? (
            <div className="glass-card p-5 text-center">
              <p className="text-sm text-muted-foreground mb-3">Free tier: 3 entries/month. </p>
              <a
                href="/subscription"
                className="text-sm text-gold-200 hover:text-gold transition-colors"
              >
                Upgrade for unlimited journaling →
              </a>
            </div>
          ) : (
            <button
              onClick={() => setComposing(true)}
              className="glass-card w-full p-4 flex items-center gap-3 text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all group"
            >
              <Plus className="w-4 h-4 text-gold/40 group-hover:text-gold/60 transition-colors" />
              <span className="text-sm">Write a new entry...</span>
            </button>
          )}
        </div>
      )}

      {/* Compose form */}
      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-foreground">New entry</p>
              <button
                onClick={() => setComposing(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-0 py-2 bg-transparent border-b border-white/[0.06] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/30 transition-colors text-sm mb-4"
            />

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your mind..."
              rows={6}
              className="w-full px-0 py-2 bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none text-sm leading-relaxed"
            />

            {/* Mood tags */}
            <div className="mt-4 mb-5">
              <p className="text-xs text-muted-foreground mb-2">Mood tag</p>
              <div className="flex flex-wrap gap-1.5">
                {MOOD_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setMoodTag(moodTag === tag ? "" : tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      moodTag === tag
                        ? "border-gold/40 bg-gold/5 text-gold-200"
                        : "border-white/[0.06] text-muted-foreground hover:border-white/10"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setComposing(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                disabled={!body.trim() || saving}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save entry"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries list */}
      {entries.length === 0 && !composing && (
        <div className="text-center py-16 text-muted-foreground/50">
          <p className="font-serif text-lg mb-2">Your journal is empty.</p>
          <p className="text-sm">Write your first entry to begin tracking your patterns.</p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                {entry.title && (
                  <h3 className="font-serif text-base text-foreground mb-0.5">{entry.title}</h3>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatShortDate(entry.entry_date)}
                  {entry.mood_tag && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      {entry.mood_tag}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <p className="text-sm text-foreground/75 leading-relaxed line-clamp-3">{entry.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
