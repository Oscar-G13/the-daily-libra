"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface CosmicEvent {
  id: string;
  event_name: string;
  event_type: "eclipse" | "retrograde" | "new_moon" | "full_moon" | "stellium" | "ingress";
  start_date: string;
  end_date: string;
  description: string;
  exclusive_content_key: string | null;
  badge_id: string | null;
  is_active: boolean;
  days_until: number;
}

const EVENT_TYPE_CONFIG: Record<
  CosmicEvent["event_type"],
  { icon: string; color: string; border: string; label: string }
> = {
  eclipse:    { icon: "🌑", color: "text-violet-300", border: "border-violet-500/20", label: "Eclipse" },
  retrograde: { icon: "☿",  color: "text-amber-300",  border: "border-amber-500/20",  label: "Retrograde" },
  new_moon:   { icon: "🌑", color: "text-blue-300",   border: "border-blue-500/20",   label: "New Moon" },
  full_moon:  { icon: "🌕", color: "text-gold",       border: "border-gold/20",       label: "Full Moon" },
  stellium:   { icon: "✦",  color: "text-rose-300",   border: "border-rose-500/20",   label: "Stellium" },
  ingress:    { icon: "♀",  color: "text-gold",       border: "border-gold/20",       label: "Ingress" },
};

// Map event content keys to reading category routes
const CONTENT_KEY_TO_ROUTE: Record<string, string> = {
  retrograde_reading: "/reading?category=healing",
  eclipse_reading:    "/reading?category=shadow",
  love_reading:       "/reading?category=love",
  healing_reading:    "/reading?category=healing",
  daily_reading:      "/reading?category=daily",
};

interface Props {
  events: CosmicEvent[];
}

export function CosmicEventBanner({ events }: Props) {
  if (events.length === 0) return null;

  const activeEvent = events.find((e) => e.is_active);
  const upcomingEvent = !activeEvent ? events.find((e) => e.days_until <= 7) : null;

  const event = activeEvent ?? upcomingEvent;
  if (!event) return null;

  const config = EVENT_TYPE_CONFIG[event.event_type];
  const isActive = event.is_active;
  const href = event.exclusive_content_key
    ? CONTENT_KEY_TO_ROUTE[event.exclusive_content_key] ?? "/reading"
    : "/reading";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border ${config.border} bg-white/[0.02] p-4`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <motion.span
            animate={isActive ? { scale: [1, 1.15, 1] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-xl"
          >
            {config.icon}
          </motion.span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] uppercase tracking-widest font-medium ${config.color}`}>
              {isActive ? "Active Now" : `In ${event.days_until} day${event.days_until !== 1 ? "s" : ""}`}
            </span>
            <span className="text-[10px] text-muted-foreground/40">·</span>
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">
              {config.label}
            </span>
            {event.badge_id && (
              <>
                <span className="text-[10px] text-muted-foreground/40">·</span>
                <span className="text-[10px] text-gold/50">Exclusive badge available</span>
              </>
            )}
          </div>

          <p className="text-sm font-medium text-foreground mb-1">{event.event_name}</p>

          {event.description && (
            <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 mb-3">
              {event.description}
            </p>
          )}

          {isActive && (
            <Link
              href={href}
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.color} hover:opacity-80 transition-opacity`}
            >
              <span>Open exclusive {config.label} reading</span>
              <span>→</span>
            </Link>
          )}

          {!isActive && (
            <p className="text-[10px] text-muted-foreground/50">
              Exclusive content unlocks when this event begins.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
