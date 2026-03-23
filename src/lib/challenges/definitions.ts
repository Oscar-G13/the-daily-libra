export interface DailyChallenge {
  id: string;           // short stable key, e.g. "journal_reflection"
  title: string;
  description: string;
  icon: string;
  xp: number;
  action?: {
    label: string;
    href: string;
  };
  category: "reflection" | "ritual" | "social" | "insight" | "reading";
}

// Pool of challenges — each day a deterministic 3 are selected based on date seed
export const CHALLENGE_POOL: DailyChallenge[] = [
  {
    id: "journal_reflection",
    title: "Write a Reflection",
    description: "Open your journal and write at least one entry today.",
    icon: "📖",
    xp: 30,
    action: { label: "Open Journal", href: "/journal" },
    category: "reflection",
  },
  {
    id: "get_reading",
    title: "Receive Today's Reading",
    description: "Pull your daily cosmic reading and sit with what it says.",
    icon: "🔮",
    xp: 20,
    action: { label: "Get Reading", href: "/reading" },
    category: "reading",
  },
  {
    id: "check_moon",
    title: "Track the Moon",
    description: "Visit the Moon Calendar and note what phase you're in.",
    icon: "🌙",
    xp: 15,
    action: { label: "Moon Calendar", href: "/moon" },
    category: "ritual",
  },
  {
    id: "decode_decision",
    title: "Make a Decision",
    description: "Use the Decision Decoder for something you've been sitting on.",
    icon: "⚖",
    xp: 25,
    action: { label: "Decision Decoder", href: "/decision" },
    category: "insight",
  },
  {
    id: "check_compatibility",
    title: "Read a Connection",
    description: "Run a compatibility analysis for someone in your life.",
    icon: "🌹",
    xp: 25,
    action: { label: "Compatibility Lab", href: "/compatibility" },
    category: "social",
  },
  {
    id: "update_profile",
    title: "Tend Your Profile",
    description: "Update your bio or aesthetic profile — your identity evolves.",
    icon: "✦",
    xp: 10,
    action: { label: "My Profile", href: "/profile" },
    category: "ritual",
  },
  {
    id: "visit_dashboard",
    title: "Check In with the Cosmos",
    description: "Open your dashboard and read your planetary snapshot for the day.",
    icon: "☀️",
    xp: 10,
    action: { label: "Dashboard", href: "/dashboard" },
    category: "ritual",
  },
  {
    id: "insight_session",
    title: "Deep Dive Session",
    description: "Complete an AI Insight Session — let the mirror reflect something true.",
    icon: "🧠",
    xp: 50,
    action: { label: "Start Session", href: "/insight-quiz" },
    category: "insight",
  },
  {
    id: "red_flag_check",
    title: "Name What You've Been Avoiding",
    description: "Use the Red Flag Decoder on a situation you keep circling back to.",
    icon: "🚩",
    xp: 35,
    action: { label: "Red Flag Decoder", href: "/red-flag" },
    category: "insight",
  },
  {
    id: "text_decode",
    title: "Decode a Message",
    description: "Paste something you received that left you unsure how to feel.",
    icon: "📱",
    xp: 30,
    action: { label: "Text Decoder", href: "/text-decoder" },
    category: "insight",
  },
  {
    id: "add_to_cosmic_room",
    title: "Curate Your Space",
    description: "Save something meaningful to your Cosmic Room today.",
    icon: "🪞",
    xp: 15,
    action: { label: "Cosmic Room", href: "/cosmic-room" },
    category: "ritual",
  },
  {
    id: "check_transits",
    title: "Read Your Transits",
    description: "Review what planets are moving through your chart right now.",
    icon: "♎",
    xp: 15,
    action: { label: "Birth Chart", href: "/chart" },
    category: "reading",
  },
];

/** Deterministically pick `count` challenges for a given date string (YYYY-MM-DD). */
export function getDailyChallenges(dateStr: string, count = 3): DailyChallenge[] {
  // Simple hash from date string → seed
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) >>> 0;
  }

  const pool = [...CHALLENGE_POOL];
  const picked: DailyChallenge[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const idx = seed % pool.length;
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return picked;
}
