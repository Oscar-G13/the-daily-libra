import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, FROM_EMAIL } from "@/lib/email/client";
import { NewReadingNotificationEmail } from "@/lib/email/templates/new-reading-notification";
import { render } from "@react-email/components";

/** PATCH /api/guide/clients/[id]/reading/[readingId] — update or publish a reading */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; readingId: string }> }
) {
  const { id, readingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Fetch current reading state
  const { data: reading } = await (supabase as any)
    .from("guide_readings")
    .select("*, guide_client_connections(client_email, client_name)")
    .eq("id", readingId)
    .eq("guide_id", user.id)
    .single();

  if (!reading) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json();
  const allowed = ["title", "content", "reading_type", "is_published", "is_archived"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const publishingNow = updates.is_published === true && !reading.is_published;
  if (publishingNow) {
    updates.published_at = new Date().toISOString();
  }

  await (supabase as any)
    .from("guide_readings")
    .update(updates)
    .eq("id", readingId)
    .eq("guide_id", user.id);

  // Send notification email when publishing for the first time
  if (publishingNow) {
    const connection = reading.guide_client_connections;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://thedailylibra.com";
    const readingUrl = `${appUrl}/guidance/${readingId}`;
    const html = await render(
      NewReadingNotificationEmail({
        guideName: userData?.display_name ?? "Your Guide",
        clientName: connection?.client_name ?? null,
        readingTitle: updates.title as string ?? reading.title,
        readingType: updates.reading_type as string ?? reading.reading_type,
        readingUrl,
        appUrl,
      })
    );
    getResendClient()
      .emails.send({
        from: FROM_EMAIL,
        to: connection?.client_email,
        subject: `${userData?.display_name ?? "Your Guide"} sent you a new reading`,
        html,
      })
      .catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

/** DELETE — archive a reading */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; readingId: string }> }
) {
  const { readingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await (supabase as any)
    .from("guide_readings")
    .update({ is_archived: true })
    .eq("id", readingId)
    .eq("guide_id", user.id);

  return NextResponse.json({ ok: true });
}
