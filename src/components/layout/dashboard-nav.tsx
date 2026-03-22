"use client";

import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DashboardNav() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-white/[0.04] bg-obsidian/80 backdrop-blur-md flex items-center justify-between px-6">
      <p className="text-xs text-muted-foreground hidden sm:block">
        {formatDate(new Date())}
      </p>
      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={handleSignOut}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
