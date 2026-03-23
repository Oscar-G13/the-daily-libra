"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/components/gamification/provider";

const EXAMPLE_DECISIONS = [
  "Should I take the job offer or stay where I am?",
  "Do I tell them how I really feel, or keep the peace?",
  "Should I move to a new city for this opportunity?",
  "Is it time to end this friendship or try again?",
  "Should I invest in this or save the money?",
];

function BalanceIcon() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" className="text-gold">
      <line x1="16" y1="2" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="3" y1="8" x2="29" y2="8" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <line x1="6" y1="8" x2="6" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <ellipse
        cx="6"
        cy="16"
        rx="4.5"
        ry="1.8"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <line x1="26" y1="8" x2="26" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <ellipse
        cx="26"
        cy="16"
        rx="4.5"
        ry="1.8"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <circle cx="16" cy="2" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function ReadingDisplay({ text }: { text: string }) {
  // Parse sections
  const sections = text.split(/\n(?=\*\*[⚖🌹🪞🌙✦])/);

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const lines = section.split("\n");
        const header = lines[0]?.replace(/^\*\*|\*\*$/g, "").trim();
        const body = lines.slice(1).join("\n").trim();

        if (!header || !body) {
          return (
            <p key={i} className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {section}
            </p>
          );
        }

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-1.5"
          >
            <p className="text-xs font-semibold text-gold/80 uppercase tracking-widest">{header}</p>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{body}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

export function DecisionDecoder() {
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState("");
  const [done, setDone] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);
  const { handleGamificationResult } = useGamification();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function submitDecision() {
    if (!question.trim() || streaming) return;
    setStreaming(true);
    setResponse("");
    setDone(false);
    setSavedToJournal(false);

    try {
      const res = await fetch("/api/ai/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const err = await res.json();
        setResponse(err.error ?? "Something went wrong.");
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;
        setResponse((prev) => prev + decoder.decode(value));
      }

      setDone(true);
      setSavedToJournal(true);

      // Award XP for using the decoder
      const xpRes = await fetch("/api/gamification/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reading" }),
      });
      if (xpRes.ok) {
        const data = await xpRes.json();
        handleGamificationResult(data);
      }
    } finally {
      setStreaming(false);
    }
  }

  function reset() {
    setQuestion("");
    setResponse("");
    setDone(false);
    setSavedToJournal(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <BalanceIcon />
          <div>
            <h1 className="font-serif text-display-sm text-foreground">Decision Decoder</h1>
            <p className="text-sm text-muted-foreground">
              Libra&apos;s guide through indecision — framed by your chart and the stars
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            {/* Input card */}
            <div className="glass-card p-5 space-y-4">
              <div>
                <p className="text-xs text-gold/50 uppercase tracking-widest mb-3">
                  What are you deciding?
                </p>
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Describe your decision in detail. The more context you share, the clearer the guidance..."
                  rows={4}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed"
                  disabled={streaming}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <span className="text-xs text-muted-foreground/50">
                  {question.length} characters
                </span>
                <button
                  onClick={submitDecision}
                  disabled={question.trim().length < 10 || streaming}
                  className="px-5 py-2 rounded-lg bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {streaming ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        ⚖
                      </motion.span>
                      Consulting the stars...
                    </span>
                  ) : (
                    "Decode This Decision ✦"
                  )}
                </button>
              </div>
            </div>

            {/* Streaming response (shown while loading) */}
            {streaming && response && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-5"
              >
                <ReadingDisplay text={response} />
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-gold/60 ml-1 align-middle"
                />
              </motion.div>
            )}

            {/* Examples */}
            {!streaming && !response && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Try asking about
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_DECISIONS.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setQuestion(ex)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Question recap */}
            <div className="glass-card p-4 border-gold/10">
              <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Your decision</p>
              <p className="text-sm text-foreground/80 italic">&ldquo;{question}&rdquo;</p>
            </div>

            {/* Full response */}
            <div className="glass-card p-5">
              <ReadingDisplay text={response} />
            </div>

            {/* Saved notice */}
            {savedToJournal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-xs text-foreground/50 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-2.5"
              >
                <span className="text-gold/60">📖</span>
                <span>This reading has been saved to your Journal automatically.</span>
              </motion.div>
            )}

            {/* New decision */}
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl border border-white/[0.06] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all"
            >
              Decode another decision
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
