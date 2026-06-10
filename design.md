# Unicis Platform — Architecture & Design Document

## Overview

Unicis Platform is an open-core, enterprise-ready **trust management and compliance platform** designed for startups and SMEs. It provides tools for managing compliance frameworks, security controls, privacy assessments, and risk management across multiple compliance standards (GDPR, ISO 27001, NIST, SOC 2, PCI DSS, etc.).

**Current Version:** 0.2.3
**Build Tool:** Next.js 16
**Database:** PostgreSQL
**ORM:** Prisma
**Authentication:** NextAuth.js
**License:** Apache 2.0

---

## UX/UI Design System — Direction B

This section documents the **Direction B** design language. All new and refactored components **must** follow these tokens, patterns, and responsiveness rules. Non-compliance is a blocking review issue.

### Design Philosophy

Direction B is a calm, professional visual language built for compliance and security professionals (CISO, DPO, Engineers, DevSecOps, HR, C-level). The core principles are:

- **Information density over decoration** — data is primary, chrome is secondary
- **Consistent spatial rhythm** — uniform padding, border radius, and type scale across every module
- **Dark mode as first-class** — every token has an explicit `dark:` counterpart
- **Legibility at small scale** — table headers at `text-[11px]` uppercase; body text at `text-[12px]`–`text-[13px]`
- **Mobile-first, always** — every new component must work on a 375 px viewport before it is considered complete
- **Accessibility as a requirement** — WCAG 2.1 AA compliance is mandatory, not optional

---

## Accessibility — WCAG 2.1 AA (Mandatory)

> All components must meet WCAG 2.1 AA. Accessibility failures are treated as bugs, not enhancements.

### Implemented Standards

#### Language declaration
`pages/_document.tsx` sets `<Html lang={locale ?? 'en'}>` using the locale from `getServerSideProps`. This satisfies WCAG 3.1.1 Language of Page.

#### Icon-only buttons
Every `<Button size="icon">` **must** have an `aria-label`. The icon SVG must have `aria-hidden="true"`. Use translated strings:

```tsx
<Button variant="outline" size="icon" aria-label={t('edit-task')}>
  <Pencil className="h-4 w-4" aria-hidden="true" />
</Button>
<Button variant="destructive" size="icon" aria-label={t('delete')}>
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</Button>
```

For buttons that operate on a named item (courses, webhooks), include the item name for context:

```tsx
aria-label={`${t('edit')} ${item.name}`}
```

#### Form label associations
Every `<Label>` must be paired with a matching `htmlFor`/`id`:

```tsx
<Label htmlFor="field-id">{t('label')}</Label>
<Input id="field-id" ... />
```

For grouped checkboxes (e.g. event type selectors), use `<fieldset>` / `<legend>` — never a plain `<div>` / `<Label>`:

```tsx
<fieldset>
  <legend className="text-sm font-medium ...">
    {t('events-to-send')}
  </legend>
  <EventTypes ... />
</fieldset>
```

#### Form validation errors
When Formik (or any form library) renders an error, link it to the input with `aria-invalid` and `aria-describedby`:

```tsx
<Input
  id="name"
  aria-invalid={!!formik.errors.name}
  aria-describedby={formik.errors.name ? 'name-error' : undefined}
/>
{formik.errors.name && (
  <p id="name-error" role="alert" className="text-xs text-destructive mt-1">
    {formik.errors.name}
  </p>
)}
```

#### Tab panels
Dashboard and module tab bars must use full ARIA tab pattern:

```tsx
<div role="tablist" aria-label={t('tab-group-label')}>
  <button
    role="tab"
    aria-selected={activeTab === 0}
    aria-controls="tabpanel-0"
    id="tab-0"
  >
    Tab Label
  </button>
</div>
<div
  id="tabpanel-0"
  role="tabpanel"
  aria-labelledby="tab-0"
  hidden={activeTab !== 0}
>
  ...
</div>
```

#### Charts
Every chart must be wrapped in a container with `role="img"` and a meaningful `aria-label`. The label must describe the chart content, not just its type. Always include `className="w-full h-full"` on the wrapper to preserve responsive sizing:

```tsx
<div
  role="img"
  aria-label={t('chart.risk-matrix-aria-label', {
    defaultValue: 'Risk matrix showing distribution of risks by likelihood and impact level'
  })}
  className="w-full h-full"
>
  <Bubble ... />
</div>
```

Applied to: `DashboardMatrixChart`, `DashboardPieChart`, `PieChart` (CSC), `RadarChart` (CSC), `TasksPieChart`, `RiskMatrixDashboardChart` (PIA).

> **Critical**: Do not add a wrapper `<div>` to charts without `className="w-full h-full"`. Chart.js uses responsive sizing from the parent container — a zero-height wrapper collapses the chart.

#### Mobile sidebar (Drawer)
The mobile drawer (`components/shared/shell/Drawer.tsx`) implements a full accessible dialog pattern:

```tsx
// Backdrop — clicks dismiss the drawer
<div
  className="fixed inset-0 bg-gray-600/80"
  aria-hidden="true"
  onClick={() => setSidebarOpen(false)}
/>

// Panel — ARIA dialog
<div
  ref={drawerPanelRef}
  role="dialog"
  aria-modal="true"
  aria-label={t('navigation')}
  onKeyDown={handleTabKey}  // focus trap
>
```

`useEffect` moves focus to the close button on open. `useEffect` listens for `Escape` to close. `onKeyDown` cycles Tab/Shift+Tab within the panel.

#### External links
External links (navigation items with `target="_blank"`) must announce this to screen reader users via a visually hidden span:

```tsx
{newTab && (
  <>
    <ArrowTopRightOnSquareIcon aria-hidden="true" />
    <span className="sr-only">(opens in new tab)</span>
  </>
)}
```

#### Interactive cards (domain health, KPI)
Clickable card components (`<button>`) that switch context must carry an explicit `aria-label` describing the action, plus `aria-pressed` to communicate current state:

```tsx
<button
  aria-label={t('domain-health.switch-tab-cybersecurity', { defaultValue: 'Switch to Cybersecurity tab' })}
  aria-pressed={active}
  onClick={onClick}
>
```

#### Color contrast
Use `text-slate-500 dark:text-slate-400` for **all content text** (labels, sub-lines, data values). `text-slate-400` alone (#94a3b8) fails the 4.5:1 minimum on white backgrounds and must not be used for text that carries meaning.

| Token | Ratio on white | Use |
|---|---|---|
| `text-slate-900` | ~19:1 | Primary body text |
| `text-slate-700` | ~8:1 | Secondary body text |
| `text-slate-500` | ~4.6:1 | Labels, sub-text, meta ✅ |
| `text-slate-400` | ~2.85:1 | Decorative/placeholder only ❌ for content |

#### Minimum text size
Do not use `text-[10px]` for text that conveys information. Minimum is `text-[11px]`. The 10px size is reserved for badge numerals inside fixed-size pills only.

#### Notification bell
`NotificationBell` uses a dynamic `aria-label` that includes the unread count:

```tsx
aria-label={unreadCount > 0
  ? t('notifications.title-unread', { count: unreadCount })
  : t('notifications.title')}
```

The numeric badge span carries `aria-hidden="true"` since the count is already in the button label.

---

## Responsive Design — MANDATORY

> **Responsiveness is not optional.** Every component, page, and modal must be tested at 375 px (mobile), 768 px (tablet), and 1280 px (desktop) before being merged. Layouts that break, overflow, or wrap uncontrollably at any of these widths are bugs.

### Breakpoints

Tailwind CSS breakpoints used across the platform:

| Breakpoint | Token | Min-width | Typical device |
|------------|-------|-----------|----------------|
| Mobile     | *(default)* | 0 px | iPhone SE, Android compact |
| Small      | `sm:` | 640 px | Landscape phone, small tablet |
| Medium     | `md:` | 768 px | iPad portrait |
| Large      | `lg:` | 1024 px | iPad landscape, small laptop |
| Extra Large | `xl:` | 1280 px | Desktop |

**Design at mobile first, add breakpoints upward. Never design desktop-first and bolt on mobile later.**

---

### Shell & Navigation

#### AppShell
- Sidebar is **always hidden on mobile / tablet** and revealed as a drawer via `lg:hidden` hamburger
- Main content area has `lg:pl-64` offset (sidebar width) and falls to full width below `lg:`
- Content padding: `px-4 sm:px-6 lg:px-6`

#### Header
The header is a fixed-height `h-12` sticky bar. It is split into two zones:

```tsx
<div className="sticky top-0 z-40 flex h-12 shrink-0 items-center ... gap-x-3">
  {/* LEFT ZONE — flex-1 min-w-0: fills available space, title truncates */}
  <div className="flex items-center gap-x-2.5 flex-1 min-w-0">
    <button className="... lg:hidden flex-shrink-0">  {/* hamburger */}
    <span className="truncate text-[14px] font-medium ...">  {/* module title */}
  </div>

  {/* RIGHT ZONE — flex-shrink-0: always fully visible */}
  <div className="flex items-center gap-x-3 flex-shrink-0">
    <GlobalSearch />
    <NotificationBell />
    <AccountDropdown />   {/* mobile: icon only; sm+: name + chevron */}
  </div>
</div>
```

**Rules:**
- The title MUST use `truncate` — never allow it to wrap to a second line
- The right zone MUST use `flex-shrink-0` so controls are always reachable
- `AccountDropdown` shows only a `UserCircleIcon` on mobile (`< sm`), full name on `sm+`
- Module title strings are mapped per-route in `useModuleTitle()`. Long names (e.g. "Cybersecurity Management System") truncate gracefully

---

### Grids & Layouts

#### Module dashboard main layout
```tsx
<div className="flex flex-col lg:flex-row gap-3">
  <PrimaryPanel />        {/* flex-1 */}
  <SidePanel />           {/* lg:w-[280px] flex-shrink-0 */}
</div>
```

#### KPI row
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
```

#### IAP course grid
```tsx
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

#### Task detail panels
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
```

**Rule:** Never use a fixed column count without responsive fallback. Always start with `grid-cols-1` and add larger breakpoints.

---

### Module Toolbars

Every module toolbar (heading + filter controls + Create button) must use:

```tsx
<div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
  <div className="flex items-center gap-2">
    <h1 className="text-[15px] font-semibold ...">{t('module-name')}</h1>
    <span className="... rounded-full">{count}</span>
  </div>
  <div className="flex items-center gap-2 flex-wrap">
    {/* filters, create button */}
  </div>
</div>
```

**Rule:** `flex-wrap` is **mandatory** on both the outer container and the controls group. Without it, buttons overflow off-screen on narrow viewports.

Applied to: RPA, TIA, PIA, RM, IAP, All Tasks, IAP Admin.

---

### Tables

All module tables require a horizontal scroll wrapper. Narrow screens must scroll the table, not reflow it:

```tsx
{/* Card wrapper */}
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
  {/* Scroll container */}
  <div className="overflow-x-auto">
    <table className="w-full min-w-full ...">
      ...
    </table>
  </div>
</div>
```

**Rule:** `overflow-x-auto` is **mandatory** on every table wrapper. Tables must never force the page to scroll horizontally.

Applied to: All Tasks (`TaskListView`), RPA (`RpaTable`), TIA (`TiaTable`), PIA (`RisksTable`), RM (`RisksTable`), CSC (`StatusesTable`), dashboard Task Matrix.

---

### Dialogs & Modals

#### Base `DialogContent` — global defaults in `components/shadcn/ui/dialog.tsx`
```tsx
// Base class (all dialogs inherit this)
className="... w-full max-w-[calc(100vw-2rem)] sm:max-w-lg ... p-4 sm:p-6 rounded-lg overflow-x-hidden"
```

Key properties:
- `max-w-[calc(100vw-2rem)]` — leaves 1 rem margin on each side on mobile; no edge-to-edge dialogs
- `p-4 sm:p-6` — compact padding on mobile, full padding on desktop
- `rounded-lg` — always visible corners (no `sm:rounded-lg`)
- `overflow-x-hidden` — internal content (e.g. stepper) cannot break dialog bounds

#### Per-dialog overrides
Multi-step dialogs (RPA, TIA, PIA, RM) extend with:
```tsx
className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto p-4 sm:p-6"
```

#### `DialogFooter`
```tsx
<DialogFooter className="flex flex-wrap justify-end gap-2">
```
Shadcn's base `DialogFooter` stacks buttons vertically on mobile (`flex-col-reverse`) and lays them out horizontally on `sm+`. The `gap-2` replaces the legacy `space-x-2`.

**Rules:**
- Never use fixed-width dialogs without `max-w-[95vw]` or the base class
- Never pass `p-6` without the `sm:` prefix — use `p-4 sm:p-6`
- Never use `space-x-2` in a `DialogFooter` — use `gap-2`

---

### Stepper (Multi-Step Forms)

The `Stepper` component (`components/shadcn/ui/stepper.tsx`) renders a two-tier responsive layout:

#### Mobile `(< sm)` — compact progress bar
```
┌─────────────────────────────────────────┐
│ Data processing                   2 / 5 │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────┘
```
- Current step name (left) + "N / M" counter (right)
- Blue progress bar fills proportionally
- Fits in **any** dialog width, even 300 px

#### Desktop `(sm+)` — full dot stepper
```
● ──── ○ ──── ○ ──── ○ ──── ○
Data  Conf. Avail. Trans. Result
proc.  & Int.
```
- Dots + connector lines + labels below each dot
- Labels use `break-words whitespace-normal [overflow-wrap:anywhere]`

**Rule:** Never add a fixed-width stepper that forces a multi-column horizontal layout without the `hidden sm:flex` guard. The mobile tier is mandatory.

---

### CSC Section Rail

`SectionRail` (`components/interfaces/csc/SectionRail.tsx`) is a 210 px sidebar showing per-section compliance progress within the CSC controls panel.

**Rule:** It MUST be hidden on mobile/tablet and visible only on `lg+`:

```tsx
<aside className="hidden lg:flex lg:w-[210px] flex-shrink-0 border-l ... flex-col overflow-hidden">
```

On mobile the user accesses section filtering via the `SectionFilter` dropdown in the CSC toolbar instead.

---

### Filter Toolbars (CSC)

The CSC filter toolbar contains 4 controls: `SectionFilter`, `StatusFilter`, `PerPageSelector`, SoA export button.

**Rule:** Must use `flex-wrap` so controls drop to a second row on narrow screens:
```tsx
<div className="flex flex-wrap justify-end gap-1">
  <SectionFilter ... />
  <StatusFilter ... />
  <PerPageSelector ... />
  <button>SoA Export</button>
</div>
```

---

### Framework Filter Chips

Any row of filter chips (CSC framework tabs on the dashboard, CscTabs) must use `flex-wrap`:

```tsx
<div className="flex items-center gap-2 mb-3 flex-wrap">
  {frameworks.map(iso => <button key={iso}>...</button>)}
</div>
```

**Rule:** `flex-wrap` is mandatory on any chip/badge row that can contain a variable number of items.

---

### Tab Bars

```tsx
// Module tab containers
className="flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-[3px] mb-4 flex-wrap"
// Tab buttons
className="px-3 py-[6px] text-[12px] font-medium rounded-md ... whitespace-nowrap"
```

**Rule:** The container uses `flex-wrap` so tabs fall to a second row on mobile. Tab text uses `whitespace-nowrap` so individual tab labels don't break mid-word.

For settings navigation tabs (many items), use `overflow-x-auto no-scrollbar` scroll pattern instead of wrapping.

---

### Action Banner + Utility Button Rows

Any row containing a status banner alongside a utility button (e.g. dashboard top bar):

```tsx
<div className="flex flex-wrap items-center gap-3 mb-3">
  <ActionRequiredBanner ... />
  <Button className="flex-shrink-0 ml-auto" ...>Export CSV</Button>
</div>
```

**Rule:** Use `flex-wrap` so the button falls below the banner on narrow screens rather than getting pushed off-screen.

---

### Responsive Checklist for New Components

Before submitting any new component or page, verify:

- [ ] **375 px mobile** — no horizontal overflow, no text wrapping in fixed-height containers
- [ ] **768 px tablet** — two-column layouts stack correctly, no truncated buttons
- [ ] **1280 px desktop** — full layout renders as designed
- [ ] Tables have `overflow-x-auto` wrapper
- [ ] Toolbars have `flex-wrap`
- [ ] Dialogs use `max-w-[95vw]` or the base dialog class (never fixed width without mobile fallback)
- [ ] Tab rows use `flex-wrap` or `overflow-x-auto`
- [ ] No `h-*` (fixed height) on text containers that could receive translated strings of variable length
- [ ] Header title uses `truncate` (enforced globally — do not override)
- [ ] `SectionRail` or any always-on sidebar uses `hidden lg:flex` pattern
- [ ] All icon-only buttons have `aria-label`
- [ ] Chart wrappers have `role="img"` + `aria-label` + `className="w-full h-full"`
- [ ] Content text uses `text-slate-500 dark:text-slate-400` minimum (never `text-slate-400` alone for meaningful text)

---

## Core Design Tokens

### Card / Panel Container

All module surfaces (tables, charts, stat panels) use the same card shell:

```tsx
className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
```

For tables that also need `overflow-x-auto`, compose them:
```tsx
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
  <div className="overflow-x-auto">
    <table ...>
```

### Panel Header (section titles inside a card)

```tsx
className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
// Label inside:
className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide"
```

### Table Header Cells (`<th>`)

All module table header cells use a unified Direction B style:

```tsx
className="px-1.5 py-1.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
```

For tables with wider padding (e.g. All Tasks):
```tsx
className="px-4 py-2 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
```

### Table Body Rows

```tsx
// tbody divider
className="divide-y divide-slate-100 dark:divide-slate-700"
// hover state
className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
```

### Tab Bar (pill switcher)

```tsx
// Container — flex-wrap mandatory
className="flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-[3px] flex-wrap"
// Active tab
className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs"
// Inactive tab
className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent border border-transparent"
```

### Module Badge (per-module color coding)

Self-contained, no DaisyUI dependency. Used in the All Tasks table and the dashboard Task Overview matrix.

| Module | Background | Text | Key |
|--------|-----------|------|-----|
| RPA | `bg-red-600` | `text-red-100` | `rpa_procedure` |
| TIA | `bg-blue-600` | `text-blue-100` | `tia_procedure` |
| PIA | `bg-yellow-500` | `text-yellow-950` | `pia_risk` |
| RM  | `bg-green-600` | `text-green-100` | `rm_risk` |
| CSC | `bg-slate-500` | `text-slate-100` | `csc_controls` |

Base badge class:
```tsx
className="inline-block whitespace-nowrap rounded px-2 py-[2px] text-[11px] font-medium leading-tight align-middle"
```

Component: `components/shared/ModuleBadge.tsx`

### Module Page Heading with Record Count

Every module dashboard includes a heading bar above the toolbar:

```tsx
<div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
  <div className="flex items-center gap-2">
    <h1 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
      {t('module-name')}
    </h1>
    {count > 0 && (
      <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
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

### Icon-Only Action Buttons (Table Actions)

All table action columns use icon-only buttons. Text buttons ("Edit", "Delete") are not used — they waste column space and are inconsistent.

```tsx
// Standard pair: edit + delete
<div className="flex items-center gap-2">
  <Button variant="outline" size="icon" onClick={() => editHandler(task)} aria-label={t('edit-task')}>
    <Pencil className="h-4 w-4" aria-hidden="true" />
  </Button>
  <Button variant="destructive" size="icon" onClick={() => deleteHandler(task)} aria-label={t('delete')}>
    <Trash2 className="h-4 w-4" aria-hidden="true" />
  </Button>
</div>
```

Applied to: `TaskListView`, `RpaTable`, `TiaTable`, `RisksTable` (PIA + RM), `Members`, `PendingInvitations`, `CoursesTable`, `Webhooks`.

---

## Dashboard Architecture

**File:** `pages/teams/[slug]/dashboard.tsx`

### Layout (top → bottom)

1. **Top bar** — `ActionRequiredBanner` + Export CSV button (`flex flex-wrap items-center gap-3`)
2. **KPI strip** — `KpiRow` — 6-card grid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`)
3. **Task matrix + Needs Attention** — `flex flex-col lg:flex-row gap-3`
4. **Domain Health Row** — `DomainHealthRow` — 3 clickable cards above the tab switcher
5. **Tab switcher** — segmented pill control (`role="tablist"`, full ARIA)
6. **Tab panels** — Data Protection / Cybersecurity / Risk (`role="tabpanel"`, `aria-labelledby`)

### KPI Row (`KpiRow.tsx`)

Six cards: Compliance score hero (col-span-2) + CSC gaps + Open tasks + Open risks + IAP completion.

**IAP card behaviour:**
- Shows `nonCompliantCount` ("X yet to complete") as sub-text
- Variant: `amber` if 1–49% complete with non-compliant members, `red` if below 50%, `green` if 100%
- Clicking navigates to `/teams/${slug}/iap/admin`

**CSC cards** are rendered by `CscKpiCards` → `CscKpiPair` sub-components that call `useISO` + `useCscStatuses` internally (safe — hooks only called when ISO is known).

### Domain Health Row (`DomainHealthRow.tsx`)

**Location:** `components/interfaces/TeamDashboard/DomainHealthRow.tsx`

Three equal-width side-by-side cards. Each is a `<button>` that switches the active dashboard tab. Each card shows:
- Status dot (red / amber / green / slate)
- Domain name (uppercase label)
- Primary metric (e.g. "67%" / "Transfers OK" / "3 high risks")
- Sub-line with detail (e.g. "2 gaps · ISO 27001")
- `ChevronRight` arrow on hover

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ ● DATA PROTECTION│ │ ● CYBERSECURITY  │ │ ● RISK MANAGEMENT│
│ Transfers OK     │ │ 67%              │ │ 2 high risks     │
│ 🔒 4 TIA · 12 RPA│ │ 🛡 2 gaps·ISO 27k│ │ ⚠ 1 Extreme · 1 M│
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Status thresholds:**

| Domain | Healthy | Warning | Critical |
|---|---|---|---|
| Data Protection | All TIA transfers authorized | — | Any `TransferMechanism !== 'yes'` |
| Cybersecurity | Score ≥ 75% | 50–74% | < 50% |
| Risk Management | No extreme/major risks | Any major (60–79) | Any extreme (≥80) |

**ARIA:** Each card has `aria-label="Switch to [Domain] tab"` and `aria-pressed={active}`.

### Needs Attention Panel

Shows up to 5 overdue tasks. Each row is a `<button>` with `aria-label="{title}, overdue {dueDate}"` that deep-links directly to `/teams/${slug}/tasks/${task.taskNumber}` (not the task list).

### Tab panels (full ARIA)

```tsx
// tablist
<div role="tablist" aria-label={t('dashboard.tab.aria-label')}>
  <button
    id="dashboard-tab-0"
    role="tab"
    aria-selected={activeTab === 0}
    aria-controls="dashboard-tabpanel-0"
  >

// tabpanel
<div
  id="dashboard-tabpanel-0"
  role="tabpanel"
  aria-labelledby="dashboard-tab-0"
  hidden={activeTab !== 0}
>
```

---

## Translation Patterns

### Country Names

Country fields stored in the database use lowercase keys (e.g. `"united states"`, `"germany"`). **Always** pass through the translation function before displaying:

```tsx
// In tables and panels:
{value ? t(`country.${value}`) : '—'}

// Examples in TiaTable.tsx and TiaPanel.tsx:
<span>
  {step.LawImporterCountry
    ? t(`country.${step.LawImporterCountry}`)
    : '—'}
</span>
```

Applies to: `CountryDataExporter`, `CountryDataImporter`, `LawImporterCountry` in TIA procedures.

**Never** display raw stored keys. They are lowercase strings like `"united states"` — they will render uncapitalized without the translation layer.

---

## Webhooks — Last Delivery Status

**Files:** `lib/svix.ts`, `pages/api/teams/[slug]/webhooks/index.ts`, `components/webhook/Webhooks.tsx`

The webhook table includes a "Last delivery" column showing the most recent Svix delivery attempt.

**Architecture:**
- `getLastWebhookAttempt(appId, endpointId)` in `lib/svix.ts` calls `svix.messageAttempt.listByEndpoint(..., { limit: 1 })`
- `handleGET` in the webhooks API enriches each endpoint in parallel via `Promise.all`
- `Webhooks.tsx` renders `LastDeliveryCell` with `CheckCircle2` (success) / `Clock` (pending) / `XCircle` (failed + HTTP status code)

**Status codes (Svix `MessageStatus`):** 0 = Success, 1 = Pending, 2 = Fail, 3 = Sending

---

## TIA Risk Badge in Dashboard

`TeamAssessmentAnalysis` (`TeamAssessment.tsx`) shows a risk badge in the card header when transfers are at risk:

```tsx
{notPermitAuthorization > 0 ? (
  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-2 py-0.5 rounded-full">
    <AlertCircle size={10} aria-hidden />
    {notPermitAuthorization} {t('tia-at-risk', { defaultValue: 'at risk' })}
  </span>
) : totalNumberOfAssessment > 0 ? (
  <span className="text-[11px] font-medium text-green-600 dark:text-green-400">
    ✓ {t('tia-all-permitted', { defaultValue: 'All permitted' })}
  </span>
) : null}
```

---

## Shared Components

### `ModuleEmptyState`
**Location:** `components/shared/ModuleEmptyState.tsx`

Displayed when a module has no records. Uses Shadcn `Button` (not DaisyUI):

```tsx
<ModuleEmptyState
  icon={ShieldIcon}
  title={t('empty-state.rpa.title')}
  description={t('empty-state.rpa.description')}
  regulatoryContext="GDPR Art. 30"
  ctaLabel={t('create')}
  onCta={() => setIsCreateOpen(true)}
  docsHref="https://www.unicis.tech/docs/..."
/>
```

### `ModuleBadge`
**Location:** `components/shared/ModuleBadge.tsx`

Renders a colored badge for a given module property key. No external dependencies:

```tsx
<ModuleBadge propName="rpa_procedure" />  // → red "RPA"
<ModuleBadge propName="csc_controls" />   // → slate "CSC"
```

### `AuditTimeline`
**Location:** `components/interfaces/Task/AuditTimeline.tsx`

Reusable audit log timeline used across all modules (RPA, TIA, PIA, CSC, RM). Accepts a generic `AuditLog[]` array.

### `StageTracker` / `Stepper`
**Location:** `components/shared/atlaskit/StageTracker.tsx` → `components/shadcn/ui/stepper.tsx`

Used in all multi-step dialogs. Responsive: compact bar on mobile, full dot stepper on `sm+`. See [Stepper section](#stepper-multi-step-forms) above.

### `DomainHealthRow`
**Location:** `components/interfaces/TeamDashboard/DomainHealthRow.tsx`

Three clickable domain health cards above the dashboard tab switcher. See [Domain Health Row](#domain-health-row-domainhealthrowtsx) above.

### `KpiRow`
**Location:** `components/interfaces/TeamDashboard/KpiRow.tsx`

Six KPI cards. Includes internal `CscKpiCards` and `IapKpiCard` sub-components that manage their own data fetching. See [KPI Row](#kpi-row-kpirowtsx) above.

---

## Module-by-Module Design Notes

### All Tasks (`TaskListView`)

**File:** `components/interfaces/Task/TaskListView.tsx`

- Card wrapper: Direction B standard with `overflow-hidden` + inner `overflow-x-auto`
- Header typography: `text-[11px] font-medium uppercase tracking-wide`
- Module badges (`ModuleBadge`) inline with task title in a `flex flex-wrap` container
- Toolbar: `flex-col lg:flex-row` outer + `flex flex-wrap` controls group
- Hover state on rows
- Action column: icon-only Edit + Delete buttons (`Pencil`, `Trash2`) with `aria-label`

### RPA (Record of Processing Activities)

**File:** `components/interfaces/rpa/`

- Card wrapper with `rounded-xl`
- `<th>` uniform Direction B typography
- Empty state via `ModuleEmptyState`
- Create button: Shadcn `<Button variant="default">`
- Dialog: `RpaProcedureDialog` — 6-step form, responsive Stepper, `max-w-[95vw] sm:max-w-2xl`
- Table: `overflow-x-auto` wrapper
- Action column: icon-only Edit + Delete (`Pencil`, `Trash2`) with `aria-label`

### TIA (Transfer Impact Assessment)

**File:** `components/interfaces/tia/`

- Same card + table pattern as RPA
- **Data note:** Legal Analysis column shows `procedure[0].LawImporterCountry` wrapped in `t('country.${value}')` — raw stored keys are lowercase and must always go through translation
- Transfer permitted/not-permitted badge: still uses `DaisyBadge` (planned migration)
- Dialog: `TiaProcedureDialog` — 5-step, responsive Stepper
- Action column: icon-only Edit + Delete with `aria-label`

### PIA (Privacy Impact Assessment)

**File:** `components/interfaces/pia/`

- Three risk axes: confidentiality & integrity, availability, transparency & data minimization
- **Data note:** First column header uses `t('title')` (not `t('rpa')`)
- Dialog: `RiskAssessmentDialog` — up to 6 steps (incl. optional Corrective Measures), responsive Stepper
- Action column: icon-only Edit + Delete with `aria-label`

### Cybersecurity Controls (CSC)

**File:** `components/interfaces/csc/`

- `CscPanel` renders: `CscChartsLayout` → filter toolbar → `[StatusesTable + SectionRail]`
- Card wrapper in `CscPanel` wraps both `StatusesTable` and `SectionRail` as a unified card
- `SectionRail`: **`hidden lg:flex`** — only shown on `lg+`; hidden on mobile/tablet
- Filter toolbar: **`flex flex-wrap justify-end gap-1`** — wraps on narrow screens
- `CscTabs`: **`flex-wrap`** on the tab container
- Framework chip row on dashboard: **`flex flex-wrap`**
- Dark mode tab fix: inactive tabs use `dark:hover:text-slate-200` (not `dark:text-slate-200`)
- Charts: `PieChart` and `RadarChart` each wrapped in `<div role="img" aria-label="..." className="w-full h-full">` — the `w-full h-full` is mandatory to preserve responsive sizing
- Table header cells: `px-3 py-2` with Direction B typography
- `StatusesTable` column: `flex-1 min-w-0 [&_th]:whitespace-normal! [&_td]:whitespace-normal!`
- Dialog: `StatusPromptDialog` (single-step, no stepper) — protected by base dialog class

### Risk Management (RM)

**File:** `components/interfaces/risk-management/`

- Full table rewrite: 14 columns in two-row grouped header
- Column groups: Task info | Raw Risk | Treatment | Target Risk | Current Risk
- Risk color cells use a static lookup table (not dynamic Tailwind class names which break JIT)
- Asset Owner resolved via `membersById.get(userId)` — Map lookup, **not** bracket access `[userId]`
- Dialog: `RmRiskDialog` — 2-step, responsive Stepper
- Action column: icon-only Edit + Delete with `aria-label`

### Interactive Awareness Training (IAP)

**File:** `components/interfaces/iap/`

- Completion summary banner: `flex flex-wrap` outer, `flex-1 min-w-[160px]` progress bar
- Stats row: `flex items-center gap-5 flex-shrink-0` (fits on 375 px with wrap fallback from outer)
- Course grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Admin: `CoursesTable` — 4 icon-only buttons per row (edit, delete, completion-results, status-results) each with `aria-label` including course name for context

### Dashboard

**File:** `pages/teams/[slug]/dashboard.tsx`

- Top bar (banner + export): `flex flex-wrap items-center gap-3` — wraps on mobile
- KPI row: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
- Task matrix + Needs Attention: `flex flex-col lg:flex-row`
- Task Status Matrix: `overflow-x-auto` table wrapper
- **Domain Health Row:** 3 clickable cards (`DomainHealthRow`) inserted above the tab switcher — summarises each domain with status colour + key metric
- Tab bar: `flex gap-0.5 ... flex-wrap` (3 tabs, always fits) — full ARIA wiring (`tablist`, `tab`, `tabpanel`)
- Needs Attention: each item deep-links to `/teams/${slug}/tasks/${task.taskNumber}`

---

## Comments Section (Direction B)

**Location:** `components/interfaces/Task/comments/`

- **Layout:** Single-column, avatar + header in one row, content below
- **Avatar:** `h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700`
- **Header:** `text-[13px] font-semibold text-slate-800 dark:text-slate-100` · `text-[11px] text-slate-400` date
- **Edit/Delete actions:** Hover-only (`opacity-0 group-hover:opacity-100`) inline with header
- **Compose area:** `rounded-lg border focus-within:border-slate-400` with QuillEditor
- **Mobile:** single-column layout works naturally at all breakpoints; hover actions are tap-to-reveal on touch

---

## Buttons: Shadcn Only

All Create/Add/primary action buttons use Shadcn `<Button variant="default">`. DaisyUI `color="primary"` and `btn btn-primary` classes are removed from:

- `rpa/Dashboard.tsx`
- `pages/teams/[slug]/tia.tsx`
- `pia/Dashboard.tsx`
- `risk-management/Dashboard.tsx`
- `iap/admin/AdminPage.tsx`
- `shared/ModuleEmptyState.tsx`

---

## Known DaisyUI Remnants

`DaisyBadge` is still used in `tia/TiaTable.tsx` for the transfer permitted/not-permitted badge (`success` / `error` colors). This is a planned migration to a Shadcn `Badge` variant.

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
- **Supported Languages:** English, French, Spanish, German, Italian, Japanese, Portuguese

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
│   │   ├── ModuleBadge.tsx       # Colored module identifier badge
│   │   ├── ModuleEmptyState.tsx  # Empty state with CTA
│   │   ├── StatusBadge.tsx
│   │   ├── MemberName.tsx
│   │   ├── shell/
│   │   │   ├── AppShell.tsx      # Main layout shell (sidebar + main)
│   │   │   ├── Header.tsx        # Responsive sticky header
│   │   │   ├── Drawer.tsx        # Mobile sidebar (accessible dialog pattern)
│   │   │   ├── AccountDropdown.tsx
│   │   │   └── GlobalSearch.tsx
│   │   └── [...]
│   ├── notifications/       # Notification UI components
│   └── shadcn/              # Shadcn UI components
│       └── ui/
│           ├── dialog.tsx        # Base dialog — responsive defaults
│           ├── stepper.tsx       # Responsive 2-tier stepper
│           └── [...]
├── lib/                     # Utility functions & helpers
│   ├── csc/                 # CSC module logic
│   ├── rpa/                 # RPA helpers
│   ├── pia/                 # PIA helpers
│   ├── tia/                 # TIA helpers
│   ├── rm/                  # Risk Management helpers
│   ├── svix.ts              # Svix SDK wrapper (webhooks + last delivery attempt)
│   └── [...]
├── hooks/                   # React custom hooks
│   ├── useTeamMembersMap.ts # Map<userId, name> for member lookups
│   ├── useISO.ts            # Active CSC framework for a team
│   ├── useCscStatuses.ts    # Control statuses for a framework
│   ├── useCanAccess.ts
│   ├── usePagination.ts
│   └── [...]
├── prisma/                  # Database schema & migrations
├── workers/                 # Background workers
├── types/                   # TypeScript type definitions
│   ├── rm.ts                # RMProcedureInterface (two-tuple)
│   ├── iap.ts               # TeamCourseWithProgress
│   └── [...]
├── locales/                 # i18n translation files (en, fr, de, es, it, ja, pt)
├── styles/                  # Global CSS (quill-view-mode, etc.)
├── public/                  # Static assets
└── [config files]
```

---

## Data Model

### Core Entities

#### User
- Email-based identity (unique email)
- Password (optional, for OAuth users)
- First name, last name, profile image
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
- KPI row: compliance score (hero), CSC gaps, open tasks (overdue indicator), open risks, IAP completion (non-compliant count + admin link)
- Domain Health Row: 3 clickable cards (Data Protection / Cybersecurity / Risk) that switch the active tab
- Task Overview by Module matrix (clickable rows → module pages, colored `ModuleBadge`)
- Needs Attention panel (overdue tasks — deep-linked to individual task)
- Compliance charts (CSC, PIA, RM tabs)
- Global search across tasks and module fields
- Export CSV of all tasks

### 4. Privacy & Compliance Modules

#### RPA (Record of Processing Activities)
- GDPR Art. 30 documentation
- Multi-step creation form (6 steps)
- Export: XLSX, ODS, CSV, HTML, PDF

#### TIA (Transfer Impact Assessment)
- Cross-border data transfer analysis
- **Legal Analysis column**: shows `LawImporterCountry` from `procedure[0]` — always displayed via `t('country.${value}')` translation
- Transfer permitted/not-permitted badge via `isTranferPermitted()`

#### PIA (Privacy Impact Assessment)
- Three risk axes: confidentiality & integrity, availability, transparency & data minimisation
- Optional Corrective Measures step (triggered when any risk score > 10)
- Risk matrix filter

#### CSC (Cybersecurity Controls)
- Multi-framework support (ISO 27001:2013/2022, NIST CSF 2.0, CIS, NIS2, GDPR, SOC 2, PCI DSS, OWASP ASVS v5, C5:2020, ISO 42001)
- Framework mapping matrix
- Statement of Applicability (SoA) export (XLSX, ODS, PDF, HTML)
- Section rail for per-section compliance navigation (desktop only, `hidden lg:flex`)
- Bulk control selection + status assignment
- URL-encoded filter state (section + status + perPage)

#### Risk Management (RM)
- 14-column table with grouped section headers (Raw Risk / Treatment / Target Risk / Current Risk)
- Risk rating calculated from `RawProbability × RawImpact`
- Asset Owner resolved via `useTeamMembersMap` → `membersById.get(userId)` (Map API, not bracket access)

#### IAP (Interactive Awareness Program)
- Course catalogue with thumbnail, category, estimated time
- Progress tracking per team member (`CourseProgress.progress` 0–100)
- Completion summary banner (total / completed / in-progress / %)
- Admin: create categories and courses; 4-icon action column per course row

### 5. Webhooks
- Svix-powered webhook endpoints
- Last delivery status column: success / pending / failed (HTTP code) with timestamp
- Delivery data fetched server-side via `getLastWebhookAttempt()` using `messageAttempt.listByEndpoint(appId, endpointId, { limit: 1 })`

### 6. REST API
- OpenAPI 3.0 — Swagger UI at `/api-docs`
- Bearer token authentication via API keys
- Endpoints: Tasks, CSC, RM, PIA, RPA, TIA, API Keys, AI Chatbot

### 7. Audit Logging
- Per-module `AuditTimeline` component
- Integrated with Retraced

### 8. Notifications
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
- Sparklines on KPI cards (requires backend `kpi_snapshots` table with daily compliance/risk values — frontend `KpiStrip` component already has SVG sparkline support via `sparkline?: number[]` prop)
- Migrate remaining DaisyUI components to Shadcn (`DaisyBadge` in TIA table)
- Per-module URL filter persistence for CSC section / status filters
- Responsive breakpoint testing in CI (Playwright viewport matrix)

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

**Accessibility checklist** and **Responsive design checklist** (above) must be included in every pull request description that touches UI components.

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
| WCAG | Web Content Accessibility Guidelines |
