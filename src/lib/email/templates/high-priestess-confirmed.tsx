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

interface HighPriestessConfirmedEmailProps {
  displayName: string;
  appUrl: string;
  guideRole?: string | null;
}

export function HighPriestessConfirmedEmail({
  displayName,
  appUrl,
  guideRole,
}: HighPriestessConfirmedEmailProps) {
  const firstName = displayName.split(" ")[0] ?? displayName;
  const guideTitle = guideRole === "high_priest" ? "High Priest" : "High Priestess";

  return (
    <Html>
      <Head />
      <Preview>Your High Priestess studio is ready.</Preview>
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
              🌙 The Daily Libra · {guideTitle}
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
              Your studio is open, {firstName}.
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
              {guideTitle} is active. You now have access to the Guide Studio — your private
              workspace for managing clients, delivering custom readings, and tracking their
              cosmic journey.
            </Text>
            <Text
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "rgba(232,227,218,0.8)",
                margin: "0",
              }}
            >
              You start with 3 client slots. Invite your first client from the Guide Studio and
              begin sending them personalized readings directly through the app.
            </Text>
          </Section>

          <Section style={{ marginBottom: "16px" }}>
            <Text
              style={{
                fontSize: "13px",
                color: "rgba(196,160,90,0.7)",
                margin: "0 0 8px 0",
              }}
            >
              What&apos;s included in your studio:
            </Text>
            {[
              "Client management dashboard (up to 3 profiles)",
              "Custom reading delivery — delivered directly to clients",
              "Client transit + chart overview",
              "All standard premium features",
            ].map((item) => (
              <Text
                key={item}
                style={{
                  fontSize: "13px",
                  color: "rgba(232,227,218,0.65)",
                  margin: "0 0 6px 0",
                  paddingLeft: "16px",
                }}
              >
                ✦ {item}
              </Text>
            ))}
          </Section>

          <Section style={{ marginBottom: "40px" }}>
            <Link
              href={`${appUrl}/guide`}
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
              Open Guide Studio →
            </Link>
          </Section>

          <Text
            style={{
              fontSize: "12px",
              color: "rgba(232,227,218,0.35)",
              margin: "0",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "24px",
            }}
          >
            Manage your subscription at{" "}
            <Link href={`${appUrl}/subscription`} style={{ color: "rgba(232,227,218,0.35)" }}>
              thedailylibra.com/subscription
            </Link>
            . Questions?{" "}
            <Link href="mailto:hello@thedailylibra.com" style={{ color: "rgba(232,227,218,0.35)" }}>
              hello@thedailylibra.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
