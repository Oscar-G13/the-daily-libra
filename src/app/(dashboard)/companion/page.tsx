import { createClient } from "@/lib/supabase/server";
import { CompanionChat } from "@/components/companion/chat-interface";

export const metadata = { title: "AI Companion" };

export default async function CompanionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: userData }] = await Promise.all([
    supabase.from("users").select("display_name, subscription_tier").eq("id", user!.id).single(),
    supabase.from("libra_profiles").select("primary_archetype").eq("user_id", user!.id).single(),
  ]);

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="font-serif text-display-xs text-foreground">AI Companion</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A Libra-tuned guide that knows your chart and remembers you.
        </p>
      </div>
      <CompanionChat
        displayName={userData?.display_name ?? ""}
        isPremium={userData?.subscription_tier === "premium"}
      />
    </div>
  );
}
