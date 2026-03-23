import { redirect } from "next/navigation";
import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

interface OnboardingProfile {
  onboarding_completed: boolean | null;
  display_name: string | null;
}

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileResult = (await supabase
    .from("users")
    .select("onboarding_completed, display_name")
    .eq("id", user.id)
    .maybeSingle()) as {
    data: OnboardingProfile | null;
    error: PostgrestError | null;
  };
  const profile = profileResult.data;

  if (profileResult.error) {
    console.error("Onboarding profile query failed", {
      userId: user.id,
      error: profileResult.error,
    });
    throw new Error("Failed to load onboarding state.");
  }

  if (!profile) {
    console.error("Onboarding profile missing", { userId: user.id });
    throw new Error("Your profile could not be loaded.");
  }

  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  return <OnboardingFlow userId={user.id} displayName={profile.display_name ?? ""} />;
}
