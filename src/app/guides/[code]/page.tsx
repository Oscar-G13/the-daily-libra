import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicGuidePage } from "@/components/guide/public-guide-page";
import { getPublicGuideByReferralCode } from "@/lib/guide/public-profile";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const guide = await getPublicGuideByReferralCode(code);

  if (!guide) {
    return {
      title: "Guide Studio | The Daily Libra",
    };
  }

  return {
    title: `${guide.brandName} | Guide Studio`,
    description:
      guide.tagline ??
      `Private readings, custom astrology guidance, and client access with ${guide.brandName}.`,
  };
}

export default async function PublicGuideProfilePage({ params }: Props) {
  const { code } = await params;
  const guide = await getPublicGuideByReferralCode(code);

  if (!guide) {
    notFound();
  }

  return <PublicGuidePage guide={guide} />;
}
