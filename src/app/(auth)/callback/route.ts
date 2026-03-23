import { type NextRequest, NextResponse } from "next/server";

// Redirect legacy /callback path to the canonical /auth/callback handler
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  url.pathname = "/auth/callback";
  return NextResponse.redirect(url);
}
