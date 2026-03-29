## Purpose

This file provides concise, actionable guidance for AI coding agents to be immediately productive in the Unicis Platform repository.

## Big Picture

- **App type:** Next.js (see `next.config.js`) — server-rendered React app with pages/ routes.
- **Backend/DB:** Prisma + PostgreSQL (see `prisma/schema.prisma` and `lib/prisma.ts`). Prisma models are in `/models` and database sync is performed via `prisma db push` in the build flow.
- **Core folders:**
  - `pages/` — Next.js pages and API routes (server handlers live under `pages/api/`).
  - `lib/` — server/shared helpers (auth, sessions, services, fetchers, metrics).
  - `components/` & `components/shadcn/` — UI primitives and shared components.
  - `hooks/` — React hooks; naming pattern `useXxx` (e.g., `useTeam.ts`).
  - `models/` — TypeScript representations of Prisma models.

## Key Integration Points

- Authentication: `next-auth` + `@next-auth/prisma-adapter` (see `lib/session.ts` and `pages/api/auth`).
- Email: Resend integration (`RESEND_API_KEY`), templates in `lib/email` and `components/email`.
- Webhooks: `svix` integration (config in `.env` variables like `SVIX_API_KEY`) and `lib/svix.ts`.
- Telemetry/Logging: `@boxyhq/metrics`, `retraced` integration (`lib/retraced.ts`).
- AI/chatbot hooks: AI settings are driven by env vars `AI_URL`, `LLAMA_TOKEN`, `AI_MODEL` (see `.env` lines and `lib/chatbot.ts`).

## Project-specific workflows (use exact scripts)

- Local development: `npm run dev` — starts Next.js on port 4002.
- Build (includes DB/codegen): `npm run build` — runs `prisma generate`, `prisma db push --accept-data-loss`, then `next build`.
- Production start: `npm run start` (Next.js start on port 4002).
- Typecheck: `npm run check-types` (tsc).
- Lint / Format checks: `npm run check-lint`, `npm run check-format` and `npm run format`.
- CI full check: `npm run test-all` — format, lint, types, then build.
- Unit tests: `npm run test` (Jest). E2E: `npm run test:e2e` (Playwright) — run `npm run playwright:update` first to install deps.

## Conventions & Patterns to follow

- Hooks: placed in `hooks/`, prefixed with `use`. Prefer these for data fetching and local UI state.
- Services / server logic: put shared server functions in `lib/` (e.g., `lib/fetcher.ts`, `lib/subscriptions.ts`). Keep UI-only logic in `components/` or `hooks/`.
- Models vs Prisma: `models/` contains application model typings; `prisma/schema.prisma` is the source-of-truth for DB.
- Feature flags and behavior toggles are driven by `.env` flags (e.g., `FEATURE_TEAM_SSO`, `HIDE_LANDING_PAGE`). Modify `.env` for local experiments.
- Migration scripts: ad-hoc TypeScript migration scripts live in `scripts/migrations/` and are invoked with `npm run migrate:teams` / `migrate:tasks` (these use `tsx`).

## Files to inspect for context or examples

- Authentication: [lib/session.ts](lib/session.ts)
- Prisma usage and DB helpers: [lib/prisma.ts](lib/prisma.ts) and [prisma/schema.prisma](prisma/schema.prisma)
- API route examples: [pages/api](pages/api)
- UI patterns: [components/](components) and [components/shadcn/](components/shadcn/)
- Background/aux: [lib/tasks.ts](lib/tasks.ts), [lib/teams.ts](lib/teams.ts)

## What an AI agent should not change automatically

- Do not run or modify DB migrations (`prisma db push` / migration files) without explicit human approval.
- Avoid changing `.env` production keys; limit edits to example/test values.

## Quick guidance for code changes

- Follow existing file structure: add hooks in `hooks/`, server helpers in `lib/`, UI in `components/`.
- Add unit tests near the feature using Jest; e2e tests belong under `tests/e2e/` using Playwright.
- When adding new Prisma models: update `prisma/schema.prisma`, run `prisma generate`, and add corresponding `models/` typing files.

## Feedback
If anything here is unclear or you want more detail (examples of specific modules or flows), request a follow-up and I'll expand the file.
