import { createClient } from "@/lib/supabase/server";
import { DecisionDecoder } from "@/components/decision/decision-decoder";
import { PremiumPageGate } from "@/components/ui/premium-gate";
import { hasFullAccess } from "@/lib/premium";

export default async function DecisionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user!.id)
    .single();

  if (!hasFullAccess(data?.subscription_tier)) {
    return <PremiumPageGate feature="decision_decoder" />;
  }

  return <DecisionDecoder />;
}
