import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const COSMIC_TITLES = [
  "Lunar Mystic",
  "Retrograde Warrior",
  "Eclipse Chosen",
  "Venus Devotee",
  "Scales Keeper",
  "Harmony Seeker",
  "Celestial Diplomat",
  "Shadow Dancer",
  "Cosmic Balancer",
  "Aether Weaver",
];

const AURA_COLORS = [
  "violet", "gold", "rose", "cyan", "sage",
  "amber", "lavender", "crimson", "pearl", "midnight",
];

const ORACLE_VOICES = ["default", "wise_elder", "mystical_whisper", "cosmic_echo"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { item_id, metadata: purchaseMeta } = body as {
    item_id: string;
    metadata?: Record<string, unknown>;
  };

  if (!item_id) return NextResponse.json({ error: "item_id required." }, { status: 400 });

  const service = await createServiceClient();

  // Fetch item
  const { data: item } = await (service as any)
    .from("shop_items")
    .select("*")
    .eq("id", item_id)
    .eq("is_active", true)
    .single();

  if (!item) return NextResponse.json({ error: "Item not found or inactive." }, { status: 404 });

  // Fetch user state
  const { data: userData } = await (service as any)
    .from("users")
    .select(
      "aether_balance, name_change_count, inviter_removed, cosmic_title, aura_color, oracle_voice_pack, streak_shield_expires_at, transit_shield_expires_at"
    )
    .eq("id", user.id)
    .single();

  if (!userData) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Check max_per_user
  if (item.max_per_user !== null) {
    const { count } = await (service as any)
      .from("user_shop_purchases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("item_id", item_id);
    if ((count ?? 0) >= item.max_per_user) {
      return NextResponse.json({ error: "You have already purchased this item the maximum number of times." }, { status: 400 });
    }
  }

  // Check Aether balance
  const aetherPrice: number | null = item.aether_price;
  if (aetherPrice === null) {
    return NextResponse.json({ error: "This item requires a real-money purchase." }, { status: 400 });
  }

  // First name change is free
  if (item_id === "profile_name_change" && (userData.name_change_count ?? 0) === 0) {
    // Free — skip balance check
  } else if (userData.aether_balance < aetherPrice) {
    return NextResponse.json(
      { error: `Insufficient Aether. You need ${aetherPrice} but have ${userData.aether_balance}.` },
      { status: 400 }
    );
  }

  const isFreeNameChange = item_id === "profile_name_change" && (userData.name_change_count ?? 0) === 0;
  const spent = isFreeNameChange ? 0 : aetherPrice;
  const newBalance = userData.aether_balance - spent;

  // Build user updates for side effects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userUpdates: Record<string, any> = { aether_balance: newBalance };

  let effectDescription = "";

  switch (item_id) {
    case "profile_name_change":
      userUpdates.name_change_count = (userData.name_change_count ?? 0) + 1;
      effectDescription = purchaseMeta?.new_name
        ? `Changed name to "${purchaseMeta.new_name}"`
        : "Name change token purchased";
      if (purchaseMeta?.new_name) {
        userUpdates.display_name = purchaseMeta.new_name;
      }
      break;

    case "remove_inviter":
      userUpdates.inviter_removed = true;
      userUpdates.referred_by = null;
      effectDescription = "Inviter removed from profile";
      break;

    case "cosmic_title": {
      const title = (purchaseMeta?.title as string) ?? COSMIC_TITLES[Math.floor(Math.random() * COSMIC_TITLES.length)];
      userUpdates.cosmic_title = title;
      effectDescription = `Cosmic title set: ${title}`;
      break;
    }

    case "aura_color": {
      const color = (purchaseMeta?.color as string) ?? AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)];
      if (!AURA_COLORS.includes(color)) {
        return NextResponse.json({ error: "Invalid aura color." }, { status: 400 });
      }
      userUpdates.aura_color = color;
      effectDescription = `Aura color changed to ${color}`;
      break;
    }

    case "transit_shield": {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      userUpdates.transit_shield_expires_at = expiresAt.toISOString();
      effectDescription = "Transit Shield active for 7 days";
      break;
    }

    case "streak_protector": {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      userUpdates.streak_shield_expires_at = expiresAt.toISOString();
      effectDescription = "Streak Protector active";
      break;
    }

    case "oracle_voice_pack": {
      const voice = (purchaseMeta?.voice as string) ?? "wise_elder";
      if (!ORACLE_VOICES.includes(voice)) {
        return NextResponse.json({ error: "Invalid oracle voice." }, { status: 400 });
      }
      userUpdates.oracle_voice_pack = voice;
      effectDescription = `Oracle voice changed to ${voice}`;
      break;
    }

    case "fate_reroll":
      effectDescription = "Fate Reroll token purchased";
      break;

    case "journal_theme":
      effectDescription = `Journal theme "${purchaseMeta?.theme ?? "starry_night"}" unlocked`;
      break;

    case "mystery_blessing": {
      // Random reward: 30% more aether, 40% cosmic title, 30% rare card placeholder
      const roll = Math.random();
      if (roll < 0.3) {
        const bonus = 75;
        userUpdates.aether_balance = newBalance + bonus;
        effectDescription = `Mystery revealed: +${bonus} Aether bonus!`;
      } else if (roll < 0.7) {
        const title = COSMIC_TITLES[Math.floor(Math.random() * COSMIC_TITLES.length)];
        userUpdates.cosmic_title = title;
        effectDescription = `Mystery revealed: Cosmic title "${title}"!`;
      } else {
        effectDescription = "Mystery revealed: Rare Cosmic Card incoming!";
      }
      break;
    }
  }

  // Apply all updates
  await Promise.all([
    (service as any).from("users").update(userUpdates).eq("id", user.id),
    (service as any).from("user_shop_purchases").insert({
      user_id: user.id,
      item_id,
      aether_spent: spent,
      metadata: { ...purchaseMeta, effect: effectDescription },
    }),
    spent > 0
      ? (service as any).from("aether_transactions").insert({
          user_id: user.id,
          amount: -spent,
          transaction_type: "shop_purchase",
          description: `Purchased: ${item.name}`,
          metadata: { item_id, effect: effectDescription },
        })
      : Promise.resolve(),
  ]);

  return NextResponse.json({
    ok: true,
    item_id,
    aether_spent: spent,
    new_balance: userUpdates.aether_balance ?? newBalance,
    effect: effectDescription,
  });
}
