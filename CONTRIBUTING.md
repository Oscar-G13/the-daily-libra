# Contributing to The Daily Libra

Thank you for your interest in contributing. This document covers the development workflow, code standards, and how to submit changes.

---

## Development Setup

```bash
git clone https://github.com/oscargarcia-dev/the-daily-libra.git
cd the-daily-libra
npm install
cp .env.example .env.local
# Fill in environment variables
npm run dev
```

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected, requires PR |
| `develop` | Integration branch |
| `feat/*` | Feature branches |
| `fix/*` | Bug fix branches |
| `chore/*` | Tooling, deps, config |

**Always branch off `develop`, never `main`.**

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

Examples:
```
feat(onboarding): add Libra archetype quiz step 3
fix(reading): correct archetype context passed to OpenAI prompt
chore(deps): upgrade framer-motion to v11
```

---

## Code Standards

- **TypeScript**: strict mode, no `any` unless explicitly justified
- **Components**: functional only, no class components
- **Formatting**: Prettier (auto via `npm run format`)
- **Linting**: ESLint (auto via `npm run lint`)
- **Imports**: use `@/` alias for all internal imports

Run before committing:
```bash
npm run lint:fix
npm run format
npm run type-check
```

---

## Pull Requests

1. Open against `develop`
2. Fill in the PR template fully
3. Ensure CI passes (lint + type-check + build)
4. Request a review from a maintainer
5. Squash merge only

---

## Environment Variables

Never commit `.env.local` or any real credentials. Use `.env.example` to document new variables.

---

## AI Prompt Guidelines

When modifying prompts in `src/lib/openai/prompts/`:
- Keep outputs emotionally intelligent and Libra-specific
- Avoid vague filler, fear-based predictions, or generic horoscope language
- Test against multiple archetypes before submitting

---

## Questions

Open a [GitHub Discussion](https://github.com/oscargarcia-dev/the-daily-libra/discussions) or email the maintainer.
