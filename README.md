# The Daily Libra

> *Built for Libras. Finally.*

A premium, AI-powered astrology web app built exclusively for the Libra sign. Not a generic horoscope with Libra paint on top — a hyper-personalized identity companion powered by birth chart data, behavioral profiling, and memory-aware AI.

---

## Overview

The Daily Libra delivers daily readings, natal chart analysis, compatibility reports, a decision decoder, journaling, and an AI reflection companion — all tuned specifically to Libra psychology, aesthetic sensibility, and emotional tendencies.

**Live:** [thedailylibra.com](https://thedailylibra.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Database & Auth | Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o + Embeddings |
| Payments | Stripe |
| Analytics | PostHog |

---

## Features (Phase 1 MVP)

- **Landing Page** — dark editorial luxury design, Libra-exclusive positioning
- **Authentication** — email/password + Google OAuth via Supabase Auth
- **Onboarding Flow** — birth data intake + 12-category Libra archetype quiz
- **Libra Archetype System** — 10 primary archetypes + 8 secondary modifiers
- **Natal Chart Engine** — birth chart calculation, Venus/Moon/Rising analysis
- **Personalized Dashboard** — daily reading, archetype summary, chart snapshot
- **AI Reading Engine** — readings across 13 categories (love, career, shadow, etc.)
- **Reading Style Modes** — gentle, blunt, poetic, practical, seductive
- **AI Reflection Companion** — memory-aware Libra-tuned conversational guide
- **Journal** — mood-tagged entries with AI trend analysis
- **Premium Subscription** — Stripe-powered free/premium tiers

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- A [Stripe](https://stripe.com) account

### Installation

```bash
git clone https://github.com/oscargarcia-dev/the-daily-libra.git
cd the-daily-libra
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

See [`.env.example`](.env.example) for all required variables.

### Database Setup

```bash
# Run migrations against your Supabase project
supabase db push

# Or apply manually via the Supabase Dashboard SQL editor
# using supabase/migrations/001_initial_schema.sql
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup, OAuth callback
│   ├── (dashboard)/      # Protected app routes
│   ├── (onboarding)/     # Onboarding flow
│   ├── api/              # Route handlers (AI, Stripe, chart)
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── landing/          # Landing page sections
│   ├── dashboard/        # Dashboard modules
│   ├── onboarding/       # Quiz components
│   ├── reading/          # Reading cards and UI
│   ├── companion/        # AI chat interface
│   ├── journal/          # Journal components
│   └── layout/           # Navbar, sidebar
├── lib/
│   ├── supabase/         # Client, server, middleware helpers
│   ├── openai/           # Reading prompts and AI client
│   ├── astrology/        # Chart calculation engine
│   ├── stripe/           # Payment utilities
│   └── utils.ts
├── hooks/                # React hooks
├── stores/               # Zustand stores
└── types/                # TypeScript types + DB types
```

---

## Deployment

Deploy to [Vercel](https://vercel.com) in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/oscargarcia-dev/the-daily-libra)

Set all environment variables in the Vercel dashboard.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## License

MIT — see [LICENSE](LICENSE).

---

*The Daily Libra — Your chart. Your contradictions. Your balance.*
