# Notification → Workflow Implementation Plan for Unicis Platform

Status: Notifications prioritized first. This document provides a step-by-step implementation plan (no code changes applied here), Prisma model drafts, API & UI stubs, commands, testing plan, effort estimates, risks, and a rollout checklist. Use this to plan sprints and PRs.

---

## 1 — Goals & Scope

- Priority 1: Deliver a robust in‑app Notification system (MVP) that supports core channels later (email, push).
- Priority 2: Add Workflow automation (recurring tasks, escalation) as a follow-up feature built on the same foundations.
- Constraints: do not modify production `.env` values; prefer incremental changes and feature flags.

---

## 2 — High-level approach

- Implement notifications in phases: MVP (in-app) → email → push → queue/worker → workflows.
- Keep the service interface simple: a single `notificationService.send(payload)` that resolves preferences and persists records.
- Start with in-process logic; introduce a queue (BullMQ + Redis) or Inngest when reliability/retries are required.

---

## 3 — Deliverables (for Notifications MVP)

1. Prisma models: `Notification`, `NotificationPreference` and migration script.
2. Backend service: `lib/notifications/notification-service.ts` (API for other code to call).
3. API routes: `GET /api/notifications`, `PATCH /api/notifications/[id]/read`, `POST /api/notifications/mark-all-read`.
4. Frontend: `hooks/useNotifications.ts`, `components/notifications/NotificationBell.tsx`, `components/notifications/NotificationCenter.tsx`.
5. Unit & integration tests: Jest unit tests for service, API integration tests against test DB, Playwright E2E smoke test.
6. Migration instructions and `docker-compose` guidance for optional worker.

---

## 4 — Prisma models (draft)

Add to `prisma/schema.prisma` (example):

```prisma
model Notification {
  id          String   @id @default(cuid())
  type        String
  title       String
  body        String   @db.Text
  link        String?
  isRead      Boolean  @default(false)
  recipientId String
  teamId      String?
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([recipientId, isRead])
  @@index([recipientId, createdAt])
}

model NotificationPreference {
  id          String   @id @default(cuid())
  userId      String   @unique
  preferences Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Migration command (local/dev):

```bash
npx prisma migrate dev --name add_notifications
```

Notes:
- Keep `type` as a string enum later (PR to convert to Prisma enum when stable).
- `preferences` JSON shape example:

```json
{
  "COMMENT_CREATED": { "inApp": true, "email": false, "push": false }
}
```

---

## 5 — Backend design (service & API)

Service responsibilities (`lib/notifications/notification-service.ts`):

- Validate payload and recipient access.
- Resolve user preferences (merge `NotificationPreference` with defaults).
- Persist in-app notification (`Notification` table) when `inApp:true`.
- Enqueue or call channel senders (email, push) depending on preferences.
- Return success/failure and record delivery metadata.

API route stubs (under `pages/api/notifications/`):

- `GET /api/notifications` — paginated, optionally `unreadOnly=true`.
- `PATCH /api/notifications/[id]/read` — mark single notification read.
- `POST /api/notifications/mark-all-read` — mark all as read for the user.

Example handler responsibilities:

- Authenticate with existing `getServerSession` / `authOptions`.
- Validate `session.user.id` === target recipient.
- Use Prisma from `lib/prisma.ts` to query and mutate.

Notes for implementer:
- Keep logic minimal; complex delivery and retry logic belongs to worker/queue.

---

## 6 — Frontend design (components & hooks)

Files to add (UI-first approach):

- `hooks/useNotifications.ts` — SWR-based data fetcher with `refreshInterval` (30s) and helper funcs `markAsRead`, `markAllRead`.
- `components/notifications/NotificationBell.tsx` — small bell icon with unread badge; toggles `NotificationCenter`.
- `components/notifications/NotificationCenter.tsx` — panel listing notifications with quick actions.

Behavior & integration:

- Insert `NotificationBell` into the main layout (e.g., navbar) to ensure visible in all pages.
- For performance, fetch only 20 items per page and lazy-load more.

Accessibility:
- Ensure notifications are keyboard-navigable and that `aria` attributes are present for the bell and list.

UI components (daisyUI)

- The repo already depends on Tailwind/daisyUI in `package.json` (see `daisyui` in devDependencies). Use lightweight daisyUI primitives to speed the UI implementation and keep consistent styling.
- Suggested component mapping:
  - Bell button: use a rounded icon button with badge

```tsx
<button className="btn btn-ghost btn-circle relative" aria-label="Notifications">
  <Bell className="w-5 h-5" />
  <span className="badge badge-sm badge-primary absolute -top-1 -right-1">3</span>
</button>
```

  - Notification item: `card` or `list` style with title, snippet, timestamp, and quick action buttons

```tsx
<div className="card bg-base-100 shadow-sm">
  <div className="card-body p-3">
    <h4 className="text-sm font-medium">Task assigned</h4>
    <p className="text-xs text-muted">You were assigned to the task "Quarterly audit"</p>
    <div className="card-actions justify-end">
      <button className="btn btn-primary btn-xs">Open</button>
      <button className="btn btn-ghost btn-xs">Mark read</button>
    </div>
  </div>
</div>
```

- Panel layout: use `dropdown` or `drawer` for the `NotificationCenter` anchored to the bell.

Localization & i18n

- This repository already includes `next-i18next` (see `next-i18next.config.js`). Use the existing i18n setup and the `locales/` directory to add notification strings.
- Recommended keys (in `locales/en/notifications.json` and other locales):

```json
{
  "notification": {
    "title_task_assigned": "You have been assigned to \"{{task}}\"",
    "badge_unread": "{{count}}",
    "empty": "No notifications"
  }
}
```

- Usage in components (with `next-i18next` hook):

```tsx
import { useTranslation } from 'next-i18next';
const { t } = useTranslation('notifications');
<h4>{t('title_task_assigned', { task: task.title })}</h4>
```

- For formatting dates/times, use `date-fns` + localized format strings or `Intl.DateTimeFormat` with the user's locale.
- Add translations for all UI strings used in `NotificationBell`, `NotificationCenter`, and email templates (later phase).


---

## 7 — Tests

- Unit tests (Jest):
  - `notification-service` preference resolution and persistence logic.
  - `email-service` builder (if added) using mocked Resend client.
- API integration tests:
  - Authenticate a test user and verify `GET`, `PATCH`, `mark-all-read` behaviors against a test DB.
- E2E (Playwright):
  - Scenario: create comment or create notification via service → user sees notification in UI.

Test data approach:
- Use an ephemeral test DB for Jest integration tests (set `DATABASE_URL` to SQLite or a test Postgres instance).

---

## 8 — Dev / Ops / Env

ENV vars to document/require:

- None required for MVP in-app notifications.
- For email (Phase 2): `RESEND_API_KEY`, `RESEND_FROM` (already present in `.env`).
- For push (Phase 3): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

Docker & worker notes:

- MVP: no extra services required.
- When adding a worker/queue: add Redis service and `worker` service to `docker-compose.yml`.

---

## 9 — Timeline & effort estimates (single experienced full-stack dev)

MVP (in-app only): 8–12 dev-days (~2–3 weeks)

- Design & spec: 0.5 day
- Prisma model + migration: 0.5 day
- Backend service + API routes: 2–3 days
- Frontend components/hooks: 1.5–2 days
- Unit & integration tests: 1.5–2 days
- E2E smoke + QA + ops notes: 1 day

Phase 2 (email integration): +3–5 dev-days

Phase 3 (push notifications + SW): +2–3 dev-days

Phase 4 (queue/worker + reliability): +3–6 dev-days

Phase 5 (workflows/Inngest + recurring tasks/AI): +10–20 dev-days

Note: these are ballpark estimates and depend on test coverage, review cycles, infra availability, and team experience.

---

## 10 — Risks & mitigations

- Data leakage: ensure notification queries always filter by `recipientId` and `teamId` where applicable.
  - Mitigation: add unit tests and API integration tests for access control.
- Large inboxes: many unread notifications could slow UI or queries.
  - Mitigation: paginate, add indexes (`recipientId, createdAt`), archive old records.
- Push expiry & errors: Web Push endpoints may return 410; must remove dead subscriptions.
  - Mitigation: handle 410 errors and delete expired subscriptions from DB.
- Email deliverability: depends on `Resend` and proper domain/DKIM settings.
  - Mitigation: use Resend test keys locally; coordinate DNS for production.
- AI & file extraction: heavy resource needs and slow processing.
  - Mitigation: run AI tasks in background worker and add retries/timeouts.

---

## 11 — Rollout & PR checklist (per change)

- Create a branch: `feature/notifications/mvp`.
- PR should include:
  - Prisma schema changes and a migration file (if applicable).
  - `lib/notifications/notification-service.ts` (with unit tests).
  - API route files under `pages/api/notifications/*` with tests.
  - Frontend components and `useNotifications` hook with basic styling.
  - Changelog entry and an ops note about migration commands.
  - E2E smoke test in `tests/e2e/` (Playwright) demonstrating core flow.
- Reviewers: backend + frontend + QA.

---

## 12 — Next steps for Workflow (high level)

After Notifications MVP is stable, implement workflows in phases:

1. Add `TaskRecurrence`, `Evidence`, `EvidenceChecklistItem` Prisma models (see attachments for full drafts).
2. Integrate an event/workflow system: start with Inngest client in `lib/workflow/inngest-client.ts` and an API route `pages/api/inngest.ts`.
3. Implement recurring-task and escalation functions as Inngest functions.
4. Offload heavy tasks (AI summarization, file extraction) to worker process.

Estimated effort for core workflow automation (without AI): 5–10 dev-days. Adding AI summarization and ReactFlow visualization: +10–20 dev-days.

---

## 13 — Suggested simpler alternatives

- Skip Inngest initially: implement simple cron-based worker for recurring tasks (node-cron) and use in-process job scheduling for small scale.
- For retries and reliability: use BullMQ + Redis (smaller footprint than full Inngest integration) if you only need queue semantics.
- For AI summarization: defer until notifications + workflows are stable, then prototype with a hosted LLM (OpenAI) before investing in self-hosted LLM infra.

---

If you want, I can now:

- produce a smaller one-page sprint plan for the MVP (ticket-level tasks), or
- generate the Prisma migration diff and the TS/TSX stub files as separate draft files (no runtime changes) to help with sprint planning.

Please tell me which of the two you'd like next.
