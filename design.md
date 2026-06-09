# Unicis Platform — Architecture & Design Document

## Overview

Unicis Platform is an open-core, enterprise-ready **trust management and compliance platform** designed for startups and SMEs. It provides tools for managing compliance frameworks, security controls, privacy assessments, and risk management across multiple compliance standards (GDPR, ISO 27001, NIST, SOC 2, PCI DSS, etc.).

**Current Version:** 0.2.2  
**Build Tool:** Next.js 16  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Authentication:** NextAuth.js  
**License:** Apache 2.0

---

## UX/UI Design System — Direction B

This section documents the **Direction B** design language introduced in the `ux-ui` branch. All new and refactored components must follow these tokens and patterns.

### Design Philosophy

Direction B is a calm, professional visual language built for compliance and security professionals (CISO, DPO, Engineers, DevSecOps, HR, C-level). The principles are:

- **Information density over decoration** — data is primary, chrome is secondary
- **Consistent spatial rhythm** — uniform padding, border radius, and type scale across every module
- **Dark mode as first-class** — every token has an explicit `dark:` counterpart
- **Legibility at small scale** — table headers at `text-[11px]` uppercase; body text at `text-[12px]`–`text-[13px]`

### Core Tokens

#### Card / Panel Container
All module surfaces (tables, charts, stat panels) use the same card shell:

```tsx
className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
```

#### Panel Header (section titles inside a card)
```tsx
className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
// Label inside:
className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide"
```

#### Table Header Cells (`<th>`)
All module table header cells use a unified Direction B style:

```tsx
className="px-1.5 py-1.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
```

For tables with wider padding (e.g. All Tasks):
```tsx
className="px-4 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
```

#### Table Body Rows
```tsx
// tbody divider
className="divide-y divide-slate-100 dark:divide-slate-700"
// hover state
className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
```

#### Tab Bar (pill switcher)
```tsx
// Container
className="flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-[3px]"
// Active tab
className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs"
// Inactive tab
className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent border border-transparent"
```

#### Module Badge (per-module color coding)
Self-contained, no DaisyUI dependency. Used in the All Tasks table and the dashboard Task Overview matrix:

| Module | Background | Text |
|--------|-----------|------|
| RPA | `bg-red-600` | `text-red-100` |
| TIA | `bg-blue-600` | `text-blue-100` |
| PIA | `bg-yellow-500` | `text-yellow-950` |
| RM  | `bg-green-600` | `text-green-100` |
| CSC | `bg-slate-500` | `text-slate-100` |

Base badge class:
```tsx
className="inline-block whitespace-nowrap rounded px-2 py-[2px] text-[11px] font-medium leading-tight align-middle"
```

#### Module Page Heading with Record Count
Every module dashboard includes a heading bar above the toolbar:

```tsx
<div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
  <div className="flex items-center gap-2">
    <h1 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
      {t('module-name')}
    </h1>
    {count > 0 && (
      <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
        {count}
      </span>
    )}
  </div>
  <div className="flex items-center gap-2 flex-wrap">
    {/* toolbar buttons */}
  </div>
</div>
```

Applied to: RPA, TIA, PIA, RM, IAP.

### Shared Components

#### `ModuleEmptyState`
Location: `components/shared/ModuleEmptyState.tsx`

Displayed when a module has no records. Uses Shadcn `Button` (not DaisyUI):

```tsx
<ModuleEmptyState
  icon={ShieldIcon}               // Lucide icon or public image path
  title={t('empty-state.rpa.title')}
  description={t('empty-state.rpa.description')}
  regulatoryContext="GDPR Art. 30"
  ctaLabel={t('create')}
  onCta={() => setIsCreateOpen(true)}
  docsHref="https://www.unicis.tech/docs/..."
/>
```

#### `ModuleBadge`
Location: `components/shared/ModuleBadge.tsx`

Renders a colored badge for a given module property key. No external dependencies:

```tsx
<ModuleBadge propName="rpa_procedure" />  // → red "RPA"
<ModuleBadge propName="csc_controls" />   // → slate "CSC"
```

#### `AuditTimeline`
Location: `components/interfaces/Task/AuditTimeline.tsx`

Reusable audit log timeline used across all modules (RPA, TIA, PIA, CSC, RM). Accepts a generic `AuditLog[]` array.

### Module-by-Module Design Notes

#### All Tasks (`TaskListView`)
- Card wrapper: Direction B standard
- Header typography: `text-[11px] font-medium uppercase tracking-wide`
- Module badges inline with title using `ModuleBadge`
- Hover state on rows

#### RPA / TIA / PIA
- Card wrapper with `rounded-xl`
- `<th>` uniform Direction B typography
- Empty state via `ModuleEmptyState`
- Create button: Shadcn `<Button variant="default">` (no DaisyUI `color="primary"`)

#### Cybersecurity Controls (CSC)
- Card wrapper in `CscPanel` wraps both `StatusesTable` and `SectionRail` as a unified card
- `StatusesTable` occupies `flex-1 min-w-0` within the card
- `SectionRail` is flush to the right edge with `border-l`
- Tab switcher uses Direction B pill pattern (dark mode bug fixed: `dark:hover:text-slate-200`)
- Charts (Pie + Radar) each in Direction B panel cards
- Table header cells: `px-3 py-2` with Direction B typography

#### Risk Management (RM)
- Full table rewrite: 14 columns in two-row grouped header (section labels + column labels)
- Column groups: Task info | Raw Risk | Treatment | Target Risk | Current Risk
- Risk color cells use a static lookup table (not dynamic Tailwind class names which break JIT):
  ```ts
  'risk-extreme-low' | 'risk-low' | 'risk-medium' | 'risk-high' | 'risk-extreme'
  ```
- Asset Owner resolved via `membersById.get(userId)` — Map lookup, not bracket access

#### Interactive Awareness Training (IAP)
- Completion summary banner above course grid shows:
  - Progress bar + percentage
  - Total / Completed / In-Progress stat chips
- Course grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- CourseCard: Direction B card with thumbnail, category chip, title, progress badge

#### Dashboard (`TaskStatusMatrix`)
- Module column uses `<ModuleBadge>` instead of dot + plain text
- Status count cells use semantic color tokens per status
- Row click navigates to the corresponding module page

### Comments Section (Direction B)

Location: `components/interfaces/Task/comments/`

- **Layout**: Single-column, avatar + header in one row, content below
- **Avatar**: `h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700`
- **Header**: `text-[13px] font-semibold text-slate-800 dark:text-slate-100` · `text-[11px] text-slate-400` date
- **Edit/Delete actions**: Hover-only (`opacity-0 group-hover:opacity-100`) inline with header
- **Compose area**: `rounded-lg border focus-within:border-slate-400` with QuillEditor

### Buttons: Shadcn Only

All Create/Add/primary action buttons use Shadcn `<Button variant="default">`. DaisyUI `color="primary"` and `btn btn-primary` classes are removed from:

- `rpa/Dashboard.tsx`
- `pages/teams/[slug]/tia.tsx`
- `pia/Dashboard.tsx`
- `risk-management/Dashboard.tsx`
- `iap/admin/AdminPage.tsx`
- `shared/ModuleEmptyState.tsx`

### Known DaisyUI Remnants

`DaisyBadge` is still used in `tia/TiaTable.tsx` for the transfer permitted/not-permitted badge (`success` / `error` colors). This is a planned migration item.

---

## Technology Stack

### Frontend
- **Next.js 16.2.6** — React framework with SSR/SSG
- **React 18.3.1** — UI library
- **TypeScript 5.4.5** — Type safety
- **Tailwind CSS 4** — Utility-first CSS framework (`darkMode: 'class'`)
- **daisyUI 5** — Legacy component library (being phased out in favour of Shadcn)
- **Shadcn/UI** — Headless component library (primary going forward)
- **Radix UI** — Primitive component library (checkboxes, dialogs, dropdowns, etc.)
- **Formik 2.4.6 & React Hook Form 7.56.4** — Form handling
- **SWR 2.3.6** — Data fetching with caching
- **Lucide React** — Icon library
- **React Markdown & Quill** — Rich text editing

### Backend
- **Next.js API Routes** — Serverless API endpoints
- **Prisma 7.4.2** — Database ORM with PostgreSQL adapter
- **graphile-worker 0.16.6** — Background job queue for async tasks
- **NextAuth.js 4.24.13** — Authentication & authorization
- **SAML Jackson 1.52.2** — SAML SSO & Directory Sync (SCIM)
- **Svix 1.76.1** — Webhook orchestration
- **Retraced** — Audit logging service
- **Resend 6.2.0** — Email delivery service
- **OpenAI SDK 5.23.1** — AI/Chatbot integration
- **web-push 3.6.7** — Web push notifications
- **bcryptjs 2.4.3** — Password hashing

### Internationalization
- **i18next 23.16.8** — Translation management
- **next-i18next 15.3.0** — i18next integration for Next.js
- **Supported Languages:** English, French, Spanish, German

### Data & Export
- **ExcelJS 4.4.0** — Excel file generation
- **XLSX 0.18.5** — Spreadsheet manipulation
- **jsPDF 4.2.0** — PDF generation
- **React PDF Renderer 4.0.0** — PDF generation from React
- **jsdom 23.2.0** — DOM in Node.js

### Testing & Quality
- **Playwright 1.56.1** — E2E testing
- **Jest 29.7.0** — Unit testing
- **ESLint 9.0.0** — Code linting
- **Prettier 3.3.0** — Code formatting
- **TypeScript Compiler** — Type checking

### Security & Monitoring
- **Bearer** — SAST (Static Application Security Testing)
- **google-recaptcha** — Bot protection
- **dotenv** — Environment variable management
- **DOMPurify** — XSS prevention
- **Matomo Analytics** — Privacy-respecting analytics

---

## Directory Structure

```
unicis-platform/
├── pages/                    # Next.js pages & API routes
│   ├── api/                 # REST API endpoints
│   │   ├── auth/            # Authentication endpoints
│   │   ├── teams/           # Team management APIs
│   │   ├── notifications/   # Notification APIs
│   │   ├── invitations/     # Invitation handling
│   │   ├── oauth/           # SAML, OIDC, OAuth flows
│   │   ├── webhooks/        # Webhook handlers (SCIM, svix)
│   │   └── [...]            # Other API routes
│   ├── auth/                # Authentication pages (login, signup, etc.)
│   ├── teams/               # Team workspace pages
│   │   └── [slug]/          # Per-team pages
│   │       ├── dashboard.tsx
│   │       ├── tasks.tsx
│   │       ├── rpa.tsx
│   │       ├── tia.tsx
│   │       ├── pia.tsx
│   │       ├── csc.tsx
│   │       ├── risk-management.tsx
│   │       └── iap/
│   ├── notifications/       # Notification pages
│   ├── settings/            # Settings pages
│   └── [...]                # Other pages
├── components/              # Reusable React components
│   ├── interfaces/          # Module-specific interface components
│   │   ├── Task/            # Task management (list, kanban, comments)
│   │   ├── rpa/             # Record of Processing Activities
│   │   ├── tia/             # Transfer Impact Assessment
│   │   ├── pia/             # Privacy Impact Assessment
│   │   ├── csc/             # Cybersecurity Controls
│   │   ├── risk-management/ # Risk Management
│   │   ├── iap/             # Interactive Awareness Program
│   │   └── TeamDashboard/   # Dashboard widgets
│   ├── account/             # Account-related components
│   ├── auth/                # Auth components (forms, dialogs)
│   ├── team/                # Team workspace components
│   ├── shared/              # Shared/common components
│   │   ├── ModuleBadge.tsx  # Colored module identifier badge
│   │   ├── ModuleEmptyState.tsx  # Empty state with CTA
│   │   ├── StatusBadge.tsx
│   │   ├── MemberName.tsx
│   │   └── [...]
│   ├── notifications/       # Notification UI components
│   └── shadcn/              # Shadcn UI components
├── lib/                     # Utility functions & helpers
│   ├── api-key-auth.ts
│   ├── auth.ts
│   ├── permissions.ts
│   ├── csc/                 # CSC module logic
│   ├── rpa/                 # RPA helpers
│   ├── pia/                 # PIA helpers
│   ├── tia/                 # TIA helpers
│   ├── rm/                  # Risk Management helpers
│   └── [...]
├── hooks/                   # React custom hooks
│   ├── useTeamMembersMap.ts # Map<userId, name> for member lookups
│   ├── useCanAccess.ts
│   ├── usePagination.ts
│   └── [...]
├── prisma/                  # Database schema & migrations
├── workers/                 # Background workers
├── types/                   # TypeScript type definitions
│   ├── rm.ts                # RMProcedureInterface (two-tuple)
│   ├── iap.ts               # TeamCourseWithProgress
│   └── [...]
├── locales/                 # i18n translation files
├── styles/                  # Global CSS (quill-view-mode, etc.)
├── public/                  # Static assets
└── [config files]
```

---

## Data Model

### Core Entities

#### User
- User authentication & profile management
- Email-based identity (unique email)
- Password (optional, for OAuth users)
- First name, last name, profile image
- Account associations (OAuth accounts)
- Sessions for multi-device support

#### Team (Multi-Tenancy)
- Workspace/organization container
- Unique slug for URL routing
- Optional domain for SAML SSO
- Default role for new members
- Task indexing for sequential task numbering
- Custom properties (JSON)

#### Team Member
- User's role within a team (ADMIN, OWNER, MEMBER, AUDITOR)
- Association between User and Team
- Course progress tracking

#### Task & Task Recurrence
- **Task**: Individual to-do items with status, priority, due dates
- **TaskRecurrence**: Scheduled recurring tasks (daily, weekly, monthly, yearly)
- Kanban board support via `kanbanOrder`
- Comments and attachments
- Priority levels: low, medium, high
- Properties (JSON) for module-specific data:
  - `rpa_procedure` — RPA multi-step form data
  - `tia_procedure` — TIA procedure (4-step tuple)
  - `pia_risk` — PIA risk categories
  - `rm_risk` — RM two-step tuple `[RawRisk, Treatment]`
  - `csc_controls` — array of control IDs

#### Module Property Schemas

**RM Risk (`RMProcedureInterface`)**
```ts
type RMProcedureInterface = [
  { Risk: string; AssetOwner: string; Impact: string; RawProbability: number; RawImpact: number },
  { RiskTreatment: string; TreatmentCost: string; TreatmentStatus: number; TreatedProbability: number; TreatedImpact: number }
]
```

**TIA Procedure**
```ts
procedure[0] = TransferScenario (DataExporter, DataImporter, StartDateAssessment, LawImporterCountry, AssessmentYears)
procedure[1] = ProblematicLawfulAccess
procedure[2] = Risk
procedure[3] = Probability/Conclusion (used by isTranferPermitted())
```

#### Notification System
- **Notification**: User messages (in-app, email, web push)
- **NotificationPreference**: Per-user channel preferences
- **PushSubscription**: Web push subscription endpoints

#### Compliance Features
- **Course**: Training/awareness program content
- **TeamCourse**: Many-to-many association with progress tracking
- **CourseProgress**: `{ teamCourseId, teamMemberId, progress: Int (0–100), answers: Json }`
- **Category**: Course categorization

#### API Integration
- **ApiKey**: Bearer token authentication for API access
- Team-scoped keys with optional expiry

#### Payment & Subscription
- **Subscription**: Team plan (COMMUNITY, PREMIUM, ULTIMATE)
- **Payment**: Payment records

---

## Key Features & Modules

### 1. Authentication & Authorization
- Multi-method: Email/Password, Magic link, SAML SSO, Google OAuth, GitHub OAuth, SCIM
- RBAC: ADMIN, OWNER, MEMBER, AUDITOR
- `useCanAccess(slug)` hook for client-side permission checks

### 2. Task Management
- Kanban board + List view (Direction B table)
- Priority, status, due date, recurrence
- Comments (Direction B redesign: avatar + hover-reveal edit/delete)
- File attachments
- Webhooks via Svix
- Module badges inline in the list view

### 3. Dashboard
- KPI row (total tasks, overdue, completion rate, compliance score with sparkline)
- Task Overview by Module matrix (clickable rows → module pages, colored `ModuleBadge`)
- Needs Attention panel
- Compliance charts (CSC, PIA, RM)
- Global search across tasks and module fields

### 4. Privacy & Compliance Modules

#### RPA (Record of Processing Activities)
- GDPR Art. 30 documentation
- Multi-step creation form
- Export: XLSX, ODS, CSV, HTML, PDF

#### TIA (Transfer Impact Assessment)
- Cross-border data transfer analysis
- **Legal Analysis column**: shows `LawImporterCountry` from `procedure[0]`
- Transfer permitted/not-permitted badge via `isTranferPermitted()`

#### PIA (Privacy Impact Assessment)
- Three risk axes: confidentiality & integrity, availability, transparency & data minimisation
- Risk matrix filter

#### CSC (Cybersecurity Controls)
- Multi-framework support (ISO 27001:2013/2022, NIST CSF 2.0, CIS, NIS2, GDPR, SOC 2, PCI DSS, OWASP ASVS v5, C5:2020, ISO 42001)
- Framework mapping matrix
- Statement of Applicability (SoA) export
- Section rail for per-section compliance navigation
- Bulk control selection + status assignment

#### Risk Management (RM)
- 14-column table with grouped section headers (Raw Risk / Treatment / Target Risk / Current Risk)
- Risk rating calculated from `RawProbability × RawImpact`
- Current risk derived from raw vs. treatment outcome
- Asset Owner resolved via `useTeamMembersMap` → `membersById.get(userId)`

#### IAP (Interactive Awareness Program)
- Course catalogue with thumbnail, category, estimated time
- Progress tracking per team member (`CourseProgress.progress` 0–100)
- Completion summary banner (total / completed / in-progress / %)
- Admin: create categories and courses

### 5. REST API
- OpenAPI 3.0 — Swagger UI at `/api-docs`
- Bearer token authentication via API keys
- Endpoints: Tasks, CSC, RM, PIA, RPA, TIA, API Keys, AI Chatbot

### 6. Audit Logging
- Per-module `AuditTimeline` component
- Integrated with Retraced

### 7. Notifications
- In-app bell, email, web push
- Per-user preferences
- Types: task due, created, updated, deleted, commented, file uploaded, comment reacted

---

## Authentication Flow

1. **Credential Providers:** Email/Password, Magic Link, OAuth (Google, GitHub), SAML SSO
2. **Session Management:** JWT, HTTP-only cookies
3. **Authorization:** `lib/permissions.ts`, `useCanAccess` hook

---

## API Architecture

```
/api/auth/*              - Authentication
/api/teams/*             - Team management
/api/teams/[slug]/*      - Team-specific resources
/api/notifications/*     - Notifications
/api/invitations/*       - Invitations
/api/oauth/*             - SAML/OIDC
/api/webhooks/*          - Webhook receivers
/api/chatbot             - AI chatbot
/api/users               - User management
/api/health              - Health check
/api-docs                - Swagger UI
```

---

## Background Jobs

- **Graphile-worker** for: `send-notification`, `send-email`, `send-push-notification`, `process-recurrence`
- Run: `npm run worker`

---

## Security Considerations

- **XSS:** DOMPurify, sanitized Quill output
- **CSRF:** NextAuth CSRF tokens
- **Password:** bcryptjs hashing
- **API Keys:** Hashed storage, team-scoped
- **Rate limiting:** `lib/rate-limit.ts`
- **Headers:** `X-Frame-Options: DENY`, `HSTS`, `X-Content-Type-Options: nosniff`
- **SAST:** Bearer CI/CD scan
- **SBOM:** Generated and published

---

## Deployment & Infrastructure

### Configuration (`.env`)
- `DATABASE_URL` — PostgreSQL
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `RESEND_API_KEY` — Email
- Google/GitHub OAuth credentials
- `OPENAI_API_KEY` — AI chatbot
- SAML Jackson config

### Docker
```bash
docker-compose up -d        # Postgres + Redis
npx prisma db push
npm run dev                 # port 4002
npm run worker
```

### Build
```bash
npm run build               # Prisma client → migrations → OpenAPI → Next.js
```

---

## Testing

- **E2E:** Playwright — `npm run test:e2e` (Chromium, Firefox)
- **Unit:** Jest — `npm run test`
- **Type check:** `npm run check-types`
- **Lint:** `npm run check-lint`
- **All:** `npm run test-all`

---

## Performance

- SWR caching for all data fetching
- Pagination on all module tables (`usePagination` hook)
- DB indexes on `duedate`, `teamId/status/kanbanOrder`, `recipientId/isRead`
- Dynamic imports for large chart components
- Next.js Image for thumbnail optimisation

---

## Error Handling

- Server: `lib/errors.ts` + consistent JSON response envelope
- Client: `react-hot-toast` for feedback, SWR retry
- Loading / Error shared components throughout module pages

---

## Future Roadmap

### Coming Features
- Right to Erasure Request Form
- Processor Questionnaire Checklist
- Asset Inventory Management
- Vendor Assessment Checklist
- Benchmark Report / Trust Center
- Incident Management
- Document Management / Policy Lifecycle
- Custom Framework Support (JSON/YAML DSL)
- Jira Integration (bidirectional)
- MCP Server Exposure
- AI Questionnaire Automation
- Continuous Control Monitoring
- Executive Dashboards & Reporting

### Compliance Frameworks (Coming)
- EU Cyber Resilience Act (CRA)
- EU Digital Operational Resilience Act (DORA)
- Cloud Controls Matrix (CCM) v4
- TISAX
- EU AI Act
- HIPAA
- Custom frameworks

### UX/UI (Coming)
- Migrate remaining DaisyUI components to Shadcn (`DaisyBadge` in TIA table)
- Deep-link from Needs Attention panel directly to specific task
- Per-module URL filter persistence for CSC section / status filters

---

## Community & Support

- **GitHub:** [UnicisTech/unicis-platform-ce](https://github.com/UnicisTech/unicis-platform-ce)
- **Documentation:** https://www.unicis.tech/docs/platform
- **Discord:** https://discord.com/invite/8TwyeD97HD
- **LinkedIn:** https://www.linkedin.com/company/unicis-tech-oü/

---

## License

Apache License 2.0 — See LICENSE file for details.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on bug reporting, feature requests, code contributions, and pull request process.

---

## Glossary

| Term | Meaning |
|------|---------|
| RPA  | Record of Processing Activities (GDPR Art. 30) |
| TIA  | Transfer Impact Assessment (cross-border data transfers) |
| PIA  | Privacy Impact Assessment |
| CSC  | Cybersecurity Controls (multi-framework control mapping) |
| IAP  | Interactive Awareness Program (training courses) |
| RM   | Risk Management |
| SoA  | Statement of Applicability |
| SAML | Security Assertion Markup Language (SSO) |
| SCIM | System for Cross-domain Identity Management |
| JWT  | JSON Web Token |
| SAST | Static Application Security Testing |
| SBOM | Software Bill of Materials |
| RBAC | Role-Based Access Control |
| DPO  | Data Protection Officer |
| CISO | Chief Information Security Officer |
