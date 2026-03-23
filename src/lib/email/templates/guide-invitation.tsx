import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface GuideInvitationEmailProps {
  guideName: string;
  guideBusinessName: string | null;
  clientName: string | null;
  inviteUrl: string;
  appUrl: string;
}

export function GuideInvitationEmail({
  guideName,
  guideBusinessName,
  clientName,
  inviteUrl,
  appUrl,
}: GuideInvitationEmailProps) {
  const greeting = clientName ? clientName.split(" ")[0] : "there";
  const senderLabel = guideBusinessName ?? guideName;

  return (
    <Html>
      <Head />
      <Preview>{guideName} wants to send you personalized readings on The Daily Libra.</Preview>
      <Body
        style={{
          backgroundColor: "#0d0d14",
          fontFamily: "Georgia, serif",
          color: "#e8e3da",
        }}
      >
        <Container style={{ maxWidth: "520px", margin: "0 auto", padding: "48px 24px" }}>
          <Section style={{ marginBottom: "32px" }}>
            <Text
              style={{
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(196,160,90,0.6)",
                margin: "0 0 8px 0",
              }}
            >
              🌙 The Daily Libra · Invitation
            </Text>
            <Heading
              style={{
                fontSize: "28px",
                fontWeight: 300,
                color: "#f5f0e8",
                margin: "0 0 16px 0",
                lineHeight: 1.3,
              }}
            >
              You&apos;ve been invited, {greeting}.
            </Heading>
          </Section>

          <Section style={{ marginBottom: "24px" }}>
            <Text
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "rgba(232,227,218,0.8)",
                margin: "0 0 16px 0",
              }}
            >
              <strong style={{ color: "#f5f0e8" }}>{senderLabel}</strong> would like to send you
              personalized astrology readings and guidance through The Daily Libra.
            </Text>
            <Text
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "rgba(232,227,218,0.8)",
                margin: "0",
              }}
            >
              Once you accept, your readings will appear in a private &ldquo;My Guidance&rdquo;
              section — separate from everything else, just for you.
            </Text>
          </Section>

          <Section style={{ marginBottom: "40px" }}>
            <Link
              href={inviteUrl}
              style={{
                display: "inline-block",
                backgroundColor: "transparent",
                border: "1px solid rgba(196,160,90,0.4)",
                color: "rgba(196,160,90,0.8)",
                padding: "12px 28px",
                borderRadius: "100px",
                fontSize: "13px",
                letterSpacing: "0.05em",
                textDecoration: "none",
              }}
            >
              Accept invitation →
            </Link>
          </Section>

          <Text
            style={{
              fontSize: "13px",
              color: "rgba(232,227,218,0.5)",
              margin: "0 0 24px 0",
              lineHeight: "1.6",
            }}
          >
            No subscription is required. You&apos;ll create a free account (or sign in) to
            receive your readings. You&apos;re always in control — you can disconnect at any time.
          </Text>

          <Text
            style={{
              fontSize: "12px",
              color: "rgba(232,227,218,0.35)",
              margin: "0",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "24px",
            }}
          >
            This invitation was sent by {guideName} via The Daily Libra. If you weren&apos;t
            expecting this, you can safely ignore it.{" "}
            <Link href={appUrl} style={{ color: "rgba(232,227,218,0.35)" }}>
              thedailylibra.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
