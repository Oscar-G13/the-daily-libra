import { createClient } from "@/lib/supabase/server";
import { AestheticQuizClient } from "@/components/aesthetic/aesthetic-quiz-client";
import type { AestheticStyle } from "@/types";

export const metadata = { title: "Aesthetic Profile" };

export default async function AestheticPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: libraProfile } = await supabase
    .from("libra_profiles")
    .select("aesthetic_style")
    .eq("user_id", user!.id)
    .single();

  return (
    <AestheticQuizClient existingStyle={(libraProfile?.aesthetic_style as AestheticStyle) ?? null} />
  );
}
