"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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

const COSMIC_TITLES = [
  "Lunar Mystic", "Retrograde Warrior", "Eclipse Chosen", "Venus Devotee",
  "Scales Keeper", "Harmony Seeker", "Celestial Diplomat", "Shadow Dancer",
  "Cosmic Balancer", "Aether Weaver",
];

const AURA_COLORS = [
  { id: "violet", label: "Cosmic Violet", swatch: "#7c3aed" },
  { id: "gold", label: "Solar Gold", swatch: "#d4a947" },
  { id: "rose", label: "Venus Rose", swatch: "#f43f5e" },
  { id: "cyan", label: "Celestial Cyan", swatch: "#06b6d4" },
  { id: "sage", label: "Earth Sage", swatch: "#84cc16" },
  { id: "amber", label: "Harvest Amber", swatch: "#f59e0b" },
  { id: "lavender", label: "Dream Lavender", swatch: "#a78bfa" },
  { id: "crimson", label: "Eclipse Crimson", swatch: "#dc2626" },
  { id: "pearl", label: "Moon Pearl", swatch: "#e2e8f0" },
  { id: "midnight", label: "Deep Midnight", swatch: "#1e1b4b" },
];

const ORACLE_VOICES = [
  { id: "wise_elder", label: "Wise Elder", description: "Ancient, slow, and deliberate wisdom." },
  { id: "mystical_whisper", label: "Mystical Whisper", description: "Soft, intimate, ethereal guidance." },
  { id: "cosmic_echo", label: "Cosmic Echo", description: "Vast, resonant, universal perspective." },
];

interface ShopItemModalProps {
  item: ShopItem;
  balance: number;
  isFree: boolean;
  userState: UserState;
  onClose: () => void;
  onSuccess: (itemId: string, newBalance: number, effect: string) => void;
}

export function ShopItemModal({ item, balance, isFree, userState, onClose, onSuccess }: ShopItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState(String);
  const [selectedTitle, setSelectedTitle] = useState(COSMIC_TITLES[0]);
  const [selectedColor, setSelectedColor] = useState(userState.auraColor);
  const [selectedVoice, setSelectedVoice] = useState(ORACLE_VOICES[0].id);

  const price = isFree ? 0 : (item.aether_price ?? 0);
  const canAfford = balance >= price;

  function buildMetadata(): Record<string, unknown> {
    switch (item.id) {
      case "profile_name_change": return { new_name: newName.trim() };
      case "cosmic_title": return { title: selectedTitle };
      case "aura_color": return { color: selectedColor };
      case "oracle_voice_pack": return { voice: selectedVoice };
      default: return {};
    }
  }

  async function handlePurchase() {
    if (!canAfford) return;
    if (item.id === "profile_name_change" && !newName.trim()) {
      setError("Please enter a new name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.id, metadata: buildMetadata() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Purchase failed.");
        return;
      }
      onSuccess(item.id, data.new_balance, data.effect ?? `${item.name} purchased!`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md glass-card border border-gold/15 p-6 space-y-5 relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{item.emoji}</span>
            <div>
              <h2 className="font-serif text-lg text-foreground">{item.name}</h2>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{item.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors text-xl leading-none shrink-0 ml-2"
          >
            ×
          </button>
        </div>

        {/* Item-specific config */}
        {item.id === "profile_name_change" && (
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
              New Display Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={40}
              placeholder="Enter your new name"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/30"
            />
          </div>
        )}

        {item.id === "cosmic_title" && (
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
              Choose Your Title
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {COSMIC_TITLES.map((title) => (
                <button
                  key={title}
                  onClick={() => setSelectedTitle(title)}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all text-left ${
                    selectedTitle === title
                      ? "bg-gold/10 border-gold/30 text-gold-200"
                      : "border-white/[0.06] text-muted-foreground hover:border-white/[0.12]"
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.id === "aura_color" && (
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
              Choose Aura Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AURA_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  title={c.label}
                  className={`w-full aspect-square rounded-full border-2 transition-all ${
                    selectedColor === c.id ? "border-white/80 scale-110" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.swatch }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground/50 mt-2 text-center">
              {AURA_COLORS.find((c) => c.id === selectedColor)?.label}
            </p>
          </div>
        )}

        {item.id === "oracle_voice_pack" && (
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
              Choose Voice Style
            </label>
            <div className="space-y-2">
              {ORACLE_VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                    selectedVoice === v.id
                      ? "bg-violet-500/10 border-violet-500/30 text-violet-200"
                      : "border-white/[0.06] text-muted-foreground hover:border-white/[0.12]"
                  }`}
                >
                  <p className="text-xs font-medium">{v.label}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{v.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mystery reveal hint */}
        {item.id === "mystery_blessing" && (
          <div className="rounded-lg bg-gold/[0.04] border border-gold/10 p-3 text-center">
            <p className="text-xs text-muted-foreground/60">
              Contains one of: bonus Aether, a Cosmic Title, or a rare Cosmic Card.
              <br />
              <span className="text-gold/50">The cosmos decides.</span>
            </p>
          </div>
        )}

        {/* Price + confirm */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/[0.04]">
          <div>
            {isFree ? (
              <p className="text-sm text-emerald-400 font-medium">Free ✦</p>
            ) : (
              <div>
                <p className="text-lg font-serif text-gold-gradient">{price.toLocaleString()} Aether</p>
                <p className="text-[10px] text-muted-foreground/40">
                  Balance after: {(balance - price).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handlePurchase}
            disabled={loading || (!isFree && !canAfford)}
            className="px-5 py-2.5 rounded-lg bg-gold/10 border border-gold/25 text-gold-200 text-sm font-medium hover:bg-gold/[0.18] transition-all disabled:opacity-40 disabled:cursor-not-allowed min-w-[100px] text-center"
          >
            {loading ? (
              <span className="animate-pulse">Purchasing…</span>
            ) : !canAfford && !isFree ? (
              "Need Aether"
            ) : (
              "Confirm ✦"
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-400 text-center">{error}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
