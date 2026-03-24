import { redirect } from "next/navigation";
import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { GamificationProvider } from "@/components/gamification/provider";
import { ClaimReferralOnLoad } from "@/components/referral/claim-on-load";
import { ClaimGuideTokenOnLoad } from "@/components/guide/claim-guide-token";
import { AlertBanner } from "@/components/alerts/alert-banner";

interface DashboardProfile {
  onboarding_completed: boolean | null;
  display_name: string | null;
  subscription_tier: string | null;
  xp_total: number | null;
  xp_level: number | null;
}

interface AdminProfile {
  is_admin: boolean | null;
}

interface GuidanceConnection {
  id: string;
}

function logOptionalDashboardError(label: string, userId: string, error: PostgrestError | null) {
  if (!error) return;

  console.warn(`Dashboard optional metadata unavailable: ${label}`, {
    userId,
    error,
  });
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Gate access using only fields that exist for every supported schema version.
  // Optional metadata is fetched separately so missing later columns can't cause redirect loops.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileResult = (await (supabase as any)
    .from("users")
    .select("onboarding_completed, display_name, subscription_tier, xp_total, xp_level")
    .eq("id", user.id)
    .maybeSingle()) as {
    data: DashboardProfile | null;
    error: PostgrestError | null;
  };
  const profile = profileResult.data;

  if (profileResult.error) {
    console.error("Dashboard profile query failed", {
      userId: user.id,
      error: profileResult.error,
    });
    throw new Error("Failed to load dashboard profile.");
  }

  if (!profile) {
    console.error("Dashboard profile missing", { userId: user.id });
    throw new Error("Your profile could not be loaded.");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const [adminProfileResult, guidanceResult, guideRoleResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("users").select("is_admin").eq("id", user.id).maybeSingle() as Promise<{
      data: AdminProfile | null;
      error: PostgrestError | null;
    }>,
    // Check if user has any active guide connections (for "My Guidance" nav item)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("guide_client_connections")
      .select("id")
      .eq("client_user_id", user.id)
      .eq("status", "active")
      .limit(1) as Promise<{
      data: GuidanceConnection[] | null;
      error: PostgrestError | null;
    }>,
    // Fetch guide_role for high_priestess tier users (for dynamic title display)
    profile.subscription_tier === "high_priestess"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase as any)
          .from("guide_profiles")
          .select("guide_role")
          .eq("id", user.id)
          .maybeSingle() as Promise<{ data: { guide_role: string | null } | null; error: PostgrestError | null }>
      : Promise.resolve({ data: null, error: null }),
  ]);

  logOptionalDashboardError("is_admin", user.id, adminProfileResult.error);
  logOptionalDashboardError("guide_client_connections", user.id, guidanceResult.error);

  const hasGuidance = (guidanceResult.data?.length ?? 0) > 0;
  const isAdmin = adminProfileResult.data?.is_admin ?? false;
  const guideRole = guideRoleResult.data?.guide_role ?? null;

  // Update streak — fire and forget, non-blocking
  void (async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: streakData } = await supabase
      .from("users")
      .select("app_streak, last_active_date")
      .eq("id", user.id)
      .single();

    if (streakData) {
      const last = streakData.last_active_date;
      if (last !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        const newStreak = last === yesterdayStr ? (streakData.app_streak ?? 0) + 1 : 1;
        await supabase
          .from("users")
          .update({ app_streak: newStreak, last_active_date: todayStr })
          .eq("id", user.id);
      }
    }
  })();

  return (
    <GamificationProvider initialXP={profile?.xp_total ?? 0} initialLevel={profile?.xp_level ?? 1}>
      <div className="min-h-screen bg-obsidian flex">
        {/* Sidebar */}
        <DashboardSidebar
          displayName={profile?.display_name ?? ""}
          tier={profile?.subscription_tier ?? "free"}
          initialXP={profile?.xp_total ?? 0}
          initialLevel={profile?.xp_level ?? 1}
          hasGuidance={hasGuidance}
          isAdmin={isAdmin}
          guideRole={guideRole}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64">
          <ClaimReferralOnLoad />
          <ClaimGuideTokenOnLoad />
          <AlertBanner />
          <DashboardNav />
          <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
        </div>
      </div>
    </GamificationProvider>
  );
}
