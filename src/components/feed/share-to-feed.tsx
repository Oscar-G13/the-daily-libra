"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShareToFeedProps {
  content: string;
  postType: "reading" | "reflection" | "compatibility" | "insight" | "quote";
  sourceId?: string;
  label?: string;
  className?: string;
}

export function ShareToFeed({
  content,
  postType,
  sourceId,
  label = "Share to The Collective",
  className,
}: ShareToFeedProps) {
  const [state, setstate] = useState<"idle" | "confirm" | "sharing" | "done">("idle");
  const [isAnonymous, setIsAnonymous] = useState(false);

  async function share() {
    setstate("sharing");
    const res = await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content.slice(0, 500),
        post_type: postType,
        is_anonymous: isAnonymous,
        source_id: sourceId,
      }),
    });
    if (res.ok) {
      setstate("done");
      setTimeout(() => setstate("idle"), 3000);
    } else {
      setstate("idle");
    }
  }

  if (state === "done") {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("text-xs text-gold/60", className)}
      >
        ✦ Shared to The Collective
      </motion.span>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {state === "idle" && (
        <button
          onClick={() => setstate("confirm")}
          className="text-xs text-muted-foreground/40 hover:text-gold/50 transition-colors flex items-center gap-1"
        >
          <span>🌐</span> {label}
        </button>
      )}

      <AnimatePresence>
        {state === "confirm" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="absolute bottom-full mb-2 right-0 glass-card p-4 w-64 z-10 space-y-3"
          >
            <p className="text-xs text-foreground/80 leading-relaxed">
              Share this to The Collective for other Libras to see?
            </p>
            <label className="flex items-center gap-2 text-xs text-muted-foreground/60 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-3 h-3 accent-gold"
              />
              Post anonymously
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setstate("idle")}
                className="flex-1 text-xs py-1.5 rounded-full border border-white/[0.08] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={share}
                className="flex-1 text-xs py-1.5 rounded-full bg-gold/[0.1] border border-gold/20 text-gold/70 hover:bg-gold/[0.18] transition-all"
              >
                Share
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {state === "sharing" && (
        <span className="text-xs text-muted-foreground/40">Sharing...</span>
      )}
    </div>
  );
}
