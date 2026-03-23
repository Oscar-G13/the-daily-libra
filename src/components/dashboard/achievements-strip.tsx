"use client";

import { motion } from "framer-motion";

interface AchievementsStripProps {
  readingCount: number;
  assessmentComplete: boolean;
  journalCount: number;
  moodLogDays: number;
  hasCompanionMessages: boolean;
  hasBirthChart: boolean;
  onboardingComplete: boolean;
}

interface Badge {
  id: string;
  icon: string;
  label: string;
  description: string;
  unlocked: boolean;
}

export function AchievementsStrip({
  readingCount,
  assessmentComplete,
  journalCount,
  moodLogDays,
  hasCompanionMessages,
  hasBirthChart,
  onboardingComplete,
}: AchievementsStripProps) {
  const badges: Badge[] = [
    {
      id: "in_balance",
      icon: "⚖️",
      label: "In Balance",
      description: "Completed onboarding",
      unlocked: onboardingComplete,
    },
    {
      id: "first_light",
      icon: "✦",
      label: "First Light",
      description: "Received your first reading",
      unlocked: readingCount >= 1,
    },
    {
      id: "night_chart",
      icon: "🌙",
      label: "Night Chart",
      description: "Viewed your birth chart",
      unlocked: hasBirthChart,
    },
    {
      id: "deep_diver",
      icon: "🌑",
      label: "Deep Diver",
      description: "Completed the psyche assessment",
      unlocked: assessmentComplete,
    },
    {
      id: "mirror_work",
      icon: "🪞",
      label: "Mirror Work",
      description: "Had a conversation with your companion",
      unlocked: hasCompanionMessages,
    },
    {
      id: "the_writer",
      icon: "📖",
      label: "The Writer",
      description: "7+ journal entries",
      unlocked: journalCount >= 7,
    },
    {
      id: "mood_tracker",
      icon: "☁️",
      label: "Mood Tracker",
      description: "Logged mood for 7+ days",
      unlocked: moodLogDays >= 7,
    },
    {
      id: "daily_ritual",
      icon: "🕯️",
      label: "Daily Ritual",
      description: "10+ readings received",
      unlocked: readingCount >= 10,
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Achievements</p>
          <p className="font-serif text-lg text-foreground leading-tight">
            {unlockedCount} / {badges.length} Unlocked
          </p>
        </div>
        {unlockedCount === badges.length && (
          <span className="text-xs text-gold/60 italic">All earned ✦</span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.35 }}
            title={badge.description}
            className={`flex flex-col items-center gap-1 w-16 cursor-default select-none ${
              badge.unlocked ? "" : "opacity-30 grayscale"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-colors ${
                badge.unlocked ? "bg-gold/10 border border-gold/25" : "bg-white/[0.04] border border-white/[0.08]"
              }`}
            >
              {badge.unlocked ? badge.icon : "🔒"}
            </div>
            <span
              className={`text-[9px] text-center leading-tight ${
                badge.unlocked ? "text-foreground/70" : "text-foreground/30"
              }`}
            >
              {badge.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
