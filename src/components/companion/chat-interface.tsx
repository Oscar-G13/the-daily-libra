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

const STARTER_PROMPTS = [
  "Why do I always hesitate when I know what I want?",
  "Help me make a decision without spiraling.",
  "Why do I crave peace but attract chaos?",
  "Explain my Venus placement to me.",
  "Is this person actually good for me?",
];

interface CompanionChatProps {
  displayName: string;
  isPremium: boolean;
}

export function CompanionChat({ displayName: _displayName, isPremium }: CompanionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: content.trim(),
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      id: (Date.now() + 1).toString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const allMessages = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

      const res = await fetch("/api/ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to get response");
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <span className="text-4xl mb-4">🪞</span>
            <h3 className="font-serif text-lg text-foreground mb-2">Your reflection companion.</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm">
              Ask about love, your patterns, a decision, your chart — or anything on your mind.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-muted-foreground hover:border-gold/20 hover:text-foreground transition-all"
                >
                  {prompt}
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
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-gold/10 border border-gold/15 text-foreground"
                    : "bg-white/[0.03] border border-white/[0.06] text-foreground/90"
                )}
              >
                {message.role === "assistant" && (
                  <p className="font-serif leading-relaxed whitespace-pre-wrap">
                    {message.content}
                    {loading && !message.content && (
                      <span className="inline-flex gap-1 mt-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
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

      {/* Input */}
      <div className="p-4 border-t border-white/[0.04]">
        {!isPremium && messages.length >= 4 && (
          <p className="text-xs text-gold/60 text-center mb-3">
            Free tier: 5 messages/day.{" "}
            <a href="/subscription" className="underline hover:text-gold">
              Upgrade for unlimited
            </a>
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/30 transition-colors text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
