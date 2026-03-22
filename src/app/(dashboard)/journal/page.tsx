import { createClient } from "@/lib/supabase/server";
import { JournalView } from "@/components/journal/journal-view";

export const metadata = { title: "Journal" };

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user!.id)
    .order("entry_date", { ascending: false })
    .limit(30);

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-display-xs text-foreground">Journal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Write, reflect, and track your patterns over time.
        </p>
      </div>

      <JournalView
        initialEntries={entries ?? []}
        isPremium={userData?.subscription_tier === "premium"}
      />
    </div>
  );
}
