"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
  id: string;
  message: string;
  alert_type: string;
  created_at: string;
}

const TYPE_CONFIG: Record<
  string,
  { icon: string; borderColor: string; bgColor: string; textColor: string }
> = {
  info: {
    icon: "ℹ️",
    borderColor: "border-gold-500/50",
    bgColor: "bg-gold-500/10",
    textColor: "text-gold-300",
  },
  warning: {
    icon: "⚠️",
    borderColor: "border-amber-500/50",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-300",
  },
  ban: {
    icon: "🚫",
    borderColor: "border-red-500/50",
    bgColor: "bg-red-500/10",
    textColor: "text-red-300",
  },
  suspension: {
    icon: "⏸️",
    borderColor: "border-red-500/50",
    bgColor: "bg-red-500/10",
    textColor: "text-red-300",
  },
  mute: {
    icon: "🔇",
    borderColor: "border-blue-500/50",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-300",
  },
};

const DEFAULT_CONFIG = TYPE_CONFIG.info;

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
}

export function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Sort oldest first so we show oldest unread first
          const sorted = [...data].sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          setAlerts(sorted);
        }
      })
      .catch(() => {
        // Silently fail — no banner if API unavailable
      });
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => [...prev, id]);
    // Fire-and-forget POST to mark as read
    fetch(`/api/alerts/${id}/read`, { method: "POST" }).catch(() => undefined);
  }

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  const current = visible[0] ?? null;

  if (!current) return null;

  const config = getConfig(current.alert_type);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`
            card-glass rounded-xl border px-4 py-3 flex items-start gap-3 shadow-lg
            ${config.borderColor} ${config.bgColor}
          `}
        >
          <span className="text-xl leading-none mt-0.5 flex-shrink-0">
            {config.icon}
          </span>

          <p className={`flex-1 text-sm leading-relaxed ${config.textColor}`}>
            {current.message}
          </p>

          <button
            onClick={() => dismiss(current.id)}
            aria-label="Dismiss alert"
            className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors text-lg leading-none mt-0.5"
          >
            ×
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
