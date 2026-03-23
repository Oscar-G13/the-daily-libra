"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/components/gamification/provider";

const SECTION_ICONS = ["📱", "🔍", "🌀", "⚠", "✉"];

const CONTEXT_OPTIONS = [
  "no context — just decode it",
  "we've been talking for a while",
  "this came out of nowhere",
  "we had a disagreement recently",
  "things have felt distant",
  "we just started talking",
  "they've been inconsistent lately",
];

function ReadingDisplay({ text }: { text: string }) {
  const sections = text.split(/\n(?=\*\*[📱🔍🌀⚠✉])/);
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

export function TextDecoder() {
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [context, setContext] = useState(CONTEXT_OPTIONS[0]);
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState("");
  const [done, setDone] = useState(false);
  const { handleGamificationResult } = useGamification();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function submit() {
    if (!message.trim() || streaming) return;
    setStreaming(true);
    setResponse("");
    setDone(false);

    try {
      const res = await fetch("/api/ai/text-decoder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, senderName, context }),
      });

      if (!res.ok) {
        const err = await res.json();
        setResponse(err.error ?? "Something went wrong.");
        return;
      }

      const reader = res.body?.getReader();
      const utf8 = new globalThis.TextDecoder();
      if (!reader) return;

      while (true) {
        const { done: d, value } = await reader.read();
        if (d) break;
        setResponse((prev) => prev + utf8.decode(value));
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
    setMessage("");
    setSenderName("");
    setContext(CONTEXT_OPTIONS[0]);
    setResponse("");
    setDone(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <h1 className="font-serif text-display-sm text-foreground">Text Decoder</h1>
            <p className="text-sm text-muted-foreground">
              Paste any message. Get the emotional truth behind it.
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Who sent this?
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Name or relationship"
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-gold/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Context</label>
                  <select
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold/20 transition-colors [color-scheme:dark]"
                  >
                    {CONTEXT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Paste the message
                </label>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`"Hey, I've been thinking..."`}
                  rows={4}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none outline-none leading-relaxed"
                  disabled={streaming}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <span className="text-xs text-muted-foreground/40">{message.length} chars</span>
                <button
                  onClick={submit}
                  disabled={message.trim().length < 5 || streaming}
                  className="px-5 py-2 rounded-lg bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {streaming ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        📱
                      </motion.span>
                      Reading…
                    </span>
                  ) : (
                    "Decode this message ✦"
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

            <div className="flex flex-wrap gap-1.5">
              {SECTION_ICONS.map((icon, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] text-muted-foreground/40">
                  {icon}
                </span>
              ))}
              <span className="text-xs px-2 py-1 text-muted-foreground/30">5 dimensions read</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="glass-card p-4 border-gold/10">
              <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">
                Message from {senderName || "someone"}
              </p>
              <p className="text-sm text-foreground/70 italic">&ldquo;{message.slice(0, 120)}{message.length > 120 ? "…" : ""}&rdquo;</p>
            </div>
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
              Decode another message
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
