"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/components/gamification/provider";

const EXAMPLES = [
  "He's amazing when we're together but goes cold for days without explanation",
  "She says she loves me but keeps me a secret from her friends",
  "He gets upset when I make plans without him but barely makes time for me",
  "She's never fully available but always just available enough",
  "He told me I'm too sensitive every time I brought up something that hurt me",
];

function ReadingDisplay({ text }: { text: string }) {
  const sections = text.split(/\n(?=\*\*[🪞🔴⚠🌑⚖])/);
  return (
    <div className="space-y-5">
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
            transition={{ delay: i * 0.08 }}
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

export function RedFlagDecoder() {
  const [situation, setSituation] = useState("");
  const [personName, setPersonName] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState("");
  const [done, setDone] = useState(false);
  const { handleGamificationResult } = useGamification();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function submit() {
    if (situation.trim().length < 20 || streaming) return;
    setStreaming(true);
    setResponse("");
    setDone(false);

    try {
      const res = await fetch("/api/ai/red-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, personName }),
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
        const { done: d, value } = await reader.read();
        if (d) break;
        setResponse((prev) => prev + decoder.decode(value));
      }

      setDone(true);
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
    setSituation("");
    setPersonName("");
    setResponse("");
    setDone(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚩</span>
          <div>
            <h1 className="font-serif text-display-sm text-foreground">Red Flag Decoder</h1>
            <p className="text-sm text-muted-foreground">
              Describe the dynamic. Get a clear-eyed pattern analysis — chart-aware, Libra-specific.
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
            className="space-y-4"
          >
            <div className="glass-card p-5 space-y-5">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Person or situation <span className="text-muted-foreground/40">(name optional)</span>
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Alex, my situationship, my coworker…"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-gold/20 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Describe what&apos;s happening
                </label>
                <textarea
                  ref={textareaRef}
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Describe the behavior, pattern, or dynamic that's making you second-guess yourself. Be honest."
                  rows={5}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none outline-none leading-relaxed"
                  disabled={streaming}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <span className="text-xs text-muted-foreground/40">{situation.length} chars</span>
                <button
                  onClick={submit}
                  disabled={situation.trim().length < 20 || streaming}
                  className="px-5 py-2 rounded-lg bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {streaming ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        🚩
                      </motion.span>
                      Reading the patterns…
                    </span>
                  ) : (
                    "Decode the dynamic ✦"
                  )}
                </button>
              </div>
            </div>

            {streaming && response && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
                <ReadingDisplay text={response} />
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-gold/60 ml-1 align-middle"
                />
              </motion.div>
            )}

            {!streaming && !situation && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">Sounds familiar?</p>
                <div className="space-y-1.5">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setSituation(ex)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-muted-foreground/60 hover:text-foreground hover:border-gold/15 transition-all"
                    >
                      &ldquo;{ex}&rdquo;
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
            {personName && (
              <div className="glass-card p-4 border-gold/10">
                <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Pattern check</p>
                <p className="text-sm text-foreground/70">{personName}</p>
              </div>
            )}
            <div className="glass-card p-5">
              <ReadingDisplay text={response} />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-xs text-foreground/50 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-2.5"
            >
              <span className="text-gold/60">📖</span>
              <span>Saved to your Journal automatically.</span>
            </motion.div>
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl border border-white/[0.06] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all"
            >
              Analyze another dynamic
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
