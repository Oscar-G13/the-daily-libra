import { createClient } from "@/lib/supabase/server";
import { InsightQuiz } from "@/components/insight-quiz/insight-quiz";
import { PremiumPageGate } from "@/components/ui/premium-gate";

export const metadata = { title: "Insight Session" };

export default async function InsightQuizPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("users").select("subscription_tier").eq("id", user!.id).single();
  const isPremium = data?.subscription_tier === "premium";

  if (!isPremium) return <PremiumPageGate feature="insight_quiz" />;
  return <InsightQuiz />;
}
