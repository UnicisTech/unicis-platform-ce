# Unicis Platform — Incident Management Module (Implementation Spec)

**Last updated:** 2026-07-02 | **Owner:** Platform Engineering | **Status:** Draft — spec only, no code written yet

**Source material:**

- Field/workflow reference: OSCRAT Platform's Incident Management feature (`/Users/pece/Downloads/OSCRAT-main`, `packages/model/types/incidents.ts`, `apps/frontend/lib/validation/incident.ts`, `apps/frontend/components/oscrat/versions/versionDetails/tabs/allTabs/incidents/*`)
- Architecture/design system: [`design.md`](../design.md) (Direction B)
- Precedent module used as the 1:1 architectural template: **Risk Management (RM)** — `types/rm.ts`, `models/rm.ts`, `pages/api/teams/[slug]/tasks/[taskNumber]/rm.ts`, `components/interfaces/risk-management/**`

> Incident Management is already listed under "Coming Features" in `design.md`'s roadmap. This document is the concrete spec to build it.

---

## 1. Problem & Goal

Unicis Platform has no way to record and track security/privacy incidents (breaches, outages, unauthorized access, etc.) against the assets and processes a team already manages. OSCRAT — a fork of this platform — solved this with a first-class `Product → Version → Incident` hierarchy. That hierarchy does not exist in Unicis and is **out of scope** here (see §2).

**Goal:** add an **Incident Report** as a new Task-linked module — architecturally identical to RPA/TIA/PIA/RM/CSC — carrying OSCRAT's incident field set (status, classification, attack type, severity, dates, description, remediation, legal flags), plus a new free-text **Asset Name** field, with the Task itself providing the incident's name and unique reference number.

---

## 2. Scope

### In scope

- `incident_report` property stored on `Task.properties`, following the exact same JSON-blob pattern as `rm_risk`, `pia_risk`, etc.
- Full field set from OSCRAT's `OscratIncidentDetail`, minus fields that don't apply once nested under a Task (see §3.2 mapping table).
- New `AssetName` free-text field (user-supplied, optional, short text) — not present in OSCRAT.
- Create/Edit dialog, list table, read-only task-detail panel, delete flow, audit log timeline — mirroring RM 1:1.
- Module badge, All-Tasks filter, global search, team navigation entry, dashboard banner count.
- i18n keys (English; other 6 locales flagged as required follow-up).
- MCP server tools (`unicis_get_incident`, `unicis_set_incident`, `unicis_delete_incident`).

### Out of scope (this spec)

- Product / Version / Vulnerability entities, SBOM generation, vulnerability/configuration scanning, osquery endpoint collection, CRA-style compliance assessments, and the `jobrunner` background-job app. None of OSCRAT's monorepo/PSIRT machinery is ported.
- A dedicated Product/Version data hierarchy for incidents — incidents attach directly to a `Task`, per the decision below.
- KPI Row / Domain Health Row visual redesign — flagged as an optional Phase 2 enhancement (§10) since it requires a grid layout decision outside this feature's scope.
- Bulk CSV/XLSX import of incidents (RM has this via `pages/api/teams/[slug]/rm/import.ts`) — noted as a Phase 2 candidate, not required for MVP parity with a single-entry module like CSC.

---

## 3. Design Decisions

These resolve ambiguities between OSCRAT's standalone-entity model and Unicis's Task-centric model.

### 3.1 No new Prisma model, no migration

Like RM/PIA/TIA/RPA/CSC, the incident record lives entirely inside `Task.properties` (already `Json`). **No `prisma/schema.prisma` changes and no migration are required.** This is a deliberate parity choice with the existing four modules, all of which avoid dedicated tables for the same reason: one Task ↔ one module record, audit history stored alongside it in the same JSON blob.

### 3.2 "Incident Name" and "unique ID number" map to existing Task fields — not new ones

The user requested the dialog capture "Incident Name and a unique ID number," matching OSCRAT's `name` field and its implicit per-record identity. Neither is duplicated inside `incident_report`:

| Requirement                | Resolution                                                                                                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Incident Name**           | = the linked `Task.title`. No RPA/TIA/PIA/RM module duplicates `Task.title` inside its own JSON blob (RM's first field is a risk *description*, not a name) — Incident Report follows the same rule.       |
| **Unique ID number**        | = the linked `Task.taskNumber` (already unique per team, atomically incremented — see `Team.taskIndex`). Displayed with an `INC-` prefix, e.g. `INC-42`, in the incidents table, detail panel, and exports. |

**Rejected alternative:** a dedicated auto-incrementing incident counter (mirroring OSCRAT's UUID `id`). Rejected because it would introduce a second numbering system alongside `taskNumber` for no functional benefit — every other module already relies on `taskNumber` as the record's public identity in the "All Tasks" list, exports, and deep links.

**Consequence for the create flow:** exactly like RM/TIA/PIA, a user must first create a Task (via the existing "Create Task" flow, giving it a title = the incident name), then open "Add Incident Report" and pick that Task via `TaskPicker`. There is no inline "create task + incident in one step" — this matches all four existing modules.

### 3.3 `incident_report` is a flat object, not a tuple

RM stores `rm_risk` as a 2-element tuple (`[RiskAndImpact, Treatment]`) because its data naturally splits into two sequential assessment stages. TIA uses a 4-tuple for the same reason. Incident fields don't have that same two-stage shape — OSCRAT itself models `OscratIncidentDetail` as one flat object. `incident_report` is therefore a **single flat object**, not an array. The create/edit dialog still uses multiple *steps* (see §8.2) — the steps are a UI convenience over one object, not separate tuple slots.

### 3.4 Field naming: PascalCase keys, to match RM's precedent

RM's JSON keys are PascalCase (`Risk`, `AssetOwner`, `RawProbability`, `RiskTreatment`) and its i18n keys follow (`rm:fields.Risk`). `incident_report` keys use the same convention (`Status`, `Severity`, `AssetName`, …) for consistency with the one other module that has non-trivial structured fields.

### 3.5 Enum values: lowercase strings, not Prisma enums

OSCRAT's `IncidentStatus` / `IncidentClassification` / `IncidentAttackType` / `IncidentSeverity` are real Prisma enums (because Incident is a dedicated table with dedicated columns there). Here they're just values inside a JSON blob — no module property field anywhere in Unicis uses a Prisma enum (RM's `TreatmentStatus` is a plain number; risk buckets are plain lowercase strings like `'low'`/`'medium'`/`'high'`/`'extreme'`, see `lib/rm/export.ts`). Incident enums follow that convention: lowercase, underscore-separated, defined as `as const` TS tuples — not Prisma enums, not UPPER_SNAKE.

| OSCRAT enum (Prisma, UPPER_SNAKE)                                                                                    | Unicis equivalent (TS union, lowercase)                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `PENDING, START, DECLARED, STABLE, ACTIVE, RESOLVED, COMPLETED`                                                         | `'pending' \| 'start' \| 'declared' \| 'stable' \| 'active' \| 'resolved' \| 'completed'`                            |
| `GENERAL, CONFIDENTIALITY, INTEGRITY, AVAILABILITY, ACCESS_CONTROL, VULNERABILITIES, TECHNICAL_FAILURE, THEFT_OR_LOSS` | `'general' \| 'confidentiality' \| 'integrity' \| 'availability' \| 'access_control' \| 'vulnerabilities' \| 'technical_failure' \| 'theft_or_loss'` |
| `DENIAL_OF_SERVICE, UNAUTHORISED_ACCESS, MALWARE, ABUSE, OTHERS`                                                        | `'denial_of_service' \| 'unauthorised_access' \| 'malware' \| 'abuse' \| 'others'`                                   |
| `LOW, MEDIUM, HIGH, CRITICAL`                                                                                            | `'low' \| 'medium' \| 'high' \| 'critical'`                                                                          |

### 3.6 Attachments: reuse Task-level `Attachment`, no incident-scoped linking

OSCRAT's `Attachment` model has a polymorphic FK (`versionId`, `incidentId`, `sbomReportId`, …) because attachments there can belong to many entity types. Unicis's `Attachment` model is already `taskId`-only (`prisma/schema.prisma:199-206`). Incident attachments are simply the linked Task's existing attachments — no schema change, no incident-specific attachment UI beyond what `TaskDetails.tsx` already renders.

### 3.7 Module color & badge

Existing module colors: RPA red-600, TIA blue-600, PIA yellow-500, RM green-600, CSC slate-500. Incident Report uses **orange-600 / orange-100**, badge label **`INC`** — visually distinct, conventionally signals "alert."

### 3.8 Dashboard prominence: minimal in Phase 1, explicit Phase 2 candidates

`KpiRow` is a fixed 6-cell grid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`) already fully allocated (hero spans 2, + CSC/Open tasks/Open risks/IAP = 6). `DomainHealthRow` has exactly 3 fixed cards (Data Protection / Cybersecurity / Risk). Neither has a natural open slot for a 4th metric without a layout decision that's outside this spec's scope. Phase 1 therefore limits dashboard integration to the low-risk, additive touchpoints (banner text, nav badge, global search, All-Tasks filter/badge) and explicitly defers KPI-card / Domain-Health-card placement to Phase 2 (§10.3).

---

## 4. Data Model

### 4.1 `types/incident.ts` (new file)

```ts
import type { Task } from './dto';
import type { AuditLog } from './base';

export const incidentStatuses = [
  'pending',
  'start',
  'declared',
  'stable',
  'active',
  'resolved',
  'completed',
] as const;
export type IncidentStatus = (typeof incidentStatuses)[number];

export const OPEN_INCIDENT_STATUSES: IncidentStatus[] = [
  'pending',
  'start',
  'declared',
  'stable',
  'active',
];
export const CLOSED_INCIDENT_STATUSES: IncidentStatus[] = [
  'resolved',
  'completed',
];

export const incidentClassifications = [
  'general',
  'confidentiality',
  'integrity',
  'availability',
  'access_control',
  'vulnerabilities',
  'technical_failure',
  'theft_or_loss',
] as const;
export type IncidentClassification = (typeof incidentClassifications)[number];

export const incidentAttackTypes = [
  'denial_of_service',
  'unauthorised_access',
  'malware',
  'abuse',
  'others',
] as const;
export type IncidentAttackType = (typeof incidentAttackTypes)[number];

export const incidentSeverities = ['low', 'medium', 'high', 'critical'] as const;
export type IncidentSeverity = (typeof incidentSeverities)[number];

/** Flat object — see design decision §3.3. Stored at Task.properties.incident_report */
export interface IncidentReportInterface {
  Status: IncidentStatus;
  Classification: IncidentClassification;
  AttackType: IncidentAttackType;
  Severity: IncidentSeverity;
  /** Free-text asset identifier — new field, not present in OSCRAT. Optional. */
  AssetName?: string;
  /** userId of the reporting team member */
  ReporterId: string;
  /** ISO date string */
  DateOfDetection: string;
  /** ISO date string, optional, must be >= DateOfDetection */
  HandlingDate?: string;
  Description: string;
  Scope: string;
  RootCause?: string;
  CorrectiveActions?: string;
  PreventiveActions?: string;
  SuspectedUnlawfulAct: boolean;
  /** required when SuspectedUnlawfulAct === true */
  UnlawfulActDescription?: string;
  CrossBorderImpact: boolean;
  /** required when CrossBorderImpact === true */
  CrossBorderImpactDetails?: string;
}

export type TaskIncidentProperties = {
  incident_report?: IncidentReportInterface;
  incident_audit_logs?: AuditLog[];
};

export type TaskWithIncidentReport = Task & {
  properties: {
    incident_report: IncidentReportInterface;
  };
};
```

### 4.2 `types/base.ts` — add to the `TaskProperties` intersection

```diff
 export type TaskProperties = TaskTiaProperties &
   TaskCscProperties &
   TaskRpaProperties &
   TaskPiaProperties &
   TaskRmProperties &
+  TaskIncidentProperties &
   TaskAuditLogProperties;
```

### 4.3 `lib/tasks.ts` — register the module key

```diff
 export const taskModuleKeys = [
   'rpa_procedure',
   'tia_procedure',
   'pia_risk',
   'rm_risk',
   'csc_controls',
+  'incident_report',
 ] as const;
```

`isTaskModuleKey` and `hasTaskModule` need no other changes — both are generic over `taskModuleKeys` (the `csc_controls` branch in `hasTaskModule` is a special case for CSC's multi-key structure and doesn't apply to `incident_report`, which follows the plain-key branch used by `rpa_procedure`/`tia_procedure`/`pia_risk`/`rm_risk`).

---

## 5. Business Logic — `models/incident.ts` (new file)

Mirrors `models/rm.ts` exactly: `saveIncidentReport`, `deleteIncidentReport`, shared `addAuditLogs`, `getDiff`.

```ts
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type {
  IncidentReportInterface,
  TaskProperties,
  AuditLog,
  Diff,
} from 'types';
import { incidentAuditFields } from '@/lib/incident';

export const saveIncidentReport = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevReport: IncidentReportInterface | null;
  nextReport: IncidentReportInterface;
}) => {
  const { user, taskNumber, slug, prevReport, nextReport } = params;
  const task = await prisma.task.findFirst({
    where: { taskNumber, team: { slug } },
  });
  if (!task) return null;

  const taskId = task.id;
  const taskProperties = task.properties as TaskProperties;
  taskProperties.incident_report = nextReport;

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { properties: { ...taskProperties } },
  });

  await addAuditLogs({ taskId, taskProperties, user, prevReport, nextReport });

  return updatedTask;
};

export const deleteIncidentReport = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevReport: IncidentReportInterface | null;
}) => {
  const { taskNumber, slug, user, prevReport } = params;
  const task = await prisma.task.findFirst({
    where: { taskNumber, team: { slug } },
  });
  if (!task) return null;

  const taskId = task.id;
  const taskProperties = task.properties as TaskProperties;
  delete taskProperties.incident_report;

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { properties: { ...taskProperties } },
  });

  await addAuditLogs({
    taskId,
    taskProperties,
    user,
    prevReport,
    nextReport: null,
  });

  return updatedTask;
};

const addAuditLogs = async (params: {
  taskId: number;
  taskProperties: TaskProperties;
  user: Session['user'];
  prevReport: IncidentReportInterface | null;
  nextReport: IncidentReportInterface | null;
}) => {
  const { taskId, taskProperties, user, prevReport, nextReport } = params;
  const newAuditItems: AuditLog[] = [];

  if (!prevReport && nextReport) {
    newAuditItems.push(generateChangeLog(user, 'created', null));
  } else if (!nextReport) {
    newAuditItems.push(generateChangeLog(user, 'deleted', null));
  } else if (prevReport) {
    getDiff(prevReport, nextReport).forEach((changeLog) =>
      newAuditItems.push(generateChangeLog(user, 'updated', changeLog))
    );
  }

  taskProperties.incident_audit_logs = [
    ...(taskProperties.incident_audit_logs ?? []),
    ...newAuditItems,
  ];

  await prisma.task.update({
    where: { id: taskId },
    data: { properties: { ...taskProperties } },
  });
};

const generateChangeLog = (
  user: Session['user'],
  event: string,
  diffLog: Diff
): AuditLog => ({ actor: user, date: Date.now(), event, diff: diffLog });

export const getDiff = (
  prev: IncidentReportInterface,
  next: IncidentReportInterface
): Diff[] => {
  const diff: Diff[] = [];
  for (const field of incidentAuditFields) {
    if (JSON.stringify(prev[field]) !== JSON.stringify(next[field])) {
      diff.push({
        field,
        prevValue: prev[field] as string | string[] | undefined,
        nextValue: next[field] as string | string[],
      });
    }
  }
  return diff;
};
```

`lib/incident/index.ts` exports `incidentAuditFields` (the list of `IncidentReportInterface` keys tracked for diffs — same role as RM's `fields` export from `lib/rm/index.ts`) and `steps` (the 4 dialog step keys, §8.2).

---

## 6. API Route — `pages/api/teams/[slug]/tasks/[taskNumber]/incident.ts` (new file)

Mirrors `.../rm.ts` exactly: `POST` upserts, `DELETE` removes.

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { deleteIncidentReport, saveIncidentReport } from 'models/incident';
import { trackServerEvent } from '@/lib/matomo/server';
import { MatomoEvent } from '@/lib/matomo/events';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      return handlePOST(req, res);
    case 'DELETE':
      return handleDELETE(req, res);
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).json({
        data: null,
        error: { message: `Method ${req.method} Not Allowed` },
      });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const taskNumber = Number(req.query.taskNumber);
  if (isNaN(taskNumber)) {
    return res.status(400).json({ error: { message: 'Invalid task number' } });
  }

  const { prevReport, nextReport } = req.body;

  const task = await saveIncidentReport({
    user: teamMember.user,
    taskNumber,
    slug: req.query.slug as string,
    prevReport,
    nextReport,
  });

  if (!task) {
    return res.status(400).json({ error: { message: 'Something went wrong!' } });
  }

  trackServerEvent(
    prevReport ? MatomoEvent.IncidentUpdated : MatomoEvent.IncidentCreated,
    nextReport.Severity
  );

  return res.status(200).json({ data: { task }, error: null });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const taskNumber = Number(req.query.taskNumber);
  if (isNaN(taskNumber)) {
    return res.status(400).json({ error: { message: 'Invalid task number' } });
  }

  const task = await deleteIncidentReport({
    user: teamMember.user,
    taskNumber,
    slug: req.query.slug as string,
    prevReport: req.body?.prevReport ?? null,
  });

  if (!task) {
    return res.status(400).json({ error: { message: 'Something went wrong!' } });
  }

  return res.status(200).json({ data: {}, error: null });
};
```

> `MatomoEvent.IncidentCreated` / `IncidentUpdated` are new enum members to add to `lib/matomo/events.ts`, following the existing `RiskCreated`/`RiskScored` precedent.

---

## 7. Validation Rules

RM validates inline via React Hook Form `rules={{ required: ... }}` per field (no schema library despite `yup`/`zod` being available in `package.json`). Incident Report has more conditional logic (unlawful-act / cross-border details required only when their checkbox is checked; handling date must not precede detection date) — still expressible with inline RHF rules using `validate` functions, keeping parity with RM's approach rather than introducing a schema library precedent this codebase doesn't otherwise use for module dialogs.

| Field                      | Rule                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `Status`                    | required, one of `incidentStatuses`                                                  |
| `Classification`            | required, one of `incidentClassifications`                                           |
| `AttackType`                | required, one of `incidentAttackTypes`                                               |
| `Severity`                  | required, one of `incidentSeverities`                                                |
| `AssetName`                 | optional, max 200 chars                                                              |
| `ReporterId`                | required, must be a valid team member id                                             |
| `DateOfDetection`           | required, not in the future                                                          |
| `HandlingDate`               | optional; if set, must be `>= DateOfDetection`                                        |
| `Description`               | required, max 2000 chars                                                             |
| `Scope`                     | required, max 2000 chars                                                             |
| `RootCause`                 | optional, max 2000 chars                                                             |
| `CorrectiveActions`         | optional, max 2000 chars                                                             |
| `PreventiveActions`         | optional, max 2000 chars                                                             |
| `SuspectedUnlawfulAct`      | boolean, default `false`                                                             |
| `UnlawfulActDescription`    | required **iff** `SuspectedUnlawfulAct === true`                                     |
| `CrossBorderImpact`         | boolean, default `false`                                                             |
| `CrossBorderImpactDetails`  | required **iff** `CrossBorderImpact === true`                                        |

---

## 8. UI Components

### 8.1 File tree (new)

```
components/interfaces/incident-management/
├── Dashboard.tsx                       # orchestrator (mirrors risk-management/Dashboard.tsx)
├── IncidentsTable.tsx                  # list table
├── TaskPanel.tsx                       # read-only view on task detail page
├── DeleteIncidentReport.tsx            # delete confirmation dialog
├── IncidentSeverityChart.tsx           # optional pie/donut — see §10.3
├── incident-form/
│   ├── IncidentReportDialog.tsx        # multi-step create/edit dialog
│   ├── types.ts                        # per-step form value types
│   ├── steps/
│   │   ├── IncidentDetailsStep.tsx     # Status, Classification, AttackType, Severity, AssetName, Reporter, DateOfDetection, HandlingDate
│   │   ├── DescriptionScopeStep.tsx    # Description, Scope, RootCause
│   │   ├── ResponseRemediationStep.tsx # CorrectiveActions, PreventiveActions
│   │   └── LegalCrossBorderStep.tsx    # SuspectedUnlawfulAct(+desc), CrossBorderImpact(+details)
│   └── hooks/
│       ├── useIncidentDetailsStepForm.ts
│       ├── useDescriptionScopeStepForm.ts
│       ├── useResponseRemediationStepForm.ts
│       └── useLegalCrossBorderStepForm.ts
└── audit-logs/
    ├── AuditLogs.tsx                   # wraps shared AuditTimeline
    └── auditLogHelper.tsx              # field-value → display label

components/shared/
├── ModuleBadge.tsx                     # MODIFIED — add incident_report mapping
├── IncidentStatusBadge.tsx             # new
└── IncidentSeverityBadge.tsx           # new

lib/incident/
├── index.ts                            # steps[], incidentAuditFields[]
├── helpers.ts                          # status open/closed sets, severity ordering
└── export.ts                           # optional — CSV/XLSX export, Phase 2

models/incident.ts                      # new — see §5
types/incident.ts                       # new — see §4.1
pages/api/teams/[slug]/tasks/[taskNumber]/incident.ts   # new — see §6
pages/teams/[slug]/incident-management.tsx              # new — module page
locales/en/incident.json                                # new — see §12
```

### 8.2 `IncidentReportDialog.tsx` — step design

Follows the sticky-footer flex dialog pattern mandated by `design.md` (`flex flex-col overflow-hidden` on `DialogContent`, `flex-1 min-h-0 overflow-y-auto` on the body, `DialogFooter` always visible) and the Stepper component (compact bar on mobile, dot stepper on `sm+`), exactly like `RmRiskDialog.tsx`.

| Step | Shown when                       | i18n step key                | Fields                                                                 |
| ---- | --------------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| 0    | `!selectedTask` (creating fresh)  | *(no stepper label — task picker)* | `TaskPicker`, filtered to `tasks.filter(t => !t.properties?.incident_report)` |
| 1    | always                             | `incidentDetails`               | Status, Classification, AttackType, Severity, AssetName, ReporterId, DateOfDetection, HandlingDate |
| 2    | always                             | `descriptionAndScope`           | Description, Scope, RootCause                                          |
| 3    | always                             | `responseAndRemediation`        | CorrectiveActions, PreventiveActions                                    |
| 4    | always                             | `legalAndCrossBorder`           | SuspectedUnlawfulAct (+ conditional UnlawfulActDescription), CrossBorderImpact (+ conditional CrossBorderImpactDetails) |

Component skeleton (mirrors `RmRiskDialog.tsx` state machine — task pick → sequential steps → submit on last step):

```tsx
const steps = ['incidentDetails', 'descriptionAndScope', 'responseAndRemediation', 'legalAndCrossBorder'];

export default function IncidentReportDialog({
  prevReport, selectedTask, tasks, open, onOpenChange, completeCallback, mutateTasks,
}: IncidentReportDialogProps) {
  const [currentStep, setCurrentStep] = React.useState(selectedTask ? 1 : 0);
  const [reportData, setReportData] = React.useState<Partial<IncidentReportInterface>>(prevReport || {});
  const [task, setTask] = React.useState<Task | null>(selectedTask || null);

  // step 0: TaskPicker -> setTask, currentStep = 1
  // step 1-4: each step's RHF form merges its slice into reportData
  // on step 4 submit: POST /api/teams/${slug}/tasks/${task.taskNumber}/incident
  //   body: { prevReport: prevReport ?? null, nextReport: reportData }
}
```

Fields use existing shadcn primitives already used by RM's steps: `Select` (Status/Classification/AttackType/Severity/ReporterId — reporter options from `useTeamMembers(slug)`, exactly like RM's `AssetOwner`), `Input type="date"` (DateOfDetection/HandlingDate), `Input type="text"` (AssetName), `Textarea` (Description/Scope/RootCause/CorrectiveActions/PreventiveActions/UnlawfulActDescription/CrossBorderImpactDetails), `Checkbox` (SuspectedUnlawfulAct/CrossBorderImpact) gating the conditional `Textarea` per `design.md`'s fieldset/legend pattern for grouped inputs.

### 8.3 `IncidentsTable.tsx` — columns

| Column         | Source                                              | Notes                                                            |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| ID              | `INC-${task.taskNumber}`                            | deep-links to `/teams/${slug}/tasks/${task.taskNumber}`         |
| Incident Name   | `task.title`                                        | `truncate`, `title` attr for full text                          |
| Status          | `IncidentStatusBadge`                               | static color lookup, not dynamic Tailwind classes (design.md rule) |
| Classification  | `t(`incident:classification.${value}`)`             | `truncate max-w-[150px]`                                          |
| Attack Type     | `t(`incident:attack-type.${value}`)`                | `truncate max-w-[150px]`                                          |
| Severity        | `IncidentSeverityBadge`                             |                                                                    |
| Asset Name      | `AssetName ?? '—'`                                  |                                                                    |
| Reporter        | `membersById.get(ReporterId)` (Map, not bracket access — per design.md RM rule) | falls back to `t('not-found')`                    |
| Date of Detection | formatted short date                              |                                                                    |
| Actions          | icon-only Edit (`Pencil`) + Delete (`Trash2`)        | `aria-label` per design.md's icon-button rule                    |

Wrapped in the standard Direction B card + `overflow-x-auto` shell; empty state via `ModuleEmptyState`; paginated via `usePagination`.

### 8.4 `TaskPanel.tsx` — read-only view

Mirrors `RmTaskPanel`: full ARIA tab pattern with tabs for the same four groupings as the dialog steps (Incident Details / Description & Scope / Response & Remediation / Legal & Cross-Border), each rendering `Field` (`components/shared/atlaskit`) rows. Reporter resolved via `MemberName` + `membersById` Map, same as RM's `AssetOwner`. Empty state: `t('incident-has-not-been-created-for-this-task')`.

### 8.5 `Dashboard.tsx` — module page orchestrator

`pages/teams/[slug]/incident-management.tsx` renders `IncidentManagementDashboard`: toolbar (heading + count badge + "Create Incident Report" button, `flex-wrap` per design.md), `IncidentsTable`, and — optionally (§10.3) — `IncidentSeverityChart` (donut, `role="img"` + `aria-label` + `w-full h-full` wrapper per the mandatory chart accessibility rule).

### 8.6 Badges

`components/shared/ModuleBadge.tsx`:

```diff
 const colorMap: Record<string, string> = {
   rpa_procedure: 'bg-red-600 text-red-100',
   tia_procedure: 'bg-blue-600 text-blue-100',
   pia_risk: 'bg-yellow-500 text-yellow-950',
   rm_risk: 'bg-green-600 text-green-100',
   csc_controls: 'bg-slate-500 text-slate-100',
+  incident_report: 'bg-orange-600 text-orange-100',
 };
 const labelMap: Record<string, string> = {
   ...
+  incident_report: 'INC',
 };
```

New `IncidentSeverityBadge` / `IncidentStatusBadge` (static lookup tables, following the TIA "at risk" badge pattern from `design.md`):

```tsx
const SEVERITY_CLASSES: Record<IncidentSeverity, string> = {
  low: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  medium: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400',
  high: 'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-400',
  critical: 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400',
};

const STATUS_CLASSES: Record<IncidentStatus, string> = {
  pending: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  start: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  declared: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400',
  stable: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  active: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400',
  resolved: 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400',
  completed: 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400',
};
```

Both rendered as `rounded-full px-2 py-0.5 text-[11px] font-semibold`, matching the TIA risk-badge example in `design.md`.

### 8.7 Audit logs

`AuditLogs.tsx` wraps the **shared, already-generic** `components/interfaces/Task/AuditTimeline.tsx` exactly like `RmAuditLogs` does — reading `task.properties.incident_audit_logs`, resolving actor/reporter names via `useTeamMembersMap`, and supplying an `auditLogHelper` for field-specific value formatting (e.g. rendering `ReporterId` as a member name via the Map, translating `Status`/`Severity`/etc. enum values instead of showing raw strings).

---

## 9. Navigation & Routing

| File                                                          | Change                                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pages/teams/[slug]/incident-management.tsx`                    | **New.** Module page, same shape as `risk-management.tsx`.                                                |
| `components/shared/shell/TeamNavigation.tsx`                    | Add nav entry (icon + label `t('incident-management')`) with a badge counting open incidents (status in `OPEN_INCIDENT_STATUSES`), same pattern as the existing `rm` entry (lines ~129-137). |
| `pages/teams/[slug]/tasks/[taskNumber]/index.tsx`               | Add `IncidentReportDialog` trigger + `TaskPanel` render block, following the existing TIA/PIA/RM blocks (reads `(task.properties as TaskProperties)?.incident_report`). |
| `components/interfaces/Task/TaskFilters.tsx`                    | Add `incident_report: 'INC'` to the All-Tasks module filter map (line ~9 area).                            |
| `components/shared/shell/GlobalSearch.tsx`                      | Add an `incident` search key + snippet builder (mirrors the RM block at lines ~127-131 and ~227-231): match on `Description`, `Scope`, `AssetName`. |

---

## 10. Dashboard & Search Integration

### 10.1 Required (Phase 1)

- **`ActionRequiredBanner.tsx`**: add `computeOpenIncidents(tasks)` (mirrors `computeOpenRisks`, counting tasks where `properties?.incident_report` exists and `Status` is in `OPEN_INCIDENT_STATUSES`); surface as an additional banner clause, escalating banner severity if any `Severity === 'critical'` incident is open.
- **`lib/tasks/exportTasks.ts`**: add incident columns to the All-Tasks CSV export (ID, Status, Severity, Classification, AttackType, AssetName, Reporter, DateOfDetection) — same pattern as the existing `rm_risk` columns.
- **`lib/tasks.ts`**: `taskModuleKeys` update (§4.3) — this alone makes `hasTaskModule`/`getTaskModules` incident-aware everywhere they're already used (All Tasks badges, dashboard matrix, MCP task tools).

### 10.2 Not required

- `scripts/migrations/taskPropertiesTransforms.ts` — this script exists to fix **legacy** malformed data. There is no legacy `incident_report` data; nothing to migrate.

### 10.3 Optional / Phase 2 (explicit design decision required before building)

- **`KpiRow.tsx`**: adding a 7th KPI card requires either widening the grid past `lg:grid-cols-6` or removing/merging an existing card — a call for product/design, not this spec.
- **`DomainHealthRow.tsx`**: incidents don't map cleanly onto one of the existing three domain cards (Data Protection / Cybersecurity / Risk). Candidate: fold a critical-incident count into the Cybersecurity card's sub-line (e.g. `"2 gaps · 1 open incident"`), analogous to how the Cybersecurity card already shows CSC gap count — but this changes an existing card's semantics and should be a deliberate follow-up, not bundled into the initial module ship.
- **`IncidentSeverityChart.tsx`** — nice-to-have parity with RM's `DashboardPieChart`; can ship after the table/dialog/panel are validated.

---

## 11. Export

Phase 1 ships CSV export via the existing All-Tasks exporter (§10.1). A dedicated `lib/incident/export.ts` (XLSX/PDF, mirroring `lib/rm/export.ts`) is a Phase 2 candidate — RPA is the only module with the full `XLSX, ODS, CSV, HTML, PDF` export matrix, and that was a deliberate investment for a GDPR Art. 30 register; Incident Report doesn't have the same regulatory export requirement baked in yet.

---

## 12. i18n

### 12.1 `locales/en/incident.json` (new)

```json
{
  "fields": {
    "Status": "Status",
    "Classification": "Classification",
    "AttackType": "Attack type",
    "Severity": "Severity",
    "AssetName": "Asset name",
    "ReporterId": "Reporter",
    "DateOfDetection": "Date of detection",
    "HandlingDate": "Handling date",
    "Description": "Description",
    "Scope": "Scope",
    "RootCause": "Root cause",
    "CorrectiveActions": "Corrective actions",
    "PreventiveActions": "Preventive actions",
    "SuspectedUnlawfulAct": "Suspected unlawful act",
    "UnlawfulActDescription": "Describe the suspected unlawful act",
    "CrossBorderImpact": "Cross-border impact",
    "CrossBorderImpactDetails": "Cross-border impact details"
  },
  "status": {
    "pending": "Pending",
    "start": "Started",
    "declared": "Declared",
    "stable": "Stable",
    "active": "Active",
    "resolved": "Resolved",
    "completed": "Completed"
  },
  "classification": {
    "general": "General",
    "confidentiality": "Confidentiality",
    "integrity": "Integrity",
    "availability": "Availability",
    "access_control": "Access control",
    "vulnerabilities": "Vulnerabilities",
    "technical_failure": "Technical failure",
    "theft_or_loss": "Theft or loss"
  },
  "attack-type": {
    "denial_of_service": "Denial of service",
    "unauthorised_access": "Unauthorised access",
    "malware": "Malware",
    "abuse": "Abuse",
    "others": "Others"
  },
  "severity": {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "critical": "Critical"
  },
  "steps": {
    "incidentDetails": "Incident Details",
    "descriptionAndScope": "Description & Scope",
    "responseAndRemediation": "Response & Remediation",
    "legalAndCrossBorder": "Legal & Cross-Border"
  },
  "descriptions": {
    "assetName": "Optionally identify the specific asset, system, or service affected by this incident.",
    "dateOfDetection": "When was this incident first detected? Cannot be a future date.",
    "handlingDate": "When did the team begin actively handling this incident? Must be on or after the detection date.",
    "description": "Describe what happened, in enough detail for someone unfamiliar with the incident to understand it.",
    "scope": "Describe the systems, data, or people affected by this incident.",
    "rootCause": "What was the underlying cause of this incident, once known?",
    "correctiveActions": "What actions were taken to contain and resolve this incident?",
    "preventiveActions": "What actions will prevent this type of incident from recurring?",
    "unlawfulAct": "Check this if you suspect the incident involved an unlawful act (e.g. theft, fraud, unauthorized access with criminal intent).",
    "crossBorderImpact": "Check this if the incident affects data subjects or systems in more than one jurisdiction."
  },
  "placeholders": {
    "assetName": "e.g. Production database, customer portal, employee laptop",
    "description": "Describe the incident",
    "scope": "Describe the affected scope"
  },
  "table": {
    "id": "ID",
    "name": "Incident name",
    "status": "Status",
    "classification": "Classification",
    "attack-type": "Attack type",
    "severity": "Severity",
    "asset-name": "Asset",
    "reporter": "Reporter",
    "date-of-detection": "Detected"
  },
  "empty-state": {
    "title": "No incidents reported yet",
    "description": "Track security and privacy incidents against your tasks — status, severity, root cause, and remediation."
  },
  "validation": {
    "status-required": "Please select a status",
    "classification-required": "Please select a classification",
    "attack-type-required": "Please select an attack type",
    "severity-required": "Please select a severity",
    "reporter-required": "Please select a reporter",
    "date-of-detection-required": "Please enter the date of detection",
    "date-cannot-be-future": "This date cannot be in the future",
    "handling-date-invalid": "Handling date cannot be before the date of detection",
    "description-required": "Please describe the incident",
    "scope-required": "Please describe the scope",
    "unlawful-act-description-required": "Please describe the suspected unlawful act",
    "cross-border-details-required": "Please provide cross-border impact details"
  }
}
```

### 12.2 `locales/en/common.json` additions

```json
{
  "incident-management": "Incident Management",
  "incident": "Incident",
  "incident-report": "Incident Report",
  "incident-created": "Incident report created",
  "incident-updated": "Incident report updated",
  "incident-deleted": "Incident report deleted",
  "incident-has-not-been-created-for-this-task": "No incident report has been created for this task",
  "view-incident-management": "View incident report"
}
```

### 12.3 Translation checklist (per `design.md`'s mandatory rule)

- [ ] `locales/{fr,de,es,it,ja,pt}/incident.json` created with the same key structure (translated, not just copied `en`)
- [ ] `common.json` additions (§12.2) added to all 7 locales
- [ ] All dialog step components use `useTranslation(['common', 'incident'])`
- [ ] `pages/teams/[slug]/incident-management.tsx` and `pages/teams/[slug]/tasks/[taskNumber]/index.tsx` include `'incident'` in `serverSideTranslations`

---

## 13. Accessibility & Responsive Compliance

Applying `design.md`'s mandatory checklists to this module specifically:

- [ ] `IncidentReportDialog` uses the sticky-footer flex pattern (`flex flex-col overflow-hidden` / `flex-1 min-h-0 overflow-y-auto`) — footer visible without scrolling at 375px and 1280px
- [ ] Step 0 uses `TaskPicker` (Combobox), never a plain `<Select>`
- [ ] `SuspectedUnlawfulAct` / `CrossBorderImpact` checkbox groups use `<fieldset>`/`<legend>`, not bare `<div>`/`<Label>`
- [ ] All `Select` fields (Status/Classification/AttackType/Severity/Reporter) have paired `<Label htmlFor>`
- [ ] Validation errors wired with `aria-invalid` + `aria-describedby` + `role="alert"` per the form-validation pattern
- [ ] `IncidentsTable` wrapped in `overflow-x-auto`; toolbar uses `flex-wrap`
- [ ] Edit/Delete icon buttons have `aria-label` including the incident/task name for context
- [ ] `IncidentSeverityChart` (if built) wrapped in `role="img"` + descriptive `aria-label` + `className="w-full h-full"`
- [ ] `IncidentStatusBadge`/`IncidentSeverityBadge` text meets 4.5:1 contrast (use the same palette tested elsewhere in `design.md`, not new arbitrary colors)
- [ ] Verified at 375px / 768px / 1280px before merge

---

## 14. MCP Server Tools

`src/mcp-server/src/tools/incidents.ts` (new), registered alongside `registerRiskTools` in the server bootstrap — mirrors `risk.ts` 1:1 (`unicis_get_incident`, `unicis_set_incident`, `unicis_delete_incident`), each taking `{ slug, taskNumber }` plus payload, reading/writing `task.properties.incident_report` via the same `/api/teams/:slug/tasks/:taskNumber/incident` route. `src/mcp-server/src/services/api.ts` gains an `IncidentReport` type export (mirrors the existing `RmRisk` export).

---

## 15. Testing Plan

| Test                                                                 | Mirrors                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------ |
| `__tests__/lib/tasks/status-keys.spec.ts` — add `incident_report` to the module-key assertions | existing `rm_risk` coverage                          |
| `pages/api/teams/[slug]/tasks/[taskNumber]/incident.spec.ts` — POST create/update, DELETE, 404/400 cases, 405 for GET | `pages/api/teams/tasks/taskNumber.spec.ts` pattern    |
| Playwright: incident create → appears in table → task detail panel shows it → delete removes it | `tasks/task-management.spec.ts` pattern              |
| Manual: non-English locale check — no raw i18n keys rendered for status/severity/classification/attack-type labels | design.md's "Test Requirements Before Production" #4 |
| Manual: dialog footer visible without scrolling at 375px and 1280px, at every step | design.md's "Test Requirements Before Production" #5 |

---

## 16. File Change Checklist

| File                                                                                   | Action | Notes                                    |
| ----------------------------------------------------------------------------------------- | ------ | ------------------------------------------- |
| `types/incident.ts`                                                                       | Add    | §4.1                                       |
| `types/base.ts`                                                                            | Modify | add `TaskIncidentProperties` to intersection |
| `lib/tasks.ts`                                                                             | Modify | `taskModuleKeys` +1                        |
| `lib/incident/index.ts`, `helpers.ts`                                                      | Add    | §5, §8.6                                    |
| `models/incident.ts`                                                                       | Add    | §5                                          |
| `pages/api/teams/[slug]/tasks/[taskNumber]/incident.ts`                                    | Add    | §6                                          |
| `lib/matomo/events.ts`                                                                     | Modify | `IncidentCreated`/`IncidentUpdated`         |
| `components/interfaces/incident-management/**`                                            | Add    | §8.1                                        |
| `components/shared/ModuleBadge.tsx`                                                        | Modify | §8.6                                        |
| `components/shared/IncidentStatusBadge.tsx`, `IncidentSeverityBadge.tsx`                   | Add    | §8.6                                        |
| `components/shared/shell/TeamNavigation.tsx`                                               | Modify | §9                                          |
| `components/shared/shell/GlobalSearch.tsx`                                                 | Modify | §9                                          |
| `components/interfaces/Task/TaskFilters.tsx`                                               | Modify | §9                                          |
| `components/interfaces/TeamDashboard/ActionRequiredBanner.tsx`                             | Modify | §10.1                                       |
| `lib/tasks/exportTasks.ts`                                                                  | Modify | §10.1                                       |
| `pages/teams/[slug]/incident-management.tsx`                                               | Add    | §9                                          |
| `pages/teams/[slug]/tasks/[taskNumber]/index.tsx`                                          | Modify | §9                                          |
| `locales/en/incident.json` (+ 6 other locales)                                             | Add    | §12                                          |
| `locales/en/common.json` (+ 6 other locales)                                               | Modify | §12.2                                        |
| `src/mcp-server/src/tools/incidents.ts`                                                     | Add    | §14                                          |
| `src/mcp-server/src/services/api.ts`                                                        | Modify | §14                                          |
| `__tests__/lib/tasks/status-keys.spec.ts`                                                   | Modify | §15                                          |
| `pages/api/teams/[slug]/tasks/[taskNumber]/incident.spec.ts`                                | Add    | §15                                          |
| `prisma/schema.prisma`                                                                       | **No change** | §3.1                                  |

---

## 17. Rollout Plan

**Phase 1 (MVP, this spec's primary deliverable):** §4–§9, §10.1, §12–§15. Feature is fully usable: create/edit/delete incident reports on any Task, see them in a dedicated module page and the All-Tasks list, filter/search them, MCP access.

**Phase 2 (follow-up, requires separate sign-off):**
- Dashboard KPI/Domain-Health placement (§10.3) — needs a layout decision
- `IncidentSeverityChart` and any additional charts
- Bulk import (mirrors `pages/api/teams/[slug]/rm/import.ts`)
- Dedicated XLSX/PDF export (`lib/incident/export.ts`)
- Non-English translations for `incident.json` beyond English

No feature flag is needed — this is purely additive (new optional Task property key), so it can ship directly without affecting existing tasks or modules.

---

## 18. Appendix — OSCRAT → Unicis Field Mapping

| OSCRAT (`OscratIncidentDetail`) | Unicis (`IncidentReportInterface`) | Disposition                                                    |
| ---------------------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| `id` (uuid)                        | —                                       | replaced by `Task.taskNumber` (§3.2)                              |
| `name`                             | —                                       | replaced by `Task.title` (§3.2)                                   |
| `status`                           | `Status`                               | kept, lowercased (§3.5)                                            |
| `classification`                   | `Classification`                       | kept, lowercased                                                   |
| `attackType`                       | `AttackType`                           | kept, lowercased                                                   |
| `assetDetails`                     | *(dropped, replaced)*                  | replaced by the new, simpler `AssetName` short-text field per user request |
| —                                   | `AssetName`                            | **new field**, user-requested, optional short text                 |
| `severity`                         | `Severity`                             | kept, lowercased                                                   |
| `dateOfDetection`                  | `DateOfDetection`                      | kept                                                                |
| `handlingDate`                     | `HandlingDate`                         | kept                                                                |
| `description`                      | `Description`                          | kept                                                                |
| `correctiveActions`                | `CorrectiveActions`                    | kept                                                                |
| `rootCause`                        | `RootCause`                            | kept                                                                |
| `scope`                            | `Scope`                                | kept                                                                |
| `preventiveActions`                | `PreventiveActions`                    | kept                                                                |
| `suspectedUnlawfulAct`             | `SuspectedUnlawfulAct`                 | kept                                                                |
| `unlawfulActDescription`           | `UnlawfulActDescription`               | kept                                                                |
| `crossBorderImpact`                | `CrossBorderImpact`                    | kept                                                                |
| `crossBorderImpactDetails`         | `CrossBorderImpactDetails`             | kept                                                                |
| `reporter` (User relation)         | `ReporterId` (userId string)           | simplified to an id, resolved via `useTeamMembersMap` like RM's `AssetOwner` |
| `createdByUser` / `updatedByUser`  | —                                       | redundant with the existing generic audit log's `actor` field       |
| `attachments`                      | —                                       | reuses Task-level attachments (§3.6), no incident-scoped list       |
| `createdAt` / `updatedAt` / `createdBy` / `updatedBy` | —                | redundant with Task's own timestamps + audit log                    |
