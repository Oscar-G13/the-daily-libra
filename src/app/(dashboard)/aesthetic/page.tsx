import { createClient } from "@/lib/supabase/server";
import { AestheticQuizClient } from "@/components/aesthetic/aesthetic-quiz-client";
import { PremiumPageGate } from "@/components/ui/premium-gate";
import { hasFullAccess } from "@/lib/premium";
import type { AestheticStyle } from "@/types";

export const metadata = { title: "Aesthetic Profile" };

export default async function AestheticPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: userData }, { data: libraProfile }] = await Promise.all([
    supabase.from("users").select("subscription_tier").eq("id", user!.id).single(),
    supabase.from("libra_profiles").select("aesthetic_style").eq("user_id", user!.id).single(),
  ]);

  if (!hasFullAccess(userData?.subscription_tier)) {
    return <PremiumPageGate feature="aesthetic_profile" />;
  }

  return (
    <AestheticQuizClient
      existingStyle={(libraProfile?.aesthetic_style as AestheticStyle) ?? null}
    />
  );
}
