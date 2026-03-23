import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isHighPriestess } from "@/lib/premium";
import { getResendClient, FROM_EMAIL } from "@/lib/email/client";
import { NewReadingNotificationEmail } from "@/lib/email/templates/new-reading-notification";
import { render } from "@react-email/components";

/** GET /api/guide/clients/[id]/reading — list readings for a client */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: readings } = await (supabase as any)
    .from("guide_readings")
    .select("*")
    .eq("client_connection_id", id)
    .eq("guide_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  return NextResponse.json({ readings: readings ?? [] });
}

/** POST /api/guide/clients/[id]/reading — create a reading for a client */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier, display_name")
    .eq("id", user.id)
    .single();
  if (!userData || !isHighPriestess(userData.subscription_tier)) {
    return NextResponse.json({ error: "High Priestess tier required." }, { status: 403 });
  }

  // Verify connection belongs to this guide
  const { data: connection } = await (supabase as any)
    .from("guide_client_connections")
    .select("id, client_email, client_name, client_user_id")
    .eq("id", id)
    .eq("guide_id", user.id)
    .single();
  if (!connection) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const { title, content, reading_type, publish } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content required." }, { status: 400 });
  }

  const validTypes = ["custom", "love_forecast", "year_ahead", "natal_summary", "transit_report", "monthly"];
  const rType = validTypes.includes(reading_type) ? reading_type : "custom";

  const now = new Date().toISOString();
  const isPublished = Boolean(publish);

  const { data: reading, error } = await (supabase as any)
    .from("guide_readings")
    .insert({
      guide_id: user.id,
      client_connection_id: id,
      title: title.trim(),
      content: content.trim(),
      reading_type: rType,
      is_published: isPublished,
      published_at: isPublished ? now : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email notification if published
  if (isPublished) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://thedailylibra.com";
    const readingUrl = `${appUrl}/guidance/${reading.id}`;
    const html = await render(
      NewReadingNotificationEmail({
        guideName: userData.display_name ?? "Your Guide",
        clientName: connection.client_name ?? null,
        readingTitle: title.trim(),
        readingType: rType,
        readingUrl,
        appUrl,
      })
    );
    getResendClient()
      .emails.send({
        from: FROM_EMAIL,
        to: connection.client_email,
        subject: `${userData.display_name ?? "Your Guide"} sent you a new reading`,
        html,
      })
      .catch(() => {});
  }

  return NextResponse.json({ reading });
}
