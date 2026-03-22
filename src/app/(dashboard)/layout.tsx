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
