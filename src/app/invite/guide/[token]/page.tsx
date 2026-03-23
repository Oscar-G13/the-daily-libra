import { notFound } from "next/navigation";
import { PublicGuidePage } from "@/components/guide/public-guide-page";
import { getGuideInviteProfileByToken } from "@/lib/guide/public-profile";

export default async function GuideInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getGuideInviteProfileByToken(token);
  if (!result) notFound();

  return (
    <>
      <PublicGuidePage guide={result.guide} invitation={result.invitation} />
      <script
        dangerouslySetInnerHTML={{
          __html: `localStorage.setItem('guide_token', '${token.replace(/'/g, "")}');`,
        }}
      />
    </>
  );
}
