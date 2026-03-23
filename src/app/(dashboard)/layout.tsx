import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Redirect to onboarding if not completed
  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_completed, display_name, subscription_tier")
    .eq("id", user.id)
    .single();

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
    <div className="min-h-screen bg-obsidian flex">
      {/* Sidebar */}
      <DashboardSidebar
        displayName={profile?.display_name ?? ""}
        tier={profile?.subscription_tier ?? "free"}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64">
        <DashboardNav />
        <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
