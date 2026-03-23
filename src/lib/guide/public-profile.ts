import { createServiceClient } from "@/lib/supabase/server";
import { isHighPriestess } from "@/lib/premium";
import type { Database } from "@/types/database.types";
import {
  normalizeGuideProfileLayout,
  normalizeGuideProfileTheme,
  type GuideProfileLayout,
  type GuideProfileTheme,
} from "@/lib/guide/profile-options";

type GuideProfileRow = Database["public"]["Tables"]["guide_profiles"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

type GuideUserRecord = Pick<
  UserRow,
  "id" | "display_name" | "avatar_url" | "referral_code" | "subscription_tier" | "email"
>;

export interface PublicGuideProfile {
  id: string;
  displayName: string;
  businessName: string;
  brandName: string;
  avatarUrl: string | null;
  tagline: string | null;
  bio: string | null;
  websiteUrl: string | null;
  specialties: string[];
  referralCode: string | null;
  email: string | null;
  publicEnabled: boolean;
  profileTheme: GuideProfileTheme;
  profileLayout: GuideProfileLayout;
  welcomeHeadline: string | null;
  ctaLabel: string | null;
  clientSlots: number;
  clientsCount: number;
  publishedReadings: number;
}

export interface PublicGuideInviteContext {
  token: string;
  clientName: string | null;
}

function buildPublicGuideProfile(
  guideUser: GuideUserRecord,
  guideProfile: GuideProfileRow,
  publishedReadings: number
): PublicGuideProfile {
  const displayName = guideUser.display_name ?? "Your Guide";
  const businessName = guideProfile.business_name ?? displayName;

  return {
    id: guideUser.id,
    displayName,
    businessName,
    brandName: businessName,
    avatarUrl: guideUser.avatar_url ?? null,
    tagline: guideProfile.tagline ?? null,
    bio: guideProfile.bio ?? null,
    websiteUrl: guideProfile.website_url ?? null,
    specialties: guideProfile.specialties ?? [],
    referralCode: guideUser.referral_code ?? null,
    email: guideUser.email ?? null,
    publicEnabled: guideProfile.public_enabled ?? true,
    profileTheme: normalizeGuideProfileTheme(guideProfile.profile_theme),
    profileLayout: normalizeGuideProfileLayout(guideProfile.profile_layout),
    welcomeHeadline: guideProfile.welcome_headline ?? null,
    ctaLabel: guideProfile.cta_label ?? null,
    clientSlots: guideProfile.client_slots ?? 3,
    clientsCount: guideProfile.clients_count ?? 0,
    publishedReadings,
  };
}

async function getPublishedReadingCount(guideId: string) {
  const supabase = await createServiceClient();
  const { count } = await supabase
    .from("guide_readings")
    .select("*", { count: "exact", head: true })
    .eq("guide_id", guideId)
    .eq("is_archived", false)
    .eq("is_published", true);

  return count ?? 0;
}

export async function getPublicGuideByReferralCode(code: string) {
  const supabase = await createServiceClient();

  const { data: guideUserData } = await supabase
    .from("users")
    .select("id, display_name, avatar_url, referral_code, subscription_tier, email")
    .eq("referral_code", code)
    .single();

  const guideUser = guideUserData as GuideUserRecord | null;

  if (!guideUser || !isHighPriestess(guideUser.subscription_tier)) {
    return null;
  }

  const [{ data: guideProfileData }, publishedReadings] = await Promise.all([
    supabase.from("guide_profiles").select("*").eq("id", guideUser.id).single(),
    getPublishedReadingCount(guideUser.id),
  ]);

  const guideProfile = guideProfileData as GuideProfileRow | null;

  if (!guideProfile || !guideProfile.public_enabled) {
    return null;
  }

  return buildPublicGuideProfile(guideUser, guideProfile, publishedReadings);
}

export async function getGuideInviteProfileByToken(token: string) {
  const supabase = await createServiceClient();

  const { data: connectionData } = await supabase
    .from("guide_client_connections")
    .select("guide_id, client_name, status")
    .eq("invite_token", token)
    .single();

  const connection = connectionData as {
    guide_id: string;
    client_name: string | null;
    status: string;
  } | null;

  if (!connection || connection.status === "archived") {
    return null;
  }

  const { data: guideUserData } = await supabase
    .from("users")
    .select("id, display_name, avatar_url, referral_code, subscription_tier, email")
    .eq("id", connection.guide_id)
    .single();

  const guideUser = guideUserData as GuideUserRecord | null;

  if (!guideUser || !isHighPriestess(guideUser.subscription_tier)) {
    return null;
  }

  const [{ data: guideProfileData }, publishedReadings] = await Promise.all([
    supabase.from("guide_profiles").select("*").eq("id", connection.guide_id).single(),
    getPublishedReadingCount(connection.guide_id),
  ]);

  const guideProfile = guideProfileData as GuideProfileRow | null;

  if (!guideProfile) {
    return null;
  }

  return {
    guide: buildPublicGuideProfile(guideUser, guideProfile, publishedReadings),
    invitation: {
      token,
      clientName: connection.client_name ?? null,
    } satisfies PublicGuideInviteContext,
  };
}
