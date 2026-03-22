import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Daily Libra — AI Astrology for Libras",
    template: "%s | The Daily Libra",
  },
  description:
    "A premium AI-powered astrology experience built exclusively for Libras. Hyper-personalized readings, birth chart insights, compatibility analysis, and daily rituals — built around who you actually are.",
  keywords: [
    "Libra astrology",
    "AI horoscope",
    "birth chart",
    "Libra compatibility",
    "daily reading",
    "astrology app",
    "personalized horoscope",
  ],
  authors: [{ name: "The Daily Libra" }],
  creator: "The Daily Libra",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "The Daily Libra",
    title: "The Daily Libra — Built for Libras. Finally.",
    description:
      "AI-powered astrology built exclusively for the Libra sign. Your chart, your contradictions, your balance.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "The Daily Libra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Daily Libra — Built for Libras. Finally.",
    description: "AI astrology built exclusively for Libra.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
