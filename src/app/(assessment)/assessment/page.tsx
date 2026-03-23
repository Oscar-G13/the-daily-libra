import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssessmentShell } from "@/components/assessment/assessment-shell";

export default async function AssessmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // If they already have a completed profile, send them back to dashboard
  const { data: existingProfile } = await supabase
    .from("user_profile_summary")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile) {
    redirect("/dashboard");
  }

  return <AssessmentShell />;
}
