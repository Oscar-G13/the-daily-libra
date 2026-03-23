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

interface WelcomeEmailProps {
  displayName: string;
  appUrl: string;
}

export function WelcomeEmail({ displayName, appUrl }: WelcomeEmailProps) {
  const firstName = displayName.split(" ")[0] ?? displayName;

  return (
    <Html>
      <Head />
      <Preview>Welcome to The Daily Libra, {firstName}.</Preview>
      <Body
        style={{
          backgroundColor: "#0d0d14",
          fontFamily: "Georgia, serif",
          color: "#e8e3da",
        }}
      >
        <Container
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            padding: "48px 24px",
          }}
        >
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
              ♎ The Daily Libra
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
              Welcome, {firstName}.
            </Heading>
          </Section>

          <Section style={{ marginBottom: "32px" }}>
            <Text
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "rgba(232,227,218,0.8)",
                margin: "0 0 16px 0",
              }}
            >
              Your profile is live. Your natal chart is calculated. Your archetype is waiting to be
              discovered.
            </Text>
            <Text
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "rgba(232,227,218,0.8)",
                margin: "0",
              }}
            >
              Start with a daily reading, or take the deep assessment — 130 questions that will tell
              you things about yourself you&apos;ve been dancing around for years.
            </Text>
          </Section>

          <Section style={{ marginBottom: "40px" }}>
            <Link
              href={`${appUrl}/dashboard`}
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
              Open your dashboard →
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
            The Daily Libra · Built for Libras, only. ·{" "}
            <Link href={`${appUrl}/privacy`} style={{ color: "rgba(232,227,218,0.35)" }}>
              Privacy
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
