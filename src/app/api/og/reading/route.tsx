import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const excerpt = searchParams.get("excerpt") ?? "Your daily reading awaits.";
  const category = searchParams.get("category") ?? "daily";
  const archetype = searchParams.get("archetype") ?? "The Diplomat";
  const date =
    searchParams.get("date") ??
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const truncated = excerpt.length > 200 ? excerpt.slice(0, 197) + "…" : excerpt;

  const CATEGORY_COLORS: Record<string, string> = {
    daily: "#C9A84C",
    love: "#E07B8F",
    shadow: "#9B8AC4",
    career: "#6BA3BE",
    healing: "#7DBE96",
    weekly: "#C9A84C",
    monthly: "#C9A84C",
  };

  const accentColor = CATEGORY_COLORS[category] ?? "#C9A84C";

  return new ImageResponse(
    <div
      style={{
        width: "1080px",
        height: "1080px",
        background: "linear-gradient(135deg, #0D0D14 0%, #13131E 50%, #0D0D14 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
        fontFamily: "serif",
        position: "relative",
      }}
    >
      {/* Corner ornaments */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 60,
          height: 60,
          border: `1px solid ${accentColor}30`,
          borderRight: "none",
          borderBottom: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          width: 60,
          height: 60,
          border: `1px solid ${accentColor}30`,
          borderLeft: "none",
          borderTop: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: "absolute",
          top: 48,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 28, color: accentColor }}>⚖</span>
        <span style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", letterSpacing: 2 }}>
          THE DAILY LIBRA
        </span>
      </div>

      {/* Category badge */}
      <div
        style={{
          marginBottom: 32,
          padding: "6px 18px",
          border: `1px solid ${accentColor}40`,
          borderRadius: 100,
          fontSize: 13,
          color: accentColor,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {category} reading
      </div>

      {/* Reading excerpt */}
      <div
        style={{
          fontSize: 32,
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.88)",
          textAlign: "center",
          maxWidth: 820,
          fontStyle: "italic",
          marginBottom: 40,
        }}
      >
        &ldquo;{truncated}&rdquo;
      </div>

      {/* Divider */}
      <div
        style={{
          width: 120,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
          marginBottom: 32,
        }}
      />

      {/* Archetype + date */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16, color: `${accentColor}90`, letterSpacing: 1 }}>
          {archetype}
        </span>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>
          {date}
        </span>
      </div>

      {/* Bottom watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          fontSize: 13,
          color: "rgba(255,255,255,0.2)",
          letterSpacing: 2,
        }}
      >
        thedailylibra.com
      </div>
    </div>,
    {
      width: 1080,
      height: 1080,
    }
  );
}
