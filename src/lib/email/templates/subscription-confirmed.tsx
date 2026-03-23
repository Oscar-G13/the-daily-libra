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

interface SubscriptionConfirmedEmailProps {
  displayName: string;
  planName: string;
  appUrl: string;
}

export function SubscriptionConfirmedEmail({
  displayName,
  planName,
  appUrl,
}: SubscriptionConfirmedEmailProps) {
  const firstName = displayName.split(" ")[0] ?? displayName;
  const planLabel = planName.includes("annual") ? "Annual" : "Monthly";

  return (
    <Html>
      <Head />
      <Preview>Premium is active. You&apos;re in.</Preview>
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
              ♎ The Daily Libra · Premium
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
              Premium is active, {firstName}.
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
              Your {planLabel} subscription is confirmed. All 13 reading categories, unlimited AI
              companion access, and every feature we ship going forward — yours.
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
            You can manage or cancel your subscription anytime at{" "}
            <Link href={`${appUrl}/subscription`} style={{ color: "rgba(232,227,218,0.35)" }}>
              thedailylibra.com/subscription
            </Link>
            . Questions?{" "}
            <Link
              href="mailto:billing@thedailylibra.com"
              style={{ color: "rgba(232,227,218,0.35)" }}
            >
              billing@thedailylibra.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
