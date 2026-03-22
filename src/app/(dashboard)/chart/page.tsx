import { createClient } from "@/lib/supabase/server";
import { ChartView } from "@/components/chart/chart-view";
import type { NatalChart } from "@/types";

export const metadata = { title: "Birth Chart" };

export default async function ChartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: birthProfile } = await supabase
    .from("birth_profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const chart = birthProfile?.natal_chart_json as NatalChart | null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-display-xs text-foreground">Birth Chart</h1>
        <p className="text-sm text-muted-foreground mt-1">Your natal map — in plain language.</p>
      </div>

      <ChartView
        chart={chart}
        birthCity={birthProfile?.birth_city}
        birthDate={birthProfile?.birth_date}
        birthTime={birthProfile?.birth_time}
      />
    </div>
  );
}
