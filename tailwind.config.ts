import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // The Daily Libra design system
        obsidian: {
          DEFAULT: "#0A0A0B",
          50: "#1A1A1E",
          100: "#141418",
          200: "#0F0F13",
          300: "#0A0A0B",
        },
        charcoal: {
          DEFAULT: "#1A1A2E",
          50: "#2A2A42",
          100: "#222238",
          200: "#1A1A2E",
          300: "#141426",
        },
        plum: {
          DEFAULT: "#2D1B4E",
          50: "#4A2E7A",
          100: "#3D2564",
          200: "#2D1B4E",
          300: "#201238",
        },
        bronze: {
          DEFAULT: "#B8860B",
          50: "#D4A017",
          100: "#C9930F",
          200: "#B8860B",
          300: "#A07508",
        },
        gold: {
          DEFAULT: "#C9A84C",
          50: "#E2C878",
          100: "#D8B862",
          200: "#C9A84C",
          300: "#B89438",
        },
        rose: {
          DEFAULT: "#C4A09A",
          50: "#DBC4C0",
          100: "#D2B4AF",
          200: "#C4A09A",
          300: "#B08C86",
        },
        // Override shadcn defaults
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.25" }],
        "display-xs": ["1.5rem", { lineHeight: "1.3" }],
      },
      backgroundImage: {
        "cosmic-gradient": "radial-gradient(ellipse at top, #2D1B4E 0%, #0A0A0B 50%, #1A1A2E 100%)",
        "gold-shimmer": "linear-gradient(135deg, #C9A84C 0%, #B8860B 50%, #C9A84C 100%)",
        "card-glass":
          "linear-gradient(135deg, rgba(201, 168, 76, 0.05) 0%, rgba(45, 27, 78, 0.1) 100%)",
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(201, 168, 76, 0.3), 0 0 40px rgba(201, 168, 76, 0.1)",
        "glow-plum": "0 0 20px rgba(45, 27, 78, 0.5), 0 0 60px rgba(45, 27, 78, 0.2)",
        "card-luxury": "0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(201, 168, 76, 0.1) inset",
        "inner-gold": "inset 0 1px 0 rgba(201, 168, 76, 0.2)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "particle-drift": "particle-drift 20s linear infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "particle-drift": {
          "0%": { transform: "translateY(100vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "0.6" },
          "90%": { opacity: "0.3" },
          "100%": { transform: "translateY(-100px) rotate(720deg)", opacity: "0" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
