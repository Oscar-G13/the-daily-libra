import { createClient } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/premium";
import { CosmicOutlookView } from "@/components/cosmic-outlook/cosmic-outlook-view";

export const metadata = { title: "Cosmic Outlook" };

export default async function CosmicOutlookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user!.id)
    .single();

  const isPremium = hasFullAccess(userData?.subscription_tier);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🌠</span>
          <h1 className="font-serif text-display-xs text-foreground">Cosmic Outlook</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {isPremium
            ? "Your 90-day energy forecast — upcoming transits, best windows, and moments to watch."
            : "Your 7-day energy preview. Upgrade to Premium for your full 90-day cosmic forecast."}
        </p>
      </div>
      <CosmicOutlookView isPremium={isPremium} />
    </div>
  );
}
