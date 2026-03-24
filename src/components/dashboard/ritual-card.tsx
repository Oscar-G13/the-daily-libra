"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/components/gamification/provider";

type Slot = "morning" | "midday" | "evening";

interface SlotMeta {
  label: string;
  icon: string;
  time: string;
  xp: number;
}

const SLOT_META: Record<Slot, SlotMeta> = {
  morning: { label: "Morning", icon: "☀️", time: "Dawn ritual", xp: 15 },
  midday:  { label: "Midday",  icon: "⚖",  time: "Midday reset", xp: 10 },
  evening: { label: "Evening", icon: "🌙", time: "Night reflection", xp: 15 },
};

const SLOTS: Slot[] = ["morning", "midday", "evening"];

type MorningContent = { title: string; intention: string; affirmation: string; cosmic_note: string };
type MidContent     = { title: string; energy_check: string; action: string };
type EveningContent = { title: string; reflection_prompt: string; question: string; rest_suggestion: string };
type SlotContent    = MorningContent | MidContent | EveningContent;

interface SlotState {
  completed: boolean;
  content: SlotContent | null;
  loading: boolean;
}

interface RitualCardProps {
  userId: string;
}

export function RitualCard({ userId: _userId }: RitualCardProps) {
  const [slots, setSlots] = useState<Record<Slot, SlotState>>({
    morning: { completed: false, content: null, loading: false },
    midday:  { completed: false, content: null, loading: false },
    evening: { completed: false, content: null, loading: false },
  });
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const [completing, setCompleting] = useState<Slot | null>(null);
  const [bonusMessage, setBonusMessage] = useState<string | null>(null);
  const { handleGamificationResult } = useGamification();

  // Load completion state on mount
  useEffect(() => {
    fetch("/api/rituals")
      .then((r) => r.json())
      .then((data) => {
        if (data.slots) {
          setSlots((prev) => ({
            morning: { ...prev.morning, completed: data.slots.morning },
            midday:  { ...prev.midday,  completed: data.slots.midday  },
            evening: { ...prev.evening, completed: data.slots.evening },
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Load slot content when expanded
  const loadSlot = useCallback((slot: Slot) => {
    if (slots[slot].content) return;
    setSlots((prev) => ({ ...prev, [slot]: { ...prev[slot], loading: true } }));
    fetch(`/api/rituals/${slot}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots((prev) => ({
          ...prev,
          [slot]: { ...prev[slot], content: data.content, loading: false },
        }));
      })
      .catch(() => {
        setSlots((prev) => ({ ...prev, [slot]: { ...prev[slot], loading: false } }));
      });
  }, [slots]);

  const handleSlotClick = (slot: Slot) => {
    if (activeSlot === slot) {
      setActiveSlot(null);
    } else {
      setActiveSlot(slot);
      loadSlot(slot);
    }
  };

  const completeSlot = async (slot: Slot) => {
    if (slots[slot].completed || completing) return;
    setCompleting(slot);
    try {
      const res = await fetch(`/api/rituals/${slot}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSlots((prev) => ({ ...prev, [slot]: { ...prev[slot], completed: true } }));
        if (data.gamification) handleGamificationResult(data.gamification);
        if (data.bonus?.message) {
          setBonusMessage(data.bonus.message);
          setTimeout(() => setBonusMessage(null), 4000);
        }
      }
    } finally {
      setCompleting(null);
    }
  };

  const completedCount = SLOTS.filter((s) => slots[s].completed).length;
  const allComplete = completedCount === 3;

  return (
    <div className="glass-card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Daily Rituals</p>
        <span className="text-sm">🕯️</span>
      </div>
      <p className="text-[10px] text-gold/40 mb-4">
        {completedCount}/3 complete
        {allComplete && " · +25 bonus XP earned ✦"}
      </p>

      {/* Bonus message */}
      <AnimatePresence>
        {bonusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 px-3 py-2 rounded-lg bg-gold/10 border border-gold/20 text-xs text-gold-200 text-center"
          >
            {bonusMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slot rows */}
      <div className="space-y-2 flex-1">
        {SLOTS.map((slot) => {
          const meta = SLOT_META[slot];
          const state = slots[slot];
          const isOpen = activeSlot === slot;

          return (
            <div key={slot}>
              {/* Slot header row */}
              <button
                onClick={() => handleSlotClick(slot)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-white/[0.03] text-left"
              >
                <span className="text-base w-5 flex-shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${state.completed ? "text-gold-200" : "text-foreground/80"}`}>
                    {meta.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">{meta.time} · {meta.xp} XP</p>
                </div>
                {state.completed ? (
                  <span className="text-gold text-sm flex-shrink-0">✦</span>
                ) : (
                  <span className="text-muted-foreground/30 text-xs flex-shrink-0">
                    {isOpen ? "▲" : "▼"}
                  </span>
                )}
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-3">
                      {state.loading && (
                        <p className="text-xs text-muted-foreground/50 animate-pulse">Loading ritual...</p>
                      )}

                      {state.content && (
                        <>
                          <p className="text-[10px] text-gold/50 uppercase tracking-widest">
                            {(state.content as MorningContent).title}
                          </p>

                          {/* Morning */}
                          {slot === "morning" && state.content && (() => {
                            const c = state.content as MorningContent;
                            return (
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Intention: </span>
                                  <span className="text-foreground/80">{c.intention}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Affirmation: </span>
                                  <span className="text-foreground/80 italic">"{c.affirmation}"</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Cosmic note: </span>
                                  <span className="text-foreground/70">{c.cosmic_note}</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Midday */}
                          {slot === "midday" && state.content && (() => {
                            const c = state.content as MidContent;
                            return (
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Energy check: </span>
                                  <span className="text-foreground/80">{c.energy_check}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Action: </span>
                                  <span className="text-foreground/80">{c.action}</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Evening */}
                          {slot === "evening" && state.content && (() => {
                            const c = state.content as EveningContent;
                            return (
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Reflect: </span>
                                  <span className="text-foreground/80">{c.reflection_prompt}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Ask yourself: </span>
                                  <span className="text-foreground/80 italic">{c.question}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Rest: </span>
                                  <span className="text-foreground/70">{c.rest_suggestion}</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Complete button */}
                          {!state.completed && (
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={() => completeSlot(slot)}
                              disabled={!!completing}
                              className="mt-1 w-full py-2 rounded-lg text-xs font-medium bg-gold/[0.08] border border-gold/20 text-gold-200 hover:bg-gold/[0.12] transition-colors disabled:opacity-50"
                            >
                              {completing === slot ? "Completing..." : `Complete ${meta.label} Ritual · +${meta.xp} XP`}
                            </motion.button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-white/[0.04]">
        {SLOTS.map((s) => (
          <motion.div
            key={s}
            animate={{ scale: slots[s].completed ? 1.2 : 1 }}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              slots[s].completed ? "bg-gold" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
