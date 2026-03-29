# Unicis Platform - Right to Erase Request (MVP)

**Last updated:** 2026-03-13 | **Owner:** Privacy & Compliance

---

## 1. Problem & Goal

Provide a **public form** for data subjects (clients of our customers/teams) to submit **Right to Erasure** requests under GDPR Article 17. Each submission creates a **Task** in Unicis with a dedicated **Right to Erase** tab. The system is a coordination tool; customers execute erasure in their own systems.

---

## 2. MVP Scope

### In Scope

- Public form endpoint per team (no login required)
- Minimal form fields to triage erasure requests
- Auto-creation of a linked Task on submit
- Public status page via magic-link token (read-only + comment)
- Internal Task tab: "Right to Erase" with status management, comments
- Email notifications: confirmation to requester, alert to team
- Audit trail via existing Task comments

### Out of Scope (v2+)

- File attachments on public form
- Automated erasure in customer systems
- Identity verification workflows (email OTP, doc check)
- SLA timers / due-date automation
- Additional DSR types (Access, Rectification, Portability)
- Templates/snippets for responses
- Webhook integrations for DSR events
- Exportable archive packages

---

## 3. Roles & Permissions

| Role | Capabilities |
|---|---|
| **Requester** (public, unauthenticated) | Submit form; view read-only details via magic link; post public comments |
| **Team OWNER / ADMIN** | View & edit erasure request; change status; reply to requester; add internal notes |
| **Team MEMBER** | View & edit erasure request (same as task permissions) |
| **Team AUDITOR** | Read-only access to erasure requests |

Reuses existing `task` resource permissions from `lib/permissions.ts`. New resource `erasure_request` added with same role mapping.

---

## 4. URL & Routing

### Public (unauthenticated)

| Method | Path | Description |
|---|---|---|
| `GET` | `/teams/:slug/gdpr` | Public erasure request form |
| `POST` | `/api/teams/:slug/erasure-requests` | Submit a new request |
| `GET` | `/teams/:slug/gdpr/:token` | Public status page (magic link) |
| `POST` | `/api/erasure-requests/:token/comments` | Requester posts a comment |

### Internal (authenticated)

| Method | Path | Description |
|---|---|---|
| `GET` | `/teams/:slug/privacy-requests` | Index page listing all erasure requests |
| Task detail page | Tab: "Right to Erase" | Inline tab in existing task detail view |
| `GET` | `/api/teams/:slug/erasure-requests` | List all team erasure requests |
| `GET` | `/api/teams/:slug/erasure-requests/:id` | Get single request with comments |
| `PUT` | `/api/teams/:slug/erasure-requests/:id` | Update status |
| `POST` | `/api/teams/:slug/erasure-requests/:id/comments` | Internal comment/reply |

---

## 5. Data Model

### 5.1 Prisma Schema Additions

```prisma
// Add to prisma/schema.prisma

enum ErasureRequestStatus {
  NEW
  IN_REVIEW
  ACTION_REQUIRED
  COMPLETED
  REJECTED
}

enum RequesterType {
  DATA_SUBJECT
  AUTHORIZED_AGENT
}

enum SubjectIdentifierType {
  EMAIL
  PHONE
  ACCOUNT_ID
  OTHER
}

enum ErasureCommentAuthorType {
  REQUESTER
  TEAM_MEMBER
}

enum ErasureCommentVisibility {
  PUBLIC
  INTERNAL
}

model ErasureRequest {
  id                    String                  @id @default(uuid())
  teamId                String
  taskId                Int?
  tokenHash             String                  @unique
  shortId               String                  @unique // e.g. "ER-abc123"
  requesterFullName     String
  requesterEmail        String
  requesterType         RequesterType
  subjectIdentifierType SubjectIdentifierType
  subjectIdentifierValue String
  justification         String?
  status                ErasureRequestStatus    @default(NEW)
  resolutionNote        String?
  submittedAt           DateTime                @default(now())
  closedAt              DateTime?
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt

  team                  Team                    @relation(fields: [teamId], references: [id], onDelete: Cascade)
  task                  Task?                   @relation(fields: [taskId], references: [id], onDelete: SetNull)
  comments              ErasureRequestComment[]

  @@index([teamId])
  @@index([status])
}

model ErasureRequestComment {
  id                    String                      @id @default(uuid())
  requestId             String
  authorType            ErasureCommentAuthorType
  authorRef             String                      // requester email or user ID
  authorName            String                      // display name
  body                  String
  visibility            ErasureCommentVisibility     @default(PUBLIC)
  createdAt             DateTime                     @default(now())

  request               ErasureRequest               @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@index([requestId])
}
```

### 5.2 Relation Additions to Existing Models

```prisma
// Add to Team model:
model Team {
  // ... existing fields ...
  erasureRequests  ErasureRequest[]
}

// Add to Task model:
model Task {
  // ... existing fields ...
  erasureRequest   ErasureRequest?
}
```

### 5.3 Design Decisions

- **`tokenHash`**: Store only a SHA-256 hash of the magic-link token. The raw token is returned once at submission and sent via email. Lookup is done by hashing the incoming token and querying by `tokenHash`.
- **`shortId`**: Human-readable ID like `ER-a1b2c3` for display. Generated from first 6 chars of a nanoid.
- **`taskId`**: FK to the auto-created Task. Nullable in case task is deleted separately.
- **No separate attachments table in MVP**: Attachments will use the existing `Attachment` model on the linked Task.
- **Audit trail**: Status changes are logged as `ErasureRequestComment` entries with `visibility: INTERNAL` and a system-generated body (e.g., "Status changed from NEW to IN_REVIEW by admin@example.com").

---

## 6. Public Form (Fields & Validation)

### Form Fields

| Field | Type | Required | Validation |
|---|---|---|---|
| Requester full name | `text` | Yes | min 2 chars, max 200 |
| Requester email | `email` | Yes | Valid email format |
| Are you the data subject or authorized agent? | `select` | Yes | `DATA_SUBJECT` or `AUTHORIZED_AGENT` |
| Identifier type | `select` | Yes | `EMAIL`, `PHONE`, `ACCOUNT_ID`, `OTHER` |
| Identifier value | `text` | Yes | min 1 char, max 500 |
| Additional context | `textarea` | No | max 2000 chars |
| Consent checkbox | `checkbox` | Yes | Must be checked |

### Zod Validation Schema

```typescript
// lib/erasure-request/schema.ts

import { z } from 'zod';

export const erasureRequestSchema = z.object({
  requesterFullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200),
  requesterEmail: z
    .string()
    .email('Please enter a valid email address'),
  requesterType: z.enum(['DATA_SUBJECT', 'AUTHORIZED_AGENT']),
  subjectIdentifierType: z.enum(['EMAIL', 'PHONE', 'ACCOUNT_ID', 'OTHER']),
  subjectIdentifierValue: z
    .string()
    .min(1, 'Identifier value is required')
    .max(500),
  justification: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal('')),
  consent: z
    .literal(true, {
      errorMap: () => ({ message: 'You must confirm the information is accurate' }),
    }),
});

export type ErasureRequestFormData = z.infer<typeof erasureRequestSchema>;
```

### UX

- Single-page form with grouped sections
- Success screen shows: "We created request **#ER-{shortId}**. Save this link to track status." with copyable magic link
- Confirmation email also sent

---

## 7. State Machine

```
NEW → IN_REVIEW → ACTION_REQUIRED ↔ IN_REVIEW → COMPLETED
                                                → REJECTED
```

### Transition Rules

| From | To | Trigger |
|---|---|---|
| `NEW` | `IN_REVIEW` | Team member opens/reviews request |
| `IN_REVIEW` | `ACTION_REQUIRED` | Team needs more info from requester |
| `ACTION_REQUIRED` | `IN_REVIEW` | Requester posts a comment |
| `IN_REVIEW` | `COMPLETED` | Team marks as completed with resolution note |
| `IN_REVIEW` | `REJECTED` | Team rejects with reason |

### Validation

```typescript
// lib/erasure-request/stateMachine.ts

const validTransitions: Record<string, string[]> = {
  NEW: ['IN_REVIEW'],
  IN_REVIEW: ['ACTION_REQUIRED', 'COMPLETED', 'REJECTED'],
  ACTION_REQUIRED: ['IN_REVIEW'],
  COMPLETED: [],
  REJECTED: [],
};

export const canTransition = (from: string, to: string): boolean => {
  return validTransitions[from]?.includes(to) ?? false;
};
```

---

## 8. Task Integration

On form submission:

1. Create `ErasureRequest` record with `tokenHash` and `shortId`.
2. Create a Task with:
   - **Title**: `"Erasure Request: {subjectIdentifierValue}"`
   - **Status**: `"todo"`
   - **Description**: Auto-generated summary of the request
   - **Properties**: `{ erasure_request_id: "<uuid>" }`
3. Link `taskId` back to the `ErasureRequest`.

The Task detail page gains a new **"Right to Erase"** tab showing the erasure request details, status management, and conversation thread.

---

## 9. TypeScript Interfaces

```typescript
// types/erasure.ts

export interface ErasureRequestRecord {
  id: string;
  teamId: string;
  taskId: number | null;
  shortId: string;
  requesterFullName: string;
  requesterEmail: string;
  requesterType: 'DATA_SUBJECT' | 'AUTHORIZED_AGENT';
  subjectIdentifierType: 'EMAIL' | 'PHONE' | 'ACCOUNT_ID' | 'OTHER';
  subjectIdentifierValue: string;
  justification: string | null;
  status: ErasureRequestStatusType;
  resolutionNote: string | null;
  submittedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  comments?: ErasureRequestCommentRecord[];
}

export type ErasureRequestStatusType =
  | 'NEW'
  | 'IN_REVIEW'
  | 'ACTION_REQUIRED'
  | 'COMPLETED'
  | 'REJECTED';

export interface ErasureRequestCommentRecord {
  id: string;
  requestId: string;
  authorType: 'REQUESTER' | 'TEAM_MEMBER';
  authorRef: string;
  authorName: string;
  body: string;
  visibility: 'PUBLIC' | 'INTERNAL';
  createdAt: string;
}

export interface ErasureRequestPublicView {
  shortId: string;
  status: ErasureRequestStatusType;
  requesterFullName: string;
  subjectIdentifierType: string;
  subjectIdentifierValue: string;
  submittedAt: string;
  closedAt: string | null;
  resolutionNote: string | null;
  comments: ErasureRequestCommentRecord[]; // only PUBLIC visibility
}

export interface ErasureRequestSubmitPayload {
  requesterFullName: string;
  requesterEmail: string;
  requesterType: 'DATA_SUBJECT' | 'AUTHORIZED_AGENT';
  subjectIdentifierType: 'EMAIL' | 'PHONE' | 'ACCOUNT_ID' | 'OTHER';
  subjectIdentifierValue: string;
  justification?: string;
  consent: true;
}

export interface ErasureRequestSubmitResponse {
  id: string;
  shortId: string;
  taskNumber: number;
  status: 'NEW';
  magicLink: string;
}

export interface ErasureRequestStatusUpdate {
  status: ErasureRequestStatusType;
  resolutionNote?: string;
  messageToRequester?: string; // optional public comment on status change
}
```

---

## 10. API Implementation

### 10.1 Submit Request (Public)

```
POST /api/teams/:slug/erasure-requests
```

**No authentication required.** Rate-limited.

```typescript
// pages/api/teams/[slug]/erasure-requests/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { createTask } from '@/models/task';
import { erasureRequestSchema } from '@/lib/erasure-request/schema';
import { generateToken, hashToken, generateShortId } from '@/lib/erasure-request/utils';
import { sendErasureConfirmationEmail, sendErasureTeamAlertEmail } from '@/lib/email/sendErasureEmails';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query as { slug: string };

  const team = await prisma.team.findUnique({
    where: { slug },
    include: { members: { include: { user: true } } },
  });

  if (!team) {
    return res.status(404).json({ error: { message: 'Team not found' } });
  }

  switch (req.method) {
    case 'GET': {
      // Authenticated: list all erasure requests for team
      // Uses throwIfNoTeamAccess pattern
      const { throwIfNoTeamAccess } = await import('@/lib/teams');
      const teamMember = await throwIfNoTeamAccess(req, res);
      if (!teamMember) return;

      const requests = await prisma.erasureRequest.findMany({
        where: { teamId: team.id },
        orderBy: { submittedAt: 'desc' },
        include: { task: { select: { taskNumber: true, status: true } } },
      });

      return res.status(200).json({ data: requests });
    }

    case 'POST': {
      // Public: submit new erasure request
      // TODO: Add rate limiting middleware

      const parsed = erasureRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({
          error: { message: 'Validation failed', values: parsed.error.flatten() },
        });
      }

      const { consent, ...data } = parsed.data;
      const token = generateToken();
      const tokenHash = hashToken(token);
      const shortId = generateShortId();

      // Find first OWNER or ADMIN as the task author
      const adminMember = team.members.find(
        (m) => m.role === 'OWNER' || m.role === 'ADMIN'
      );
      if (!adminMember) {
        return res.status(500).json({ error: { message: 'No team admin found' } });
      }

      // Create Task
      const task = await createTask({
        authorId: adminMember.userId,
        teamId: team.id,
        title: `Erasure Request: ${data.subjectIdentifierValue}`,
        status: 'todo',
        duedate: '',
        description: `Right to Erase request from ${data.requesterFullName} (${data.requesterEmail}). Identifier: ${data.subjectIdentifierType} - ${data.subjectIdentifierValue}.${data.justification ? ` Context: ${data.justification}` : ''}`,
      });

      // Create ErasureRequest
      const erasureRequest = await prisma.erasureRequest.create({
        data: {
          teamId: team.id,
          taskId: task.id,
          tokenHash,
          shortId,
          requesterFullName: data.requesterFullName,
          requesterEmail: data.requesterEmail,
          requesterType: data.requesterType,
          subjectIdentifierType: data.subjectIdentifierType,
          subjectIdentifierValue: data.subjectIdentifierValue,
          justification: data.justification || null,
        },
      });

      // Update task properties to link back
      await prisma.task.update({
        where: { id: task.id },
        data: {
          properties: { erasure_request_id: erasureRequest.id },
        },
      });

      const magicLink = `${env.appUrl}/teams/${slug}/gdpr/${token}`;

      // Send emails
      await sendErasureConfirmationEmail({
        to: data.requesterEmail,
        requesterName: data.requesterFullName,
        shortId,
        magicLink,
        teamName: team.name,
      });

      await sendErasureTeamAlertEmail({
        team,
        shortId,
        requesterName: data.requesterFullName,
        identifierValue: data.subjectIdentifierValue,
        taskNumber: task.taskNumber,
      });

      return res.status(201).json({
        data: {
          id: erasureRequest.id,
          shortId,
          taskNumber: task.taskNumber,
          status: 'NEW',
          magicLink,
        },
      });
    }

    default:
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).end();
  }
}
```

### 10.2 Public Status Page API

```
GET /api/erasure-requests/:token
POST /api/erasure-requests/:token/comments
```

```typescript
// pages/api/erasure-requests/[token]/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/erasure-request/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query as { token: string };
  const tokenHash = hashToken(token);

  const erasureRequest = await prisma.erasureRequest.findUnique({
    where: { tokenHash },
    include: {
      comments: {
        where: { visibility: 'PUBLIC' },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!erasureRequest) {
    return res.status(404).json({ error: { message: 'Request not found' } });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      data: {
        shortId: erasureRequest.shortId,
        status: erasureRequest.status,
        requesterFullName: erasureRequest.requesterFullName,
        subjectIdentifierType: erasureRequest.subjectIdentifierType,
        subjectIdentifierValue: erasureRequest.subjectIdentifierValue,
        submittedAt: erasureRequest.submittedAt,
        closedAt: erasureRequest.closedAt,
        resolutionNote: erasureRequest.resolutionNote,
        comments: erasureRequest.comments,
      },
    });
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).end();
}
```

```typescript
// pages/api/erasure-requests/[token]/comments.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/erasure-request/utils';
import { z } from 'zod';

const commentSchema = z.object({
  body: z.string().min(1).max(5000),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const { token } = req.query as { token: string };
  const tokenHash = hashToken(token);

  const erasureRequest = await prisma.erasureRequest.findUnique({
    where: { tokenHash },
  });

  if (!erasureRequest) {
    return res.status(404).json({ error: { message: 'Request not found' } });
  }

  // Only allow comments when request is open
  if (['COMPLETED', 'REJECTED'].includes(erasureRequest.status)) {
    return res.status(400).json({ error: { message: 'Request is closed' } });
  }

  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: { message: 'Invalid comment' } });
  }

  const comment = await prisma.erasureRequestComment.create({
    data: {
      requestId: erasureRequest.id,
      authorType: 'REQUESTER',
      authorRef: erasureRequest.requesterEmail,
      authorName: erasureRequest.requesterFullName,
      body: parsed.data.body,
      visibility: 'PUBLIC',
    },
  });

  // If status was ACTION_REQUIRED, move back to IN_REVIEW
  if (erasureRequest.status === 'ACTION_REQUIRED') {
    await prisma.erasureRequest.update({
      where: { id: erasureRequest.id },
      data: { status: 'IN_REVIEW' },
    });
  }

  return res.status(201).json({ data: comment });
}
```

### 10.3 Internal: Update Status

```typescript
// pages/api/teams/[slug]/erasure-requests/[id]/status.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from '@/lib/teams';
import { prisma } from '@/lib/prisma';
import { canTransition } from '@/lib/erasure-request/stateMachine';
import { sendErasureStatusUpdateEmail } from '@/lib/email/sendErasureEmails';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).end();
  }

  const teamMember = await throwIfNoTeamAccess(req, res);
  if (!teamMember) return;

  const { id } = req.query as { id: string };
  const { status, resolutionNote, messageToRequester } = req.body;

  const erasureRequest = await prisma.erasureRequest.findFirst({
    where: { id, teamId: teamMember.teamId },
  });

  if (!erasureRequest) {
    return res.status(404).json({ error: { message: 'Request not found' } });
  }

  if (!canTransition(erasureRequest.status, status)) {
    return res.status(400).json({
      error: { message: `Cannot transition from ${erasureRequest.status} to ${status}` },
    });
  }

  const isClosed = ['COMPLETED', 'REJECTED'].includes(status);

  const updated = await prisma.erasureRequest.update({
    where: { id },
    data: {
      status,
      resolutionNote: resolutionNote || erasureRequest.resolutionNote,
      closedAt: isClosed ? new Date() : null,
    },
  });

  // Log status change as internal comment
  await prisma.erasureRequestComment.create({
    data: {
      requestId: id,
      authorType: 'TEAM_MEMBER',
      authorRef: teamMember.userId,
      authorName: 'System',
      body: `Status changed from ${erasureRequest.status} to ${status}${resolutionNote ? `: ${resolutionNote}` : ''}`,
      visibility: 'INTERNAL',
    },
  });

  // If team sends a message to requester, create public comment
  if (messageToRequester) {
    await prisma.erasureRequestComment.create({
      data: {
        requestId: id,
        authorType: 'TEAM_MEMBER',
        authorRef: teamMember.userId,
        authorName: 'Team',
        body: messageToRequester,
        visibility: 'PUBLIC',
      },
    });
  }

  // Send email notification to requester
  await sendErasureStatusUpdateEmail({
    to: erasureRequest.requesterEmail,
    requesterName: erasureRequest.requesterFullName,
    shortId: erasureRequest.shortId,
    newStatus: status,
    message: messageToRequester,
  });

  return res.status(200).json({ data: updated });
}
```

### 10.4 Internal: Post Comment

```typescript
// pages/api/teams/[slug]/erasure-requests/[id]/comments.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from '@/lib/teams';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const commentSchema = z.object({
  body: z.string().min(1).max(5000),
  visibility: z.enum(['PUBLIC', 'INTERNAL']).default('INTERNAL'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const teamMember = await throwIfNoTeamAccess(req, res);
  if (!teamMember) return;

  const { id } = req.query as { id: string };
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: { message: 'Invalid comment' } });
  }

  const erasureRequest = await prisma.erasureRequest.findFirst({
    where: { id, teamId: teamMember.teamId },
  });

  if (!erasureRequest) {
    return res.status(404).json({ error: { message: 'Request not found' } });
  }

  // Get team member's user info
  const user = await prisma.user.findUnique({
    where: { id: teamMember.userId },
  });

  const comment = await prisma.erasureRequestComment.create({
    data: {
      requestId: id,
      authorType: 'TEAM_MEMBER',
      authorRef: teamMember.userId,
      authorName: user?.name || 'Team Member',
      body: parsed.data.body,
      visibility: parsed.data.visibility,
    },
  });

  // If public comment, email the requester
  if (parsed.data.visibility === 'PUBLIC') {
    const { sendErasureCommentNotificationEmail } = await import(
      '@/lib/email/sendErasureEmails'
    );
    await sendErasureCommentNotificationEmail({
      to: erasureRequest.requesterEmail,
      requesterName: erasureRequest.requesterFullName,
      shortId: erasureRequest.shortId,
      commentBody: parsed.data.body,
    });
  }

  return res.status(201).json({ data: comment });
}
```

---

## 11. Utility Functions

```typescript
// lib/erasure-request/utils.ts

import crypto from 'crypto';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

/** Generate a high-entropy magic-link token */
export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/** Hash a token for storage (never store raw tokens) */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/** Generate a short human-readable ID like "ER-a1b2c3d4" */
export const generateShortId = (): string => {
  return `ER-${nanoid()}`;
};
```

---

## 12. Email Templates

```typescript
// lib/email/sendErasureEmails.ts

import { sendEmail } from './sendEmail';
import env from '../env';

interface ConfirmationEmailParams {
  to: string;
  requesterName: string;
  shortId: string;
  magicLink: string;
  teamName: string;
}

export const sendErasureConfirmationEmail = async (params: ConfirmationEmailParams) => {
  const { to, requesterName, shortId, magicLink, teamName } = params;

  await sendEmail({
    to,
    subject: `Erasure Request ${shortId} - Confirmation`,
    html: `
      <h2>Erasure Request Received</h2>
      <p>Hello ${requesterName},</p>
      <p>Your Right to Erasure request <strong>${shortId}</strong> has been received by <strong>${teamName}</strong>.</p>
      <p>You can track the status of your request at any time using this link:</p>
      <p><a href="${magicLink}">${magicLink}</a></p>
      <p>Please save this link for your records. We will notify you of any updates.</p>
    `,
    text: `Erasure Request ${shortId} received. Track status: ${magicLink}`,
  });
};

interface TeamAlertEmailParams {
  team: { id: string; name: string; members: Array<{ user: { email: string }; role: string }> };
  shortId: string;
  requesterName: string;
  identifierValue: string;
  taskNumber: number;
}

export const sendErasureTeamAlertEmail = async (params: TeamAlertEmailParams) => {
  const { team, shortId, requesterName, identifierValue, taskNumber } = params;

  // Notify OWNER and ADMIN members
  const admins = team.members.filter((m) => m.role === 'OWNER' || m.role === 'ADMIN');

  for (const admin of admins) {
    await sendEmail({
      to: admin.user.email,
      subject: `New Erasure Request ${shortId}`,
      html: `
        <h2>New Right to Erasure Request</h2>
        <p>A new erasure request <strong>${shortId}</strong> has been submitted.</p>
        <ul>
          <li><strong>Requester:</strong> ${requesterName}</li>
          <li><strong>Subject Identifier:</strong> ${identifierValue}</li>
        </ul>
        <p>A task has been created: <a href="${env.appUrl}/teams/${team.name}/tasks/${taskNumber}">Task #${taskNumber}</a></p>
      `,
    });
  }
};

interface StatusUpdateEmailParams {
  to: string;
  requesterName: string;
  shortId: string;
  newStatus: string;
  message?: string;
}

export const sendErasureStatusUpdateEmail = async (params: StatusUpdateEmailParams) => {
  const { to, requesterName, shortId, newStatus, message } = params;

  const statusLabels: Record<string, string> = {
    IN_REVIEW: 'In Review',
    ACTION_REQUIRED: 'Action Required',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
  };

  await sendEmail({
    to,
    subject: `Erasure Request ${shortId} - ${statusLabels[newStatus] || newStatus}`,
    html: `
      <h2>Erasure Request Update</h2>
      <p>Hello ${requesterName},</p>
      <p>Your erasure request <strong>${shortId}</strong> has been updated to: <strong>${statusLabels[newStatus] || newStatus}</strong></p>
      ${message ? `<p><strong>Message from team:</strong> ${message}</p>` : ''}
    `,
  });
};

interface CommentNotificationEmailParams {
  to: string;
  requesterName: string;
  shortId: string;
  commentBody: string;
}

export const sendErasureCommentNotificationEmail = async (
  params: CommentNotificationEmailParams
) => {
  const { to, requesterName, shortId, commentBody } = params;

  await sendEmail({
    to,
    subject: `Erasure Request ${shortId} - New Message`,
    html: `
      <h2>New Message on Your Erasure Request</h2>
      <p>Hello ${requesterName},</p>
      <p>A new message has been posted on your erasure request <strong>${shortId}</strong>:</p>
      <blockquote>${commentBody}</blockquote>
    `,
  });
};
```

---

## 13. Frontend Components

### 13.1 Public Form Page

```
pages/teams/[slug]/gdpr/index.tsx
```

- Unauthenticated page (no `getServerSideProps` auth check)
- Uses `react-hook-form` + `zod` resolver
- Fetches team name via public API for display
- On success: shows success screen with copyable magic link
- Styled with Shadcn `Card`, `Input`, `Select`, `Textarea`, `Checkbox`, `Button`

### 13.2 Public Status Page

```
pages/teams/[slug]/gdpr/[token].tsx
```

- Unauthenticated page
- Fetches erasure request via `/api/erasure-requests/:token`
- Shows: request summary, status badge, timeline of public comments
- Comment composer (textarea + submit button) when status is not COMPLETED/REJECTED

### 13.3 Internal: Privacy Requests Index

```
pages/teams/[slug]/privacy-requests.tsx
```

- Authenticated page (uses `useTeam`, `useCanAccess`)
- Table with columns: Short ID, Identifier, Requester, Status, Submitted, Task #
- Filters by status
- Links to the associated Task detail page

### 13.4 Internal: Task "Right to Erase" Tab

New component: `components/interfaces/erasure/ErasurePanel.tsx`

Sections:
1. **Request Summary**: Requester info, identifier, timestamps, status badge
2. **Status Actions**: Buttons to transition status (Set In Review, Request More Info, Mark Completed, Reject)
3. **Conversation**: Two views toggled - "Public Thread" and "Internal Notes"
4. **Audit**: Timeline of status changes

### 13.5 Component Tree

```
components/interfaces/erasure/
├── ErasurePanel.tsx          # Main tab panel (used in Task detail page)
├── ErasureRequestSummary.tsx # Read-only request details
├── ErasureStatusActions.tsx  # Status transition buttons
├── ErasureConversation.tsx   # Comments thread (public/internal toggle)
├── ErasurePublicForm.tsx     # Public submission form
├── ErasurePublicStatus.tsx   # Public status page view
└── ErasureRequestsTable.tsx  # Index table for privacy-requests page
```

---

## 14. Integration Points

### 14.1 Task Tab Navigation

Add "Right to Erase" to `lib/tasks.ts` → `taskNavigations`:

```typescript
// Add conditionally when task has erasure_request_id in properties
{
  name: 'Right to Erase',
  active: activeTab === 'Right to Erase',
}
```

### 14.2 Sidebar Navigation

Add to `components/shared/shell/TeamNavigation.tsx`:

```typescript
{
  name: t('privacy-requests'),
  href: `/teams/${slug}/privacy-requests`,
  icon: ShieldCheckIcon, // from @heroicons/react/24/outline
  active: relativePath.includes('privacy-requests'),
}
```

### 14.3 Permissions

Add to `lib/permissions.ts`:

```typescript
// New resource type
type Resource = ... | 'erasure_request';

// OWNER, ADMIN: actions: '*'
// MEMBER: actions: ['read', 'update']
// AUDITOR: actions: ['read']
```

### 14.4 Task Module Key

Add to `lib/tasks.ts`:

```typescript
export const taskModuleKeys = [
  'rpa_procedure',
  'tia_procedure',
  'pia_risk',
  'rm_risk',
  'csc_controls',
  'erasure_request_id', // NEW
] as const;
```

### 14.5 Types Export

Add to `types/index.ts`:

```typescript
export * from './erasure';
```

### 14.6 App Events

Add to `types/base.ts` `AppEvent` type:

```typescript
| 'erasure_request.created'
| 'erasure_request.updated'
| 'erasure_request.commented'
```

---

## 15. Security

| Concern | Implementation |
|---|---|
| Token storage | Store SHA-256 hash only (`tokenHash`); raw token returned once |
| Rate limiting | Limit public `POST` endpoints (e.g., 5 requests/min per IP) |
| reCAPTCHA | Integrate existing `env.recaptcha` config on public form |
| PII minimization | Public status page shows only requester name + identifier; hides team internals |
| Input sanitization | Zod validation + DOMPurify for comment bodies (as used elsewhere in platform) |
| CORS | Public API endpoints restricted to same-origin |
| Token expiry | Magic links are valid while request is not closed (COMPLETED/REJECTED) + max 90 days |

---

## 16. Notifications (MVP)

| # | Trigger | Recipient | Content |
|---|---|---|---|
| 1 | Request submitted | Requester | Confirmation + magic link |
| 2 | Request submitted | Team OWNER/ADMIN | Alert with link to Task |
| 3 | Status changed | Requester | New status + optional message |
| 4 | Public comment by team | Requester | Comment content |
| 5 | Comment by requester | Team OWNER/ADMIN | Notification with comment |

---

## 17. Database Migration

```bash
npx prisma migrate dev --name add_erasure_requests
```

This creates the `ErasureRequest`, `ErasureRequestComment` tables and all necessary enums.

---

## 18. Implementation Plan (Step by Step)

### Phase 1: Data Layer (Backend Foundation)

| Step | Files | Description |
|---|---|---|
| 1.1 | `prisma/schema.prisma` | Add `ErasureRequest`, `ErasureRequestComment` models + enums + relations to Team & Task |
| 1.2 | Run migration | `npx prisma migrate dev --name add_erasure_requests` |
| 1.3 | `types/erasure.ts` | Add TypeScript interfaces |
| 1.4 | `types/index.ts` | Re-export erasure types |
| 1.5 | `lib/erasure-request/schema.ts` | Zod validation schema |
| 1.6 | `lib/erasure-request/utils.ts` | Token generation, hashing, shortId |
| 1.7 | `lib/erasure-request/stateMachine.ts` | Status transition validation |
| 1.8 | `models/erasureRequest.ts` | Data access functions (CRUD queries) |

### Phase 2: API Routes

| Step | Files | Description |
|---|---|---|
| 2.1 | `pages/api/teams/[slug]/erasure-requests/index.ts` | POST (public submit) + GET (list, authenticated) |
| 2.2 | `pages/api/teams/[slug]/erasure-requests/[id]/index.ts` | GET (detail) + PUT (update) |
| 2.3 | `pages/api/teams/[slug]/erasure-requests/[id]/status.ts` | PUT (status transition) |
| 2.4 | `pages/api/teams/[slug]/erasure-requests/[id]/comments.ts` | POST (internal comment) |
| 2.5 | `pages/api/erasure-requests/[token]/index.ts` | GET (public status) |
| 2.6 | `pages/api/erasure-requests/[token]/comments.ts` | POST (requester comment) |

### Phase 3: Emails

| Step | Files | Description |
|---|---|---|
| 3.1 | `lib/email/sendErasureEmails.ts` | All 4 email functions |

### Phase 4: Frontend - Public Pages

| Step | Files | Description |
|---|---|---|
| 4.1 | `components/interfaces/erasure/ErasurePublicForm.tsx` | Form component |
| 4.2 | `pages/teams/[slug]/gdpr/index.tsx` | Public form page |
| 4.3 | `components/interfaces/erasure/ErasurePublicStatus.tsx` | Status view component |
| 4.4 | `pages/teams/[slug]/gdpr/[token].tsx` | Public status page |

### Phase 5: Frontend - Internal UI

| Step | Files | Description |
|---|---|---|
| 5.1 | `components/interfaces/erasure/ErasureRequestSummary.tsx` | Request detail card |
| 5.2 | `components/interfaces/erasure/ErasureStatusActions.tsx` | Status action buttons |
| 5.3 | `components/interfaces/erasure/ErasureConversation.tsx` | Comments thread |
| 5.4 | `components/interfaces/erasure/ErasurePanel.tsx` | Main tab panel |
| 5.5 | `components/interfaces/erasure/ErasureRequestsTable.tsx` | Index table |
| 5.6 | `pages/teams/[slug]/privacy-requests.tsx` | Index page |

### Phase 6: Integration

| Step | Files | Description |
|---|---|---|
| 6.1 | `lib/tasks.ts` | Add "Right to Erase" tab + `erasure_request_id` module key |
| 6.2 | `pages/teams/[slug]/tasks/[taskNumber]/index.tsx` | Render `ErasurePanel` in new tab |
| 6.3 | `components/shared/shell/TeamNavigation.tsx` | Add "Privacy Requests" sidebar item |
| 6.4 | `lib/permissions.ts` | Add `erasure_request` resource |
| 6.5 | `types/base.ts` | Add erasure AppEvent types |
| 6.6 | `hooks/useErasureRequest.ts` | SWR hook for fetching erasure data |

### Phase 7: Polish & Security

| Step | Files | Description |
|---|---|---|
| 7.1 | Add rate limiting middleware to public endpoints | |
| 7.2 | Integrate reCAPTCHA on public form | |
| 7.3 | Add i18n keys to `locales/en/common.json` | |
| 7.4 | Write tests for API routes and state machine | |

---

## 19. Acceptance Criteria (MVP)

1. Public form at `/teams/:slug/gdpr/` collects required fields + consent and submits successfully.
2. Submission creates a linked Task and an `ErasureRequest` record; requester receives confirmation email with magic link.
3. Public status page at `/teams/:slug/gdpr/:token` shows read-only data and allows requester comments; no editing of original fields.
4. Internal "Right to Erase" tab in Task shows all details, allows status changes, internal notes, and public replies.
5. "Privacy Requests" sidebar item shows index of all erasure requests with status filters.
6. Status transitions follow the defined state machine; invalid transitions are rejected.
7. Notifications fire on submit, status change, and public comments.
8. Magic-link tokens are stored as hashes only.
9. Public endpoints are rate-limited.

---

## 20. Future (v2+)

- Identity verification flow (email OTP or doc check) before processing
- SLA timers & reminders; dashboards for DSR metrics
- Additional DSR types (Access, Rectification, Portability) under Privacy Requests
- File attachments on public form with virus scanning
- Templates/snippets for team responses
- Webhook integrations for DSR events (`erasure_request.*`)
- Exportable archive package for compliance records
- Scope-of-erasure multi-select (team-configurable list of systems/services)
