import { createClient } from "@/lib/supabase/server";
import { ReadingHub } from "@/components/reading/reading-hub";

export const metadata = { title: "Readings" };

export default async function ReadingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier, tone_preference")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-display-xs text-foreground">Readings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personalized insights across every dimension of your Libra life.
        </p>
      </div>

      <ReadingHub
        isPremium={userData?.subscription_tier === "premium"}
        defaultTone={userData?.tone_preference ?? "gentle"}
      />
    </div>
  );
}
