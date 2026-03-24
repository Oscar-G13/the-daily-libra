"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const PACKS = [
  {
    id: "aether_100",
    aether: 100,
    price: "$4.99",
    label: "Starter Spark",
    description: "A gentle infusion of cosmic energy.",
    popular: false,
  },
  {
    id: "aether_280",
    aether: 280,
    price: "$9.99",
    label: "Mystic Reserve",
    description: "Enough to unlock several upgrades.",
    popular: true,
  },
  {
    id: "aether_650",
    aether: 650,
    price: "$19.99",
    label: "Celestial Cache",
    description: "Power up your entire journey.",
    popular: false,
  },
  {
    id: "aether_1500",
    aether: 1500,
    price: "$39.99",
    label: "Astral Treasury",
    description: "Maximum abundance, best value.",
    popular: false,
  },
];

function AetherPacksInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("aether_success");
    const amount = searchParams.get("amount");
    if (success === "1" && amount) {
      setToast(`✦ ${Number(amount).toLocaleString()} Aether added to your balance!`);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("aether_success");
      url.searchParams.delete("amount");
      window.history.replaceState({}, "", url.toString());
      setTimeout(() => {
        setToast(null);
        router.refresh();
      }, 4000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBuy(packId: string) {
    setLoading(packId);
    try {
      const res = await fetch("/api/stripe/aether-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error ?? "Something went wrong.");
        setTimeout(() => setToast(null), 4000);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setToast("Failed to start checkout. Try again.");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-gold/10 border border-gold/30 backdrop-blur-sm text-sm text-gold-200 text-center shadow-2xl whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">💎</span>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Buy Aether
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PACKS.map((pack) => (
            <motion.button
              key={pack.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBuy(pack.id)}
              disabled={loading !== null}
              className={`relative glass-card p-4 border text-left transition-all ${
                pack.popular
                  ? "border-gold/30 hover:border-gold/50"
                  : "border-white/[0.06] hover:border-white/[0.12]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {pack.popular && (
                <span className="absolute -top-2 left-3 text-[9px] px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 uppercase tracking-widest">
                  Popular
                </span>
              )}
              <p className="text-xl mb-2">✦</p>
              <p className="text-lg font-serif text-gold leading-none">
                {pack.aether.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground/50 mb-2">Aether</p>
              <p className="text-xs font-medium text-foreground mb-0.5">{pack.label}</p>
              <p className="text-[10px] text-muted-foreground/50 leading-relaxed mb-3">
                {pack.description}
              </p>
              <div className="w-full rounded-lg bg-gold/10 border border-gold/20 py-1.5 text-center text-sm font-medium text-gold transition-colors hover:bg-gold/15">
                {loading === pack.id ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
                ) : (
                  pack.price
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
}

export function AetherPacks() {
  return (
    <Suspense fallback={null}>
      <AetherPacksInner />
    </Suspense>
  );
}
