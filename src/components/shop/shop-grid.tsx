"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShopItemModal } from "./shop-item-modal";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  aether_price: number | null;
  usd_price_cents: number | null;
  category: string;
  emoji: string;
  is_limited_time: boolean;
  max_per_user: number | null;
  sort_order: number;
}

interface UserState {
  nameChangeCount: number;
  inviterRemoved: boolean;
  cosmicTitle: string | null;
  auraColor: string;
  oracleVoicePack: string;
  streakShieldExpiresAt: string | null;
  transitShieldExpiresAt: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  identity: "Identity",
  boost: "Boosts",
  cosmetic: "Cosmetics",
  protection: "Protection",
  mystery: "Mystery",
};

const CATEGORY_ICONS: Record<string, string> = {
  identity: "🌟",
  boost: "⚡",
  cosmetic: "🎨",
  protection: "🛡️",
  mystery: "🎁",
};

interface ShopGridProps {
  items: ShopItem[];
  balance: number;
  purchaseMap: Record<string, number>;
  userState: UserState;
}

export function ShopGrid({ items, balance: initialBalance, purchaseMap: initialPurchaseMap, userState }: ShopGridProps) {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [balance, setBalance] = useState(initialBalance);
  const [purchaseMap, setPurchaseMap] = useState(initialPurchaseMap);
  const [purchasedEffect, setPurchasedEffect] = useState<string | null>(null);

  const categories = Array.from(new Set(items.map((i) => i.category)));

  function getItemStatus(item: ShopItem): "owned" | "maxed" | "insufficient" | "available" | "free" {
    const count = purchaseMap[item.id] ?? 0;
    if (item.max_per_user !== null && count >= item.max_per_user) return "maxed";
    if (item.id === "profile_name_change" && userState.nameChangeCount === 0) return "free";
    if (item.aether_price !== null && balance < item.aether_price) return "insufficient";
    return "available";
  }

  function handlePurchaseSuccess(itemId: string, newBalance: number, effect: string) {
    setBalance(newBalance);
    setPurchaseMap((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
    setPurchasedEffect(effect);
    setSelectedItem(null);
    setTimeout(() => setPurchasedEffect(null), 4000);
  }

  return (
    <>
      {/* Success toast */}
      <AnimatePresence>
        {purchasedEffect && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-gold/10 border border-gold/30 backdrop-blur-sm text-sm text-gold-200 text-center shadow-2xl"
          >
            ✦ {purchasedEffect}
          </motion.div>
        )}
      </AnimatePresence>

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{CATEGORY_ICONS[cat] ?? "✦"}</span>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
                {CATEGORY_LABELS[cat] ?? cat}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catItems.map((item) => {
                const status = getItemStatus(item);
                const isFree = status === "free";
                const isMaxed = status === "maxed";
                const isInsufficient = status === "insufficient";

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: isMaxed ? 1 : 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => !isMaxed && setSelectedItem(item)}
                    className={`glass-card p-4 border text-left transition-all ${
                      isMaxed
                        ? "opacity-40 cursor-not-allowed border-white/[0.04]"
                        : isInsufficient
                        ? "border-white/[0.06] hover:border-white/[0.10] cursor-pointer"
                        : "border-gold/10 hover:border-gold/25 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          {item.is_limited_time && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              LIMITED
                            </span>
                          )}
                          {isMaxed && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground border border-white/[0.06]">
                              OWNED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground/60 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {isFree ? (
                            <span className="text-xs font-medium text-emerald-400">Free ✦</span>
                          ) : item.aether_price !== null ? (
                            <span
                              className={`text-xs font-medium ${
                                isInsufficient ? "text-muted-foreground/40" : "text-gold/80"
                              }`}
                            >
                              {item.aether_price.toLocaleString()} Aether
                            </span>
                          ) : null}
                          {item.usd_price_cents !== null && (
                            <span className="text-xs text-muted-foreground/40">
                              · ${(item.usd_price_cents / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Purchase modal */}
      <AnimatePresence>
        {selectedItem && (
          <ShopItemModal
            item={selectedItem}
            balance={balance}
            isFree={getItemStatus(selectedItem) === "free"}
            userState={userState}
            onClose={() => setSelectedItem(null)}
            onSuccess={handlePurchaseSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
