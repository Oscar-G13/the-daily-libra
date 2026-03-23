import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Daily Libra — Personalized astrology for Libras";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0d0d14 0%, #1a1025 50%, #0d0d14 100%)",
        fontFamily: "serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,160,90,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,90,167,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Symbol */}
      <div
        style={{
          fontSize: 52,
          color: "rgba(196,160,90,0.5)",
          marginBottom: 20,
          letterSpacing: "0.5em",
        }}
      >
        ♎
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 300,
          color: "#f5f0e8",
          letterSpacing: "0.04em",
          marginBottom: 16,
        }}
      >
        The Daily Libra
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 26,
          color: "rgba(196,160,90,0.7)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontFamily: "sans-serif",
          fontWeight: 300,
        }}
      >
        Know yourself. Finally.
      </div>

      {/* Divider */}
      <div
        style={{
          width: 80,
          height: 1,
          background: "rgba(196,160,90,0.3)",
          marginTop: 32,
        }}
      />
    </div>,
    { ...size }
  );
}
