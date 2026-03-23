import { createClient } from "@/lib/supabase/server";
import { CosmicRoom } from "@/components/cosmic-room/cosmic-room";
import { PremiumPageGate } from "@/components/ui/premium-gate";
import { hasFullAccess } from "@/lib/premium";

export default async function CosmicRoomPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user!.id)
    .single();
  const isPremium = hasFullAccess(data?.subscription_tier);

  if (!isPremium) return <PremiumPageGate feature="cosmic_room_save" />;
  return <CosmicRoom />;
}
