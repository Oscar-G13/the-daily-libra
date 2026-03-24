"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface OracleQuestion {
  icon: string;
  text: string;
  category: string;
}

const FREE_LIMIT = 5;

const ORACLE_QUESTIONS: OracleQuestion[] = [
  { icon: "☿", text: "How is Mercury affecting my communication right now?", category: "transit" },
  { icon: "♀", text: "What is Venus trying to tell me about my desires?", category: "venus" },
  { icon: "🌙", text: "What should I release before the next new moon?", category: "lunar" },
  { icon: "⚖", text: "Where is my life asking me to restore balance?", category: "libra" },
  { icon: "🔮", text: "What pattern is this week revealing about my growth?", category: "pattern" },
  { icon: "🌑", text: "What is my shadow asking of me right now?", category: "shadow" },
  { icon: "✦", text: "What energy should I protect and not give away this week?", category: "energy" },
  { icon: "🪞", text: "What truth am I most avoiding about a relationship in my life?", category: "love" },
];

interface OracleInterfaceProps {
  displayName: string;
  isPremium: boolean;
}

export function OracleInterface({ displayName: _displayName, isPremium }: OracleInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [showUpsell, setShowUpsell] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const remaining = isPremium ? Infinity : Math.max(0, FREE_LIMIT - messageCount);
  const isAtLimit = !isPremium && messageCount >= FREE_LIMIT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;

    if (isAtLimit) {
      setShowUpsell(true);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: content.trim(),
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);
    setMessageCount((c) => c + 1);

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      id: (Date.now() + 1).toString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const allMessages = [...messages, userMessage].map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403) {
          setShowUpsell(true);
          setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
          setMessageCount(FREE_LIMIT);
          return;
        }
        throw new Error(data.error ?? "The Oracle is unavailable. Try again shortly.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: m.content + chunk } : m))
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
      setMessageCount((c) => Math.max(0, c - 1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card flex flex-col h-full relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar relative">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            {/* Oracle symbol */}
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="text-5xl mb-4"
            >
              🔮
            </motion.div>
            <h3 className="font-serif text-lg text-foreground mb-1">The Celestial Oracle</h3>
            <p className="text-xs text-muted-foreground mb-1 tracking-wide">
              Speak, and the cosmos will answer.
            </p>
            {!isPremium && (
              <p className="text-[10px] text-gold/50 mb-6">
                {remaining} of {FREE_LIMIT} questions remaining today
              </p>
            )}
            {isPremium && (
              <p className="text-[10px] text-gold/50 mb-6">Unlimited oracle access ✦</p>
            )}

            {/* Question cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {ORACLE_QUESTIONS.map((q) => (
                <button
                  key={q.text}
                  onClick={() => sendMessage(q.text)}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-left hover:border-gold/20 hover:bg-gold/[0.03] transition-all group"
                >
                  <span className="text-base flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-80 transition-opacity">
                    {q.icon}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors leading-relaxed">
                    {q.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && (
                <span className="text-sm mr-2 mt-1 flex-shrink-0 opacity-50">🔮</span>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-gold/10 border border-gold/15 text-foreground"
                    : "bg-violet-500/[0.04] border border-violet-500/[0.12] text-foreground/90"
                )}
              >
                {message.role === "assistant" && (
                  <p className="font-serif leading-relaxed whitespace-pre-wrap">
                    {message.content}
                    {loading && !message.content && (
                      <span className="inline-flex gap-1 mt-1">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="w-1.5 h-1.5 rounded-full bg-violet-400/40 animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </span>
                    )}
                  </p>
                )}
                {message.role === "user" && <p>{message.content}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {error && <p className="text-xs text-red-300/80 text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/[0.04] relative">
        {/* Usage counter (after first message) */}
        {messages.length > 0 && !isPremium && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted-foreground/50">
              {remaining > 0
                ? `${remaining} oracle question${remaining !== 1 ? "s" : ""} remaining today`
                : "Daily limit reached"}
            </p>
            {remaining <= 2 && remaining > 0 && (
              <a href="/subscription" className="text-[10px] text-gold/60 hover:text-gold transition-colors underline">
                Upgrade for unlimited
              </a>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isAtLimit) setShowUpsell(true);
            else sendMessage(input);
          }}
          className="flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAtLimit ? "Daily limit reached..." : "Ask the Oracle anything..."}
            disabled={loading || isAtLimit}
            className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet-500/30 transition-colors text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || (!input.trim() && !isAtLimit)}
            onClick={isAtLimit ? () => setShowUpsell(true) : undefined}
            className="p-2.5 rounded-full bg-gradient-to-r from-violet-400/80 to-gold/80 text-obsidian hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Upsell modal */}
      <AnimatePresence>
        {showUpsell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm"
            onClick={() => setShowUpsell(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card border border-gold/20 p-8 text-center max-w-sm mx-4 shadow-xl"
            >
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="font-serif text-lg text-foreground mb-2">Daily Oracle Limit Reached</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You&apos;ve used all {FREE_LIMIT} oracle questions for today. Upgrade to Premium for
                unlimited access to the Celestial Oracle — every question, any time.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="/subscription"
                  className="w-full py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-gold-200 to-bronze text-obsidian hover:opacity-90 transition-opacity text-center block"
                >
                  Unlock Unlimited Access ✦
                </a>
                <button
                  onClick={() => setShowUpsell(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Come back tomorrow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
