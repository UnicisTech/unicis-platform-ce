# Unicis Platform - Architecture & Design Document

## Overview

Unicis Platform is an open-core, enterprise-ready **trust management and compliance platform** designed for startups and SMEs. It provides tools for managing compliance frameworks, security controls, privacy assessments, and risk management across multiple compliance standards (GDPR, ISO 27001, NIST, SOC 2, PCI DSS, etc.).

**Current Version:** 0.2.2  
**Build Tool:** Next.js 16  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Authentication:** NextAuth.js  
**License:** Apache 2.0

---

## Technology Stack

### Frontend
- **Next.js 16.2.6** - React framework with SSR/SSG
- **React 18.3.1** - UI library
- **TypeScript 5.4.5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **daisyUI 5** - Component library built on Tailwind
- **Shadcn/UI** - Headless component library
- **Radix UI** - Primitive component library (checkboxes, dialogs, dropdowns, etc.)
- **Formik 2.4.6 & React Hook Form 7.56.4** - Form handling
- **SWR 2.3.6** - Data fetching with caching
- **Lucide React** - Icon library
- **React Markdown & Quill** - Rich text editing

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 7.4.2** - Database ORM with PostgreSQL adapter
- **graphile-worker 0.16.6** - Background job queue for async tasks
- **NextAuth.js 4.24.13** - Authentication & authorization
- **SAML Jackson 1.52.2** - SAML SSO & Directory Sync (SCIM)
- **Svix 1.76.1** - Webhook orchestration
- **Retraced** - Audit logging service
- **Resend 6.2.0** - Email delivery service
- **OpenAI SDK 5.23.1** - AI/Chatbot integration
- **web-push 3.6.7** - Web push notifications
- **bcryptjs 2.4.3** - Password hashing

### Internationalization
- **i18next 23.16.8** - Translation management
- **next-i18next 15.3.0** - i18next integration for Next.js
- **Supported Languages:** English, French, Spanish, German

### Data & Export
- **ExcelJS 4.4.0** - Excel file generation
- **XLSX 0.18.5** - Spreadsheet manipulation
- **jsPDF 4.2.0** - PDF generation
- **React PDF Renderer 4.0.0** - PDF generation from React
- **jsdom 23.2.0** - DOM in Node.js

### Testing & Quality
- **Playwright 1.56.1** - E2E testing
- **Jest 29.7.0** - Unit testing
- **ESLint 9.0.0** - Code linting
- **Prettier 3.3.0** - Code formatting
- **TypeScript Compiler** - Type checking

### Security & Monitoring
- **Bearer** - SAST (Static Application Security Testing)
- **google-recaptcha** - Bot protection
- **dotenv** - Environment variable management
- **DOMPurify** - XSS prevention
- **Matomo Analytics** - Privacy-respecting analytics

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
│   ├── notifications/       # Notification pages
│   ├── settings/            # Settings pages
│   └── [...]                # Other pages
├── components/              # Reusable React components
│   ├── account/             # Account-related components
│   ├── auth/                # Auth components (forms, dialogs)
│   ├── team/                # Team workspace components
│   ├── shared/              # Shared/common components
│   ├── notifications/       # Notification UI components
│   ├── shadcn/              # Shadcn UI components
│   └── [...]                # Feature-specific components
├── lib/                     # Utility functions & helpers
│   ├── api-key-auth.ts      # API key authentication
│   ├── auth.ts              # Authentication utilities
│   ├── permissions.ts       # Authorization/permissions
│   ├── csc.ts               # CSC (Cybersecurity Controls) logic
│   ├── rpa.ts               # RPA (Record of Processing Activities)
│   ├── pia.ts               # PIA (Privacy Impact Assessment)
│   ├── tia.ts               # TIA (Transfer Impact Assessment)
│   ├── task.ts              # Task management utilities
│   ├── team.ts              # Team utilities
│   ├── notifications/       # Notification service
│   ├── email/               # Email template rendering
│   ├── csc/                 # CSC module logic
│   ├── modules/             # Module-specific logic
│   ├── pia/                 # PIA module logic
│   └── [...]                # Other utilities
├── models/                  # Data models (types/interfaces)
│   ├── apiKey.ts
│   ├── task.ts
│   ├── team.ts
│   ├── user.ts
│   └── [...]
├── hooks/                   # React custom hooks
│   ├── useNotifications.ts  # Notification hook
│   ├── useCanAccess.ts      # Permission checking
│   ├── usePermissions.ts    # Permissions hook
│   ├── useIAP.ts            # Interactive Awareness Program
│   └── [...]
├── prisma/                  # Database schema & migrations
│   ├── schema.prisma        # Prisma schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Database seed script
├── workers/                 # Background workers
│   └── worker.ts            # Graphile-worker job processor
├── types/                   # TypeScript type definitions
├── locales/                 # i18n translation files
├── styles/                  # Global CSS & Tailwind config
├── public/                  # Static assets
├── scripts/                 # Build & utility scripts
├── tests/                   # E2E tests (Playwright)
├── __tests__/               # Unit tests
├── openapi/                 # OpenAPI/Swagger documentation
├── docs/                    # Project documentation
└── [config files]           # tsconfig, next.config, etc.
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
- Properties (JSON) for extensibility

#### Notification System
- **Notification**: User messages (in-app, email, web push)
- **NotificationPreference**: Per-user channel preferences
- **PushSubscription**: Web push subscription endpoints
- Notification types: TASK_DUE, TASK_CREATED, TASK_UPDATED, TASK_COMMENTED, TASK_DELETED, FILE_UPLOADED, COMMENT_REACTED

#### Authentication & Authorization
- **Account**: OAuth provider integrations
- **Session**: Active user sessions
- **VerificationToken**: Email verification tokens
- **PasswordReset**: Password recovery tokens
- **Invitation**: Team member invitations with expiry
- **Role Enum**: ADMIN, OWNER, MEMBER, AUDITOR

#### Compliance Features
- **Course**: Training/awareness program content
- **TeamCourse**: Many-to-many association with progress tracking
- **CourseProgress**: User progress within courses
- **Category**: Course categorization

#### API Integration
- **ApiKey**: Bearer token authentication for API access
- Team-scoped keys with optional expiry
- Last-used tracking for security auditing

#### Payment & Subscription
- **Subscription**: Team plan (COMMUNITY, PREMIUM, ULTIMATE)
- **Payment**: Payment records with status tracking
- SubscriptionStatus: ACTIVE, PENDING, DECLINED
- PaymentStatus: SUCCESS, FAILED

---

## Key Features & Modules

### 1. Authentication & Authorization
**Files:** `lib/auth.ts`, `pages/api/auth/`, `lib/permissions.ts`

- **Multi-method authentication:**
  - Email/Password with bcrypt hashing
  - Magic links (passwordless)
  - SAML SSO (via SAML Jackson)
  - Google OAuth
  - GitHub OAuth
  - Directory Sync (SCIM)

- **Authorization & Permissions:**
  - Role-based access control (RBAC): ADMIN, OWNER, MEMBER, AUDITOR
  - Resource-level permissions
  - NextAuth.js session management

### 2. Multi-Tenancy
**Files:** `lib/team.ts`, `models/team.ts`, middleware.ts

- Team-isolated workspaces
- Team member management with role assignment
- Invitation system with token expiry
- Domain-based SAML configuration per team

### 3. Task Management
**Files:** `lib/task.ts`, `models/task.ts`, Prisma Task model

- Create, read, update, delete tasks
- Kanban board UI with drag-and-drop
- Task priority (low, medium, high)
- Task status tracking
- Due date management with timezone support
- Task recurrence (daily, weekly, monthly, yearly)
- Comments on tasks with emoji reactions
- File attachments
- Task webhooks (via Svix)

### 4. Notification System
**Files:** `lib/notifications/`, `workers/worker.ts`, hooks/useNotifications.ts

- **Multi-channel delivery:**
  - In-app bell notifications
  - Email notifications
  - Web push notifications

- **Notification Types:**
  - Task due date reminders
  - Task lifecycle events (created, updated, deleted, commented)
  - File upload notifications
  - Comment reactions

- **Implementation:**
  - Graphile-worker for background job queue
  - Scheduled notifications via cron-like patterns
  - Per-user notification preferences
  - Deduplication via `dedupeKey`

### 5. Compliance Frameworks
Unicis supports mapping to multiple compliance frameworks:
- GDPR (General Data Protection Regulation)
- ISO 27001:2013 & 2022
- NIST Cybersecurity Framework 2.0
- NIS 2 (EU Directive 2022/2555)
- CIS Controls v8.1
- C5:2020
- SOC 2 Type II
- OWASP ASVS v5
- PCI DSS v4.0.1
- ISO/IEC 42001:2023 (AI Management)

### 6. Privacy & Compliance Modules

#### RPA (Record of Processing Activities)
**Files:** `lib/rpa.ts`, `models/rpa.ts`
- Document processing activities per GDPR
- Export to various formats (HTML, PDF, Excel)

#### TIA (Transfer Impact Assessment)
**Files:** `lib/tia.ts`, `models/tia.ts`
- Data transfer impact analysis
- Cross-border data flow documentation

#### PIA (Privacy Impact Assessment)
**Files:** `lib/pia.ts`, `models/pia.ts`
- Privacy risk assessment
- Control mapping

#### CSC (Cybersecurity Controls)
**Files:** `lib/csc.ts`, `lib/csc/`, `models/csc.ts`
- Control implementation tracking
- Statement of Applicability (SoA) export
- Framework mapping matrix
- Multi-format export (HTML, PDF, Excel)

### 7. Compliance & Risk Management
**Files:** `pages/api/teams/[slug]/`, `/components/team/`

- Risk assessment and management
- Control effectiveness tracking
- Evidence documentation
- Compliance dashboard

### 8. REST API & Documentation
**Files:** `openapi/`, `pages/api-docs.tsx`, `scripts/generate-openapi.ts`

- OpenAPI 3.0 specification
- Swagger UI at `/api-docs`
- Auto-generated from code (via swagger-jsdoc-like approach)
- Bearer token authentication (API keys)
- RESTful endpoints for all major resources

### 9. Audit Logging
**Files:** `lib/retraced.ts`

- Integrated with Retraced service
- Audit trail for compliance
- User action logging
- Team activity tracking

### 10. Webhook Integration
**Files:** `lib/svix.ts`, `pages/api/webhooks/`

- Webhook event delivery via Svix
- Event types: task.created, task.updated, task.deleted, task.commented, task.due_date, file.uploaded
- SCIM directory sync webhooks

### 11. Interactive Awareness Program (IAP)
**Files:** `lib/iap.ts`, `hooks/useIAP.ts`, `components/team/`

- Interactive training/awareness courses
- Course categorization
- Progress tracking per team member
- Multiple content types: embedded video, PDF, open text

### 12. Email System
**Files:** `lib/email/`, `components/emailTemplates/`

- Email templates (welcome, password reset, task notifications, etc.)
- Resend integration for delivery
- React email components for template rendering

### 13. Internationalization (i18n)
**Files:** `locales/`, `next-i18next.config.js`

- Multi-language support: EN, FR, ES, DE
- Client-side and server-side translation
- Easy extensibility for new languages

---

## Authentication Flow

### NextAuth.js Integration
**Files:** `pages/api/auth/[...nextauth].ts`

1. **Credential Providers:**
   - Email/Password (with Prisma adapter)
   - Magic Link (email token)
   - OAuth (Google, GitHub)
   - SAML SSO (via Jackson)

2. **Session Management:**
   - JWT-based sessions
   - Secure HTTP-only cookies
   - Session expiry handling
   - Multi-device support

3. **Authorization:**
   - Permission middleware via `lib/permissions.ts`
   - Role checking in API routes
   - Client-side access validation via `useCanAccess` hook

---

## API Architecture

### Route Structure
```
/api/auth/*              - Authentication endpoints
/api/teams/*             - Team management
/api/teams/[slug]/*      - Team-specific resources
/api/notifications/*     - Notification management
/api/invitations/*       - Invitation handling
/api/oauth/*             - SAML/OIDC flows
/api/webhooks/*          - Webhook receivers
/api/chatbot             - AI chatbot endpoint
/api/users               - User management
/api/password            - Password reset
/api/health              - Health check
/api-docs                - Swagger UI
```

### Authentication Methods
- **Session-based:** NextAuth JWT cookies
- **API Keys:** Bearer token with hashed key comparison
- **OAuth:** provider-specific tokens

### Rate Limiting
**Files:** `lib/rate-limit.ts`
- Protection against abuse
- Configurable limits per endpoint

---

## Background Jobs & Workers

### Graphile-Worker Integration
**Files:** `workers/worker.ts`

**Job Types:**
- `send-notification` - Email delivery
- `send-email` - Transactional emails
- `send-push-notification` - Web push delivery
- `process-recurrence` - Task recurrence generation
- Custom jobs for scheduled tasks

**Features:**
- Scheduled job execution
- Retry logic
- Job queuing
- Concurrency control

**Running:** `npm run worker`

---

## Frontend Architecture

### Component Organization

#### Page Components (`pages/`)
- Next.js page components (route handlers)
- Server-side rendering / static generation
- Dynamic routing for team slugs, task IDs, etc.

#### Feature Components (`components/`)
Organized by feature:
- `account/` - User account pages
- `auth/` - Authentication flows
- `team/` - Team workspace
- `shared/` - Reusable components (Modal, Button, Input, etc.)
- `shadcn/` - Shadcn/UI component library

#### Layouts (`components/layouts/`)
- AppLayout - Main authenticated layout
- AuthLayout - Authentication page layout
- Sidebar navigation
- Header with user menu

### State Management
- **SWR (stale-while-revalidate)** for data fetching
- React hooks for local state
- NextAuth.js session context

### Custom Hooks
- `useNotifications.ts` - Notification state & actions
- `useCanAccess.ts` - Permission checking
- `usePermissions.ts` - User roles
- `useIAP.ts` - IAP course data
- `usePagination.ts` - Pagination helpers
- `useSubscription.ts` - Subscription state

---

## Security Considerations

### Input Validation
- **Server-side:** Form validation via Formik/React Hook Form + Yup/Zod
- **XSS Prevention:** DOMPurify for rich text sanitization
- **CSRF:** NextAuth handles CSRF tokens

### Password Security
- **Hashing:** bcryptjs with salting
- **Reset Flow:** Token-based, time-limited
- **Strength:** Enforced via validation rules

### Data Protection
- **Encryption:** Sensitive data (API keys) hashed
- **HTTPS:** Strict-Transport-Security header
- **Secure Cookies:** HTTP-only, secure, SameSite flags

### API Security
- **Bearer Token Auth:** Hashed API key storage
- **Rate Limiting:** Per-endpoint abuse prevention
- **CORS:** Configured for trusted origins
- **reCAPTCHA:** Bot protection on signup/login

### Headers Security
```
X-Frame-Options: DENY                           - Clickjacking prevention
Strict-Transport-Security: max-age=63072000     - HSTS enforcement
X-Content-Type-Options: nosniff                 - MIME sniffing prevention
```

### Compliance
- **Audit Logging:** Via Retraced
- **Data Privacy:** Right-to-erasure features (coming soon)
- **GDPR:** Consent management, data export

---

## Deployment & Infrastructure

### Configuration
- **Environment Variables:** `.env` file (see `.env.example`)
- **Database:** PostgreSQL connection string
- **Email:** Resend API key
- **OAuth:** Google, GitHub OAuth credentials
- **SAML:** Jackson configuration
- **AI:** OpenAI API key for chatbot

### Docker Support
- **Dockerfile** - Production image
- **Dockerfile.local** - Local development
- **docker-compose.yml** - Local Postgres + Redis (optional)

### Build Process
```bash
npm run build
# 1. Generates Prisma client
# 2. Runs pending migrations
# 3. Generates OpenAPI spec
# 4. Builds Next.js application
```

### Environment Profiles
- **Development:** `npm run dev` (port 4002)
- **Production:** `npm run start` (port 4002)

---

## Testing

### E2E Testing (Playwright)
**Location:** `/tests/`
**Run:** `npm run test:e2e`

- Browser automation tests
- User workflow validation
- Cross-browser testing (Chromium, Firefox)
- HTML test reports in `/report/`

### Unit Testing (Jest)
**Location:** `/__tests__/`
**Run:** `npm run test`

- Component tests
- Utility function tests
- Coverage reporting: `npm run test:cov`

### Code Quality
- **Linting:** `npm run check-lint`
- **Formatting:** `npm run format`
- **Type Checking:** `npm run check-types`
- **All Checks:** `npm run test-all`

---

## Development Workflow

### Getting Started
```bash
# 1. Clone repository
git clone https://github.com/UnicisTech/unicis-platform-ce.git
cd unicis-platform-ce

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Setup database
docker-compose up -d
npx prisma db push

# 5. Start dev server & worker
npm run dev          # Terminal 1, port 4002
npm run worker       # Terminal 2

# 6. (Optional) Prisma Studio
npx prisma studio   # Terminal 3, port 5555
```

### Database Management
- **Migrations:** `npx prisma migrate dev`
- **Schema Changes:** Edit `prisma/schema.prisma`, then `npx prisma migrate dev`
- **Reset:** `npx prisma migrate reset` (dev only)
- **Studio:** `npx prisma studio` - Visual DB editor

### Code Organization Best Practices
1. **API Routes:** Keep thin, delegate logic to `/lib`
2. **Components:** Reusable, single responsibility
3. **Hooks:** Custom hooks for feature-specific logic
4. **Models:** Data access layer in `/lib`
5. **Types:** Centralized in `/types` and `/models`

---

## Performance Considerations

### Optimization Techniques
- **Image Optimization:** Next.js Image component
- **Code Splitting:** Dynamic imports for large components
- **SWR Caching:** Client-side data caching
- **Database Indexing:** Strategic indexes on frequently queried fields
- **Pagination:** Implemented for large data sets

### Database Indexes
```sql
-- Task queries
@@index([duedate])
@@index([teamId, status, kanbanOrder])
@@index([recurrenceScheduleId])

-- Notification queries
@@index([recipientId, isRead])
@@index([recipientId, createdAt])
@@index([teamId])

-- Task Recurrence
@@index([teamId, status])
@@index([status, nextRunAt])
```

### Metrics & Monitoring
- **Matomo Analytics:** Privacy-respecting analytics
- **Health Check:** `/api/health` endpoint
- **Metrics:** `@boxyhq/metrics` integration

---

## Error Handling

### Server-Side
- **Custom Errors:** Defined in `lib/errors.ts`
- **API Error Responses:** Consistent JSON format
- **Logging:** Structured error logging

### Client-Side
- **React Hot Toast:** User-friendly error messages
- **Fallback UI:** Error boundaries
- **Retry Logic:** SWR automatic retries

---

## Future Roadmap

### Coming Features
- Right to Erasure Request Form
- Processor Questionnaire Checklist
- Asset Inventory Management
- Vendor Assessment Checklist
- Benchmark Report / Trust Center
- Vendor Report
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
- TISAX (Trusted Information Security Assessment Exchange)
- EU AI Act
- HIPAA (Health Insurance Portability and Accountability Act)
- Custom frameworks

---

## Community & Support

- **GitHub:** [UnicisTech/unicis-platform-ce](https://github.com/UnicisTech/unicis-platform-ce)
- **Documentation:** https://www.unicis.tech/docs/platform
- **Discord:** https://discord.com/invite/8TwyeD97HD
- **LinkedIn:** https://www.linkedin.com/company/unicis-tech-oü/
- **Email:** Contact via website

---

## License

Apache License 2.0 - See LICENSE file for details

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Bug reporting
- Feature requests
- Code contributions
- Pull request process

---

## Glossary

- **RPA:** Record of Processing Activities (GDPR compliance)
- **TIA:** Transfer Impact Assessment (data transfers)
- **PIA:** Privacy Impact Assessment
- **CSC:** Cybersecurity Controls (control mapping)
- **IAP:** Interactive Awareness Program (training)
- **SoA:** Statement of Applicability (control assessment)
- **SAML:** Security Assertion Markup Language (SSO)
- **SCIM:** System for Cross-domain Identity Management
- **JWT:** JSON Web Token (session)
- **SAST:** Static Application Security Testing
- **SBOM:** Software Bill of Materials
