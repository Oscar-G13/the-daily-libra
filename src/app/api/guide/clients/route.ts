import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isHighPriestess } from "@/lib/premium";
import { getResendClient, FROM_EMAIL } from "@/lib/email/client";
import { GuideInvitationEmail } from "@/lib/email/templates/guide-invitation";
import { render } from "@react-email/components";
import crypto from "crypto";

/** GET /api/guide/clients — list all clients */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();
  if (!isHighPriestess(userData?.subscription_tier)) {
    return NextResponse.json({ error: "High Priestess tier required." }, { status: 403 });
  }

  const { data: clients } = await (supabase as any)
    .from("guide_client_connections")
    .select("*")
    .eq("guide_id", user.id)
    .order("created_at", { ascending: false });

  const list = clients ?? [];

  if (list.length === 0) return NextResponse.json({ clients: [] });

  const connectionIds = list.map((c: any) => c.id);
  const linkedUserIds = list.filter((c: any) => c.client_user_id).map((c: any) => c.client_user_id);

  // Fetch reading stats per connection
  const { data: readingRows } = await (supabase as any)
    .from("guide_readings")
    .select("client_connection_id, client_viewed_at, published_at, is_published")
    .eq("guide_id", user.id)
    .eq("is_archived", false)
    .in("client_connection_id", connectionIds);

  // Fetch linked user activity
  const { data: linkedUsers } = linkedUserIds.length
    ? await (supabase as any)
        .from("users")
        .select("id, app_streak, xp_level, last_active_date")
        .in("id", linkedUserIds)
    : { data: [] };

  // Build maps
  const readingCountMap: Record<string, number> = {};
  const unreadCountMap: Record<string, number> = {};
  const lastReadingMap: Record<string, string | null> = {};

  (readingRows ?? []).forEach((r: any) => {
    const cid = r.client_connection_id;
    if (r.is_published) {
      readingCountMap[cid] = (readingCountMap[cid] ?? 0) + 1;
      if (!r.client_viewed_at) unreadCountMap[cid] = (unreadCountMap[cid] ?? 0) + 1;
      if (!lastReadingMap[cid] || r.published_at > lastReadingMap[cid]!) {
        lastReadingMap[cid] = r.published_at;
      }
    }
  });

  const userActivityMap: Record<string, any> = {};
  (linkedUsers ?? []).forEach((u: any) => { userActivityMap[u.id] = u; });

  // Enrich clients
  const enriched = list.map((c: any) => ({
    ...c,
    reading_count: readingCountMap[c.id] ?? 0,
    unread_count: unreadCountMap[c.id] ?? 0,
    last_reading_date: lastReadingMap[c.id] ?? null,
    linked_user: c.client_user_id ? userActivityMap[c.client_user_id] ?? null : null,
  }));

  return NextResponse.json({ clients: enriched });
}

/** POST /api/guide/clients — invite a new client */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check tier
  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier, display_name")
    .eq("id", user.id)
    .single();
  if (!userData || !isHighPriestess(userData.subscription_tier)) {
    return NextResponse.json({ error: "High Priestess tier required." }, { status: 403 });
  }

  // Check slot availability
  const { data: gp } = await (supabase as any)
    .from("guide_profiles")
    .select("client_slots, clients_count, business_name")
    .eq("id", user.id)
    .single();

  const activeCount = gp?.clients_count ?? 0;
  const maxSlots = gp?.client_slots ?? 3;
  if (activeCount >= maxSlots) {
    return NextResponse.json(
      { error: `Client slot limit reached (${maxSlots}). Upgrade to add more.` },
      { status: 409 }
    );
  }

  const { client_email, client_name, client_birth_date, client_birth_time, client_birth_city } =
    await req.json();

  if (!client_email?.includes("@")) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  // Check for duplicate pending/active connection
  const { data: existing } = await (supabase as any)
    .from("guide_client_connections")
    .select("id, status")
    .eq("guide_id", user.id)
    .eq("client_email", client_email.toLowerCase().trim())
    .in("status", ["pending", "active"])
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You already have an active or pending invite for this email." },
      { status: 409 }
    );
  }

  const token = crypto.randomBytes(16).toString("hex"); // 32-char hex
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://thedailylibra.com";
  const inviteUrl = `${appUrl}/invite/guide/${token}`;

  const { data: connection, error } = await (supabase as any)
    .from("guide_client_connections")
    .insert({
      guide_id: user.id,
      client_email: client_email.toLowerCase().trim(),
      client_name: client_name ?? null,
      client_birth_date: client_birth_date ?? null,
      client_birth_time: client_birth_time ?? null,
      client_birth_city: client_birth_city ?? null,
      invite_token: token,
      invite_sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send invitation email
  const guideName = userData.display_name ?? "Your Guide";
  const html = await render(
    GuideInvitationEmail({
      guideName,
      guideBusinessName: gp?.business_name ?? null,
      clientName: client_name ?? null,
      inviteUrl,
      appUrl,
    })
  );

  await getResendClient()
    .emails.send({
      from: FROM_EMAIL,
      to: client_email.trim(),
      subject: `${guideName} invited you to receive personalized readings`,
      html,
    })
    .catch(() => {}); // non-fatal if email fails

  return NextResponse.json({ connection });
}
