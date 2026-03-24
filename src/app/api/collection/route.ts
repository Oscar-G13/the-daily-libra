import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString();

  const [{ data: allCards }, { data: ownedRows }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("cosmic_cards")
      .select("*")
      .or(`available_until.is.null,available_until.gte.${today.split("T")[0]}`)
      .order("rarity", { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("user_cosmic_cards")
      .select("card_key, earned_at")
      .eq("user_id", user.id),
  ]);

  const ownedMap = new Map(
    (ownedRows ?? []).map((r: { card_key: string; earned_at: string }) => [r.card_key, r.earned_at])
  );

  const cards = (allCards ?? []).map(
    (card: { card_key: string }) => ({
      ...card,
      owned: ownedMap.has(card.card_key),
      earned_at: ownedMap.get(card.card_key) ?? null,
    })
  );

  const totalOwned = ownedMap.size;
  const totalCards = cards.length;

  return NextResponse.json({ cards, totalOwned, totalCards });
}
