import { createClient } from "@/lib/supabase/server";
import { RedFlagDecoder } from "@/components/red-flag/red-flag-decoder";
import { PremiumPageGate } from "@/components/ui/premium-gate";

export default async function RedFlagPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("users").select("subscription_tier").eq("id", user!.id).single();
  const isPremium = data?.subscription_tier === "premium";

  if (!isPremium) return <PremiumPageGate feature="red_flag_decoder" />;
  return <RedFlagDecoder />;
}
