import { createClient } from "@/lib/supabase/server";
import { ShopGrid } from "@/components/shop/shop-grid";
import { AetherPacks } from "@/components/shop/aether-packs";

export const metadata = { title: "Aether Shop" };

export default async function ShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: userData }, { data: shopItems }, { data: purchases }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("users")
      .select("aether_balance, cosmic_title, aura_color, oracle_voice_pack, name_change_count, inviter_removed, streak_shield_expires_at, transit_shield_expires_at")
      .eq("id", user!.id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("shop_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("user_shop_purchases")
      .select("item_id, purchased_at, metadata")
      .eq("user_id", user!.id)
      .order("purchased_at", { ascending: false }),
  ]);

  const purchaseMap: Record<string, number> = {};
  for (const p of purchases ?? []) {
    purchaseMap[p.item_id] = (purchaseMap[p.item_id] ?? 0) + 1;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          Mystic Marketplace
        </p>
        <h1 className="font-serif text-display-sm text-foreground">Aether Shop</h1>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Spend your accumulated spiritual energy on upgrades, cosmetics, and cosmic boosts.
        </p>
      </div>

      {/* Balance */}
      <div className="glass-card px-5 py-4 border border-gold/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-violet-500/20 border border-gold/20 flex items-center justify-center text-lg">
            ✦
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Your Aether Balance</p>
            <p className="text-2xl font-serif text-gold-gradient leading-none mt-0.5">
              {(userData?.aether_balance ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground/50">Earn by completing daily rituals,</p>
          <p className="text-xs text-muted-foreground/50">maintaining streaks & achievements.</p>
        </div>
      </div>

      {/* How to earn aether */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "🔆", label: "Daily login", amount: "+10" },
          { icon: "🕯️", label: "Full ritual", amount: "+67" },
          { icon: "🔥", label: "7-day streak", amount: "+50" },
          { icon: "🏆", label: "Achievements", amount: "40–800" },
        ].map((item) => (
          <div
            key={item.label}
            className="glass-card p-3 border border-white/[0.04] text-center"
          >
            <p className="text-xl mb-1">{item.icon}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm text-gold/70 font-medium">{item.amount}</p>
          </div>
        ))}
      </div>

      {/* Buy Aether packs via Stripe */}
      <AetherPacks />

      {/* Shop grid */}
      <ShopGrid
        items={shopItems ?? []}
        balance={userData?.aether_balance ?? 0}
        purchaseMap={purchaseMap}
        userState={{
          nameChangeCount: userData?.name_change_count ?? 0,
          inviterRemoved: userData?.inviter_removed ?? false,
          cosmicTitle: userData?.cosmic_title ?? null,
          auraColor: userData?.aura_color ?? "violet",
          oracleVoicePack: userData?.oracle_voice_pack ?? "default",
          streakShieldExpiresAt: userData?.streak_shield_expires_at ?? null,
          transitShieldExpiresAt: userData?.transit_shield_expires_at ?? null,
        }}
      />
    </div>
  );
}
