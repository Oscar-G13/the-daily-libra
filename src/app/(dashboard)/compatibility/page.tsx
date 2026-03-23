import { createClient } from "@/lib/supabase/server";
import { CompatibilityLab } from "@/components/compatibility/compatibility-lab";
import { hasFullAccess } from "@/lib/premium";

export default async function CompatibilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user!.id)
    .single();

  return <CompatibilityLab isPremium={hasFullAccess(data?.subscription_tier)} />;
}
