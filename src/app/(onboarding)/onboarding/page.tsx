import { redirect } from "next/navigation";
import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { StoreGuideToken } from "@/components/onboarding/store-guide-token";

interface OnboardingProfile {
  onboarding_completed: boolean | null;
  display_name: string | null;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ guide_token?: string }>;
}) {
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

  const resolvedParams = searchParams ? await searchParams : {};
  const guideToken = resolvedParams.guide_token ?? null;

  return (
    <>
      {/* Re-hydrate guide_token into localStorage if it arrived via email confirmation URL */}
      {guideToken && <StoreGuideToken token={guideToken} />}
      <OnboardingFlow userId={user.id} displayName={profile.display_name ?? ""} />
    </>
  );
}
