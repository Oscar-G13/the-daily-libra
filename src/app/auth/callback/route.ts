import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, FROM_EMAIL } from "@/lib/email/client";
import { WelcomeEmail } from "@/lib/email/templates/welcome";
import { render } from "@react-email/components";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  // Forwarded from emailRedirectTo so cross-device email confirmation keeps the token
  const guideToken = searchParams.get("guide_token");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("onboarding_completed, display_name, email")
          .eq("id", user.id)
          .single();

        const isNewUser = !profile?.onboarding_completed;

        // Send welcome email to brand-new users
        if (isNewUser && (profile?.email ?? user.email)) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://thedailylibra.com";
          const html = await render(
            WelcomeEmail({
              displayName: profile?.display_name ?? user.email ?? "Libra",
              appUrl,
            })
          );
          getResendClient()
            .emails.send({
              from: FROM_EMAIL,
              to: (profile?.email ?? user.email)!,
              subject: "Welcome to The Daily Libra.",
              html,
            })
            .catch(() => {});
        }

        if (isNewUser) {
          // Pass guide_token to onboarding so the flow can claim it after completion
          const onboardUrl = new URL("/onboarding", origin);
          if (guideToken) onboardUrl.searchParams.set("guide_token", guideToken);
          return NextResponse.redirect(onboardUrl.toString());
        }
      }

      // Existing user — forward guide_token so ClaimGuideTokenOnLoad can find it
      const destUrl = new URL(next.startsWith("/") ? next : "/dashboard", origin);
      if (guideToken) destUrl.searchParams.set("guide_token", guideToken);
      return NextResponse.redirect(destUrl.toString());
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
