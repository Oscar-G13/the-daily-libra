"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { GamificationResult, AchievementStatus, TrophyDef, TrophyTier } from "@/types";
import { XPPop } from "./xp-pop";
import { AchievementToast } from "./achievement-toast";
import { LevelUpModal } from "./level-up-modal";

// ─── Context ──────────────────────────────────────────────────────────────────

interface GamificationCtx {
  handleGamificationResult: (result: GamificationResult | null) => void;
  xpTotal: number;
  xpLevel: number;
  setXPState: (total: number, level: number) => void;
}

const GamificationContext = createContext<GamificationCtx>({
  handleGamificationResult: () => {},
  xpTotal: 0,
  xpLevel: 1,
  setXPState: () => {},
});

export function useGamification() {
  return useContext(GamificationContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
  initialXP?: number;
  initialLevel?: number;
}

interface XPPopItem {
  id: number;
  amount: number;
}

interface ToastItem {
  id: number;
  achievement?: AchievementStatus;
  trophy?: { trophy: TrophyDef; tier: TrophyTier };
}

export function GamificationProvider({ children, initialXP = 0, initialLevel = 1 }: Props) {
  const [xpTotal, setXPTotal] = useState(initialXP);
  const [xpLevel, setXPLevel] = useState(initialLevel);
  const [xpPops, setXPPops] = useState<XPPopItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [levelUpData, setLevelUpData] = useState<{ from: number; to: number } | null>(null);
  const idRef = useRef(0);

  const nextId = () => ++idRef.current;

  const handleGamificationResult = useCallback((result: GamificationResult | null) => {
    if (!result) return;

    // Show XP pop
    const popId = nextId();
    setXPPops((prev) => [...prev, { id: popId, amount: result.xpAwarded }]);
    setTimeout(() => {
      setXPPops((prev) => prev.filter((p) => p.id !== popId));
    }, 2000);

    // Update XP state
    setXPTotal(result.newTotal);
    setXPLevel(result.levelAfter);

    // Queue achievement toasts
    for (const ach of result.newAchievements) {
      const id = nextId();
      setToasts((prev) => [...prev, { id, achievement: ach }]);
    }

    // Queue trophy toasts
    for (const t of result.newTrophies) {
      const id = nextId();
      setToasts((prev) => [...prev, { id, trophy: t }]);
    }

    // Level up modal
    if (result.leveledUp) {
      setLevelUpData({ from: result.levelBefore, to: result.levelAfter });
    }
  }, []);

  const setXPState = useCallback((total: number, level: number) => {
    setXPTotal(total);
    setXPLevel(level);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <GamificationContext.Provider
      value={{ handleGamificationResult, xpTotal, xpLevel, setXPState }}
    >
      {children}

      {/* Floating XP pops — rendered at top-right */}
      <div className="fixed top-6 right-6 pointer-events-none z-50 flex flex-col gap-2 items-end">
        {xpPops.map((pop) => (
          <XPPop key={pop.id} amount={pop.amount} />
        ))}
      </div>

      {/* Achievement / trophy toasts — bottom centre */}
      {toasts.length > 0 && (
        <AchievementToast item={toasts[0]} onDismiss={() => dismissToast(toasts[0].id)} />
      )}

      {/* Level-up modal */}
      {levelUpData && (
        <LevelUpModal
          fromLevel={levelUpData.from}
          toLevel={levelUpData.to}
          onClose={() => setLevelUpData(null)}
        />
      )}
    </GamificationContext.Provider>
  );
}
