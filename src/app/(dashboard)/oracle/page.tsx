import { createClient } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/premium";
import { OracleInterface } from "@/components/oracle/oracle-interface";

export const metadata = { title: "Celestial Oracle" };

export default async function OraclePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("display_name, subscription_tier")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🔮</span>
          <h1 className="font-serif text-display-xs text-foreground">Celestial Oracle</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask the cosmos anything — your chart, transits, patterns, and path forward.
        </p>
      </div>
      <OracleInterface
        displayName={userData?.display_name ?? ""}
        isPremium={hasFullAccess(userData?.subscription_tier)}
      />
    </div>
  );
}
