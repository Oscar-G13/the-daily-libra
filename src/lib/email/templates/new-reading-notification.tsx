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

interface NewReadingNotificationEmailProps {
  guideName: string;
  clientName: string | null;
  readingTitle: string;
  readingType: string;
  readingUrl: string;
  appUrl: string;
}

const TYPE_LABELS: Record<string, string> = {
  custom: "Personal Reading",
  love_forecast: "Love Forecast",
  year_ahead: "Year Ahead",
  natal_summary: "Natal Chart Summary",
  transit_report: "Transit Report",
  monthly: "Monthly Reading",
};

export function NewReadingNotificationEmail({
  guideName,
  clientName,
  readingTitle,
  readingType,
  readingUrl,
  appUrl,
}: NewReadingNotificationEmailProps) {
  const greeting = clientName ? clientName.split(" ")[0] : "there";
  const typeLabel = TYPE_LABELS[readingType] ?? "Reading";

  return (
    <Html>
      <Head />
      <Preview>{guideName} sent you a new {typeLabel.toLowerCase()}.</Preview>
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
              🔮 The Daily Libra · New Guidance
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
              A new reading is waiting, {greeting}.
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
              <strong style={{ color: "#f5f0e8" }}>{guideName}</strong> just sent you a new{" "}
              <em>{typeLabel}</em>:
            </Text>
            <Text
              style={{
                fontSize: "17px",
                color: "rgba(196,160,90,0.85)",
                fontStyle: "italic",
                margin: "0",
                paddingLeft: "16px",
                borderLeft: "1px solid rgba(196,160,90,0.3)",
              }}
            >
              &ldquo;{readingTitle}&rdquo;
            </Text>
          </Section>

          <Section style={{ marginBottom: "40px" }}>
            <Link
              href={readingUrl}
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
              Read it now →
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
            You received this because you&apos;re connected with {guideName} on The Daily Libra.
            Manage your connections at{" "}
            <Link href={`${appUrl}/guidance`} style={{ color: "rgba(232,227,218,0.35)" }}>
              thedailylibra.com/guidance
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
