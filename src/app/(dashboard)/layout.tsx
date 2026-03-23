import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { GamificationProvider } from "@/components/gamification/provider";
import { ClaimReferralOnLoad } from "@/components/referral/claim-on-load";
import { ClaimGuideTokenOnLoad } from "@/components/guide/claim-guide-token";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Redirect to onboarding if not completed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileResult = (await (supabase as any)
    .from("users")
    .select("onboarding_completed, display_name, subscription_tier, xp_total, xp_level")
    .eq("id", user.id)
    .single()) as {
    data: {
      onboarding_completed: boolean | null;
      display_name: string | null;
      subscription_tier: string | null;
      xp_total: number | null;
      xp_level: number | null;
    } | null;
  };
  const profile = profileResult.data;

  // Check if user has any active guide connections (for "My Guidance" nav item)
  const { data: guidanceConnections } = await (supabase as any)
    .from("guide_client_connections")
    .select("id")
    .eq("client_user_id", user.id)
    .eq("status", "active")
    .limit(1);
  const hasGuidance = (guidanceConnections?.length ?? 0) > 0;

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

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
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64">
          <ClaimReferralOnLoad />
          <ClaimGuideTokenOnLoad />
          <DashboardNav />
          <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
        </div>
      </div>
    </GamificationProvider>
  );
}
