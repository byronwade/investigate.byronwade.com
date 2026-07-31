# Investigation Console App (Phase A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a real nested-route Investigation Console with shared `CaseShell`, shadcn + Phosphor Duotone, typed Northridge mock data, five case pages, and Paper dumps at `/console/reference`.

**Architecture:** Console surface keeps Geist + Paper tokens. Layout route `/console/cases/$caseId` owns chrome; child routes supply main (+ optional rail). Data is sync getters over fixtures shaped for a future API. Exact Paper JSX stays lazy under `/console/reference/$slug`.

**Tech Stack:** TanStack Start/Router, React 19, Tailwind 4, shadcn/ui, `@phosphor-icons/react` (Duotone), Vitest, Playwright, Biome.

**Spec:** `docs/superpowers/specs/2026-07-30-investigation-console-app-design.md`

## Global Constraints

- Pin exact dependency versions (no `^` ranges)
- Console UI uses `[data-surface='console']` tokens — not marketing Fraunces/brand greens
- Secrets stay in `src/lib/server/`; only `VITE_*` via `getPublicEnv()`
- No unjustified `any` / non-null assertions
- Add/update tests when behavior changes; run relevant tests per task; `pnpm verify` at end
- Conventional Commits if committing; do not commit unless the user asked (skip commit steps when not requested)
- Do not edit `src/routeTree.gen.ts` by hand — run `pnpm generate-routes`
- Paper dumps remain under `src/features/console/screens/paper/` (Biome-ignored)

---

## File map

| Path | Responsibility |
| --- | --- |
| `components.json` | shadcn config |
| `src/components/ui/*` | shadcn primitives (+ migrate/coexist with existing Button) |
| `src/lib/shared/cn.ts` | already exists — keep using |
| `src/features/console/data/types.ts` | Case domain types |
| `src/features/console/data/northridge.ts` | Fixture data |
| `src/features/console/data/getters.ts` | `getCase`, `listPeople`, … |
| `src/features/console/data/getters.test.ts` | Unit tests for getters |
| `src/features/console/shell/*` | ClassificationStrip, TopBar, CaseTabs, Sidebar, CaseShell |
| `src/features/console/ui/*` | PageHeader, StatusDot, MetaChip |
| `src/features/console/pages/*` | overview, timeline, evidence, leads, people |
| `src/features/console/styles/console.css` | Extend with shadcn CSS var bridge |
| `src/routes/console/index.tsx` | Redirect to default case overview |
| `src/routes/console/cases/$caseId/route.tsx` | CaseShell layout |
| `src/routes/console/cases/$caseId/overview.tsx` | Overview page |
| `src/routes/console/cases/$caseId/timeline.tsx` | Timeline page |
| `src/routes/console/cases/$caseId/evidence.tsx` | Evidence page |
| `src/routes/console/cases/$caseId/leads.tsx` | Leads page |
| `src/routes/console/cases/$caseId/people.tsx` | People page |
| `src/routes/console/reference/index.tsx` | Reference gallery index |
| `src/routes/console/reference/$slug.tsx` | Paper dump viewer |
| `src/routes/console/$screen.tsx` | Remove or redirect to reference (cleanup) |
| `e2e/console-smoke.spec.ts` | Console redirect + overview smoke |
| `DESIGN.md` | Console application subsection |

---

### Task 1: shadcn init + Phosphor + console theme bridge

**Files:**
- Create: `components.json`
- Modify: `package.json` (deps), `src/styles.css` or `src/features/console/styles/console.css`
- Create/Modify: `src/components/ui/button.tsx` (shadcn) — preserve marketing variants via classNames or dual export carefully
- Modify: `src/components/ui/button.component.test.tsx` if Button API changes
- Test: `pnpm test:unit` / button component test

**Interfaces:**
- Produces: shadcn `Button`, `Input`, `Badge`, `Tabs`, `DropdownMenu`, `Separator`, `ScrollArea`, `Tooltip`, `Dialog`, `Command`, `Table`, `Avatar`, `Sheet` under `src/components/ui/`
- Produces: dependency `@phosphor-icons/react` exact version

- [ ] **Step 1: Init shadcn for this Vite/TanStack project**

Run (adjust if CLI prompts — choose New York, Zinc/neutral, CSS variables, `src/components/ui`, `#/` alias if supported else `@/` mapped to existing `#/`):

```bash
pnpm dlx shadcn@latest init
```

Ensure `components.json` points at Tailwind 4 + existing `src/styles.css`. If the existing custom `Button` conflicts, temporarily rename marketing button to `src/components/ui/marketing-button.tsx` and update imports in `src/features/home/**` and tests, then add shadcn button.

- [ ] **Step 2: Add components + Phosphor**

```bash
pnpm dlx shadcn@latest add button input badge tabs dropdown-menu separator scroll-area tooltip dialog command table avatar sheet
pnpm add @phosphor-icons/react@exact-version-resolved
```

Pin versions in `package.json` to exact numbers after install.

- [ ] **Step 3: Bridge console tokens**

In `src/features/console/styles/console.css`, under `[data-surface='console']`, map shadcn vars:

```css
[data-surface='console'] {
  /* existing console tokens… */
  --background: var(--console-ground);
  --foreground: var(--console-ink);
  --card: var(--console-ground);
  --card-foreground: var(--console-ink);
  --popover: var(--console-ground);
  --popover-foreground: var(--console-ink);
  --primary: var(--console-ink);
  --primary-foreground: #ffffff;
  --secondary: var(--console-strip);
  --secondary-foreground: var(--console-ink);
  --muted: var(--console-strip);
  --muted-foreground: var(--console-muted);
  --accent: var(--console-row-active);
  --accent-foreground: var(--console-ink);
  --destructive: var(--console-danger);
  --border: var(--console-hairline);
  --input: var(--console-hairline);
  --ring: var(--console-ink);
  --radius: 0.375rem;
}
```

- [ ] **Step 4: Fix button tests / imports**

Run: `pnpm test:unit`  
Expected: PASS (update selectors/classes if Button markup changed)

- [ ] **Step 5: Commit (only if user requested commits)**

```bash
git add components.json package.json pnpm-lock.yaml src/components/ui src/features/home src/features/console/styles/console.css
git commit -m "feat(console): add shadcn primitives and Phosphor icons"
```

---

### Task 2: Mock case data + getters (TDD)

**Files:**
- Create: `src/features/console/data/types.ts`
- Create: `src/features/console/data/northridge.ts`
- Create: `src/features/console/data/getters.ts`
- Create: `src/features/console/data/getters.test.ts`
- Create: `src/features/console/data/index.ts`

**Interfaces:**
- Produces:

```ts
export type CaseId = string;

export type CaseRecord = {
  id: CaseId;
  number: string;
  title: string;
  status: 'open' | 'closed';
  openedLabel: string;
  assigneesLabel: string;
  reviewDueLabel: string;
};

export type PersonRecord = {
  id: string;
  caseId: CaseId;
  name: string;
  role: 'subject' | 'witness' | 'poi' | 'other';
  notes: string;
  contradictionCount: number;
};

export type EvidenceRecord = {
  id: string;
  caseId: CaseId;
  label: string;
  kind: string;
  custody: 'sealed' | 'lab' | 'checked-out' | 'intake';
};

export type LeadRecord = {
  id: string;
  caseId: CaseId;
  title: string;
  column: 'triage' | 'active' | 'blocked' | 'done';
  owner: string;
};

export type TimelineEventRecord = {
  id: string;
  caseId: CaseId;
  atLabel: string;
  kind: string;
  summary: string;
};

export type AssistantStep = {
  id: string;
  label: string;
  state: 'done' | 'denied' | 'running' | 'pending';
  durationLabel?: string;
};

export type OverviewModel = {
  case: CaseRecord;
  assistant: {
    durationLabel: string;
    runLabel: string;
    steps: AssistantStep[];
    findings: { id: string; text: string; tags: string[] }[];
    humanOnly: { id: string; label: string; assignee: string }[];
  };
  rail: {
    techniques: { id: string; label: string; ok: boolean }[];
    access: { id: string; label: string }[];
  };
};

export function getCase(caseId: CaseId): CaseRecord | null;
export function listPeople(caseId: CaseId): PersonRecord[];
export function listEvidence(caseId: CaseId): EvidenceRecord[];
export function listLeads(caseId: CaseId): LeadRecord[];
export function listTimeline(caseId: CaseId): TimelineEventRecord[];
export function getOverview(caseId: CaseId): OverviewModel | null;
export const DEFAULT_CASE_ID = 'northridge';
```

- [ ] **Step 1: Write failing getter tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CASE_ID,
  getCase,
  getOverview,
  listEvidence,
  listLeads,
  listPeople,
  listTimeline,
} from './getters';

describe('console case getters', () => {
  it('returns the default Northridge case', () => {
    const c = getCase(DEFAULT_CASE_ID);
    expect(c?.number).toBe('245D-CG-3881127');
    expect(c?.title).toMatch(/Northridge/i);
  });

  it('returns null for unknown cases', () => {
    expect(getCase('missing')).toBeNull();
    expect(getOverview('missing')).toBeNull();
  });

  it('lists non-empty related collections for Northridge', () => {
    expect(listPeople(DEFAULT_CASE_ID).length).toBeGreaterThan(0);
    expect(listEvidence(DEFAULT_CASE_ID).length).toBeGreaterThan(0);
    expect(listLeads(DEFAULT_CASE_ID).length).toBeGreaterThan(0);
    expect(listTimeline(DEFAULT_CASE_ID).length).toBeGreaterThan(0);
    expect(getOverview(DEFAULT_CASE_ID)?.assistant.steps.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm exec vitest run src/features/console/data/getters.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement types, fixtures, getters**

Populate `northridge.ts` from Paper Case Overview copy (case number, people roles, sample evidence/leads/timeline, assistant steps). Implement getters by filtering on `caseId`.

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm exec vitest run src/features/console/data/getters.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit (if requested)**

```bash
git add src/features/console/data
git commit -m "feat(console): add Northridge mock case getters"
```

---

### Task 3: CaseShell chrome (sidebar, tabs, top bar)

**Files:**
- Create: `src/features/console/shell/classification-strip.tsx`
- Create: `src/features/console/shell/top-bar.tsx`
- Create: `src/features/console/shell/case-tabs.tsx`
- Create: `src/features/console/shell/sidebar.tsx`
- Create: `src/features/console/shell/case-shell.tsx`
- Create: `src/features/console/shell/nav.ts`
- Create: `src/features/console/shell/case-shell.test.tsx`
- Create: `src/features/console/ui/page-header.tsx`
- Create: `src/features/console/ui/status-dot.tsx`

**Interfaces:**
- Consumes: `CaseRecord` from data getters; Phosphor Duotone icons; shadcn `Button`, `Input`/`Command`, `Badge`, `Separator`
- Produces:

```tsx
export function CaseShell(props: {
  caseRecord: CaseRecord;
  children: React.ReactNode;
  rail?: React.ReactNode;
}): React.JSX.Element;

export type CaseNavItem = {
  to: string; // relative path segment e.g. '/console/cases/$caseId/overview'
  label: string;
  icon: React.ComponentType<{ className?: string; weight?: 'duotone' | 'regular' }>;
};
```

Nav config in `nav.ts`: sidebar groups (Command center / Record / Process) linking to Phase A routes that exist; Phase C destinations can link to `#` disabled or omit until C — **prefer only linking routes that exist in Phase A**, plus “Paper reference” → `/console/reference`.

Case tabs (Phase A): Overview, Timeline, Evidence, Leads, People — all real links under `/console/cases/$caseId/...`.

- [ ] **Step 1: Write shell smoke test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// Wrap with a minimal MemoryRouter / createRouter if project patterns require it.
// Prefer matching existing router test helpers if any; else stub Link via vi.mock('@tanstack/react-router').

describe('CaseShell', () => {
  it('shows case number and primary nav labels', () => {
    // render CaseShell with fixture case + children "Main"
    expect(screen.getByText(/245D-CG-3881127/)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /case/i })).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
  });
});
```

Use project’s integration test project (`pnpm test:integration`) if router context is required.

- [ ] **Step 2: Implement shell pieces**

Structure `CaseShell` roughly:

```tsx
export function CaseShell({ caseRecord, children, rail }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--console-ground)]">
      <ClassificationStrip />
      <TopBar caseRecord={caseRecord} />
      <CaseTabs caseId={caseRecord.id} />
      <div className="flex min-h-0 flex-1">
        <Sidebar caseId={caseRecord.id} />
        <main id="console-main" className="min-w-0 flex-1 overflow-auto p-6">
          {children}
        </main>
        {rail ? (
          <aside className="hidden w-[var(--console-rail-width)] shrink-0 border-l border-[var(--console-hairline)] xl:block">
            {rail}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
```

Use Phosphor Duotone icons in sidebar (`Folder`, `Users`, `Package`, `Kanban`, `Path`, etc. — pick closest Phosphor names). Classification strip: green status dot + `UNCLASSIFIED // LAW ENFORCEMENT SENSITIVE` mono text.

- [ ] **Step 3: Run shell test — PASS**

Run: `pnpm exec vitest run src/features/console/shell/case-shell.test.tsx`  
Expected: PASS

- [ ] **Step 4: Commit (if requested)**

```bash
git add src/features/console/shell src/features/console/ui
git commit -m "feat(console): add CaseShell navigation chrome"
```

---

### Task 4: Nested TanStack case routes + redirect

**Files:**
- Modify: `src/routes/console/index.tsx` — redirect
- Create: `src/routes/console/cases/$caseId/route.tsx`
- Create: `src/routes/console/cases/$caseId/overview.tsx` (stub page OK)
- Create: `src/routes/console/cases/$caseId/timeline.tsx` (stub)
- Create: `src/routes/console/cases/$caseId/evidence.tsx` (stub)
- Create: `src/routes/console/cases/$caseId/leads.tsx` (stub)
- Create: `src/routes/console/cases/$caseId/people.tsx` (stub)
- Modify: `src/routes/console/$screen.tsx` — redirect to `/console/reference/$screen` or delete + update route tree
- Run: `pnpm generate-routes`

**Interfaces:**
- Consumes: `CaseShell`, `getCase`, `DEFAULT_CASE_ID`
- Layout route:

```tsx
export const Route = createFileRoute('/console/cases/$caseId')({
  component: CaseLayout,
  // notFoundComponent optional
});

function CaseLayout() {
  const { caseId } = Route.useParams();
  const caseRecord = getCase(caseId);
  if (!caseRecord) return <CaseNotFound caseId={caseId} />;
  return (
    <CaseShell caseRecord={caseRecord}>
      <Outlet />
    </CaseShell>
  );
}
```

Note: rail should be provided by child pages — use an outlet context or compose pages to pass rail into shell. **Preferred:** `CaseShell` reads optional React context `ConsoleRailContext` set by page components via `<ConsoleRail>{...}</ConsoleRail>` effect/portal, OR simpler for Phase A: each page includes rail in a local two-column layout inside `main` when needed (Overview), and shell always has the outer sidebar/tabs. Spec wants shell-owned rail slot — implement context:

```tsx
// shell/rail-context.tsx
export function useSetConsoleRail(node: React.ReactNode): void;
```

Simplest approved approach for Phase A: **Overview (and others) render rail inside page layout as a right column within main** matching 344px width — avoid complex portal. Document deviation: “rail is page-local in Phase A; promote to shell slot in Phase C if needed.” Update is acceptable vs blocking.

- [ ] **Step 1: Create route files + redirect**

`console/index.tsx`:

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { DEFAULT_CASE_ID } from '#/features/console/data';

export const Route = createFileRoute('/console/')({
  beforeLoad: () => {
    throw redirect({
      to: '/console/cases/$caseId/overview',
      params: { caseId: DEFAULT_CASE_ID },
    });
  },
});
```

Stub each child with `PageHeader` + title from `getCase`.

- [ ] **Step 2: Generate routes**

Run: `pnpm generate-routes`  
Expected: `src/routeTree.gen.ts` includes `/console/cases/$caseId/*`

- [ ] **Step 3: Manual smoke**

Run: `pnpm dev` → open `/console` → lands on overview with shell  
Expected: classification strip + sidebar + “Northridge” content stub

- [ ] **Step 4: Commit (if requested)**

```bash
git add src/routes/console src/routeTree.gen.ts
git commit -m "feat(console): add nested case routes and default redirect"
```

---

### Task 5: Overview page (composed UI)

**Files:**
- Create: `src/features/console/pages/overview-page.tsx`
- Modify: `src/routes/console/cases/$caseId/overview.tsx`
- Create: `src/features/console/pages/overview-page.test.tsx`

**Interfaces:**
- Consumes: `getOverview(caseId)`
- Produces: `OverviewPage({ caseId }: { caseId: string })`

- [ ] **Step 1: Failing test — renders assistant human-only heading**

```tsx
it('renders case title and human-only gate copy', () => {
  render(<OverviewPage caseId="northridge" />);
  expect(screen.getByRole('heading', { name: /Northridge/i })).toBeInTheDocument();
  expect(screen.getByText(/decisions are human-only/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Implement OverviewPage**

Compose with shadcn `Button`, `Badge`, `Separator`, Phosphor icons; sections:

1. `PageHeader` + actions Request approval (secondary) / New lead (primary)
2. Assistant run card (steps list with StatusDot)
3. Findings list (offence blue text)
4. Human-only decisions with Review / Reject buttons
5. People preview table (`Table`) linking conceptually to People route
6. Right column rail (techniques + access) at `w-[344px]`

- [ ] **Step 3: Wire route**

```tsx
function OverviewRoute() {
  const { caseId } = Route.useParams();
  return <OverviewPage caseId={caseId} />;
}
```

- [ ] **Step 4: Tests PASS + typecheck**

Run: `pnpm exec vitest run src/features/console/pages/overview-page.test.tsx && pnpm typecheck`  
Expected: PASS

---

### Task 6: Timeline, Evidence, Leads, People pages

**Files:**
- Create: `src/features/console/pages/timeline-page.tsx`
- Create: `src/features/console/pages/evidence-page.tsx`
- Create: `src/features/console/pages/leads-page.tsx`
- Create: `src/features/console/pages/people-page.tsx`
- Modify: corresponding route files
- Create: `src/features/console/pages/case-pages.test.tsx` (one file covering list headings)

**Interfaces:**
- Each page: `export function XPage({ caseId }: { caseId: string })`
- Timeline: list from `listTimeline`
- Evidence: `Table` from `listEvidence` + custody `Badge`
- Leads: 4-column board from `listLeads` grouped by `column`
- People: `Table` from `listPeople` + `StatusDot` by role

- [ ] **Step 1: Write tests asserting each page shows a unique heading and at least one fixture row/card**

- [ ] **Step 2: Implement four pages with shadcn + Phosphor; wire routes**

- [ ] **Step 3: Run tests**

Run: `pnpm exec vitest run src/features/console/pages`  
Expected: PASS

- [ ] **Step 4: Commit (if requested)**

```bash
git add src/features/console/pages src/routes/console/cases
git commit -m "feat(console): add timeline evidence leads people pages"
```

---

### Task 7: Reference gallery routes + cleanup catalog

**Files:**
- Create: `src/routes/console/reference/index.tsx`
- Create: `src/routes/console/reference/$slug.tsx`
- Delete or redirect: `src/routes/console/$screen.tsx` → `/console/reference/$screen`
- Modify: `src/features/console/shell/sidebar.tsx` or TopBar — link “Paper reference”
- Modify: `src/features/console/screens/registry.test.ts` if paths change
- Run: `pnpm generate-routes`

- [ ] **Step 1: Move gallery UI from old `console/index` catalog into `reference/index.tsx`**

Reuse registry grouping from current catalog component.

- [ ] **Step 2: `$slug` uses `ConsoleScreenLoader` from `screen-loader.tsx`**

```tsx
export const Route = createFileRoute('/console/reference/$slug')({
  component: ReferenceScreenPage,
});
```

- [ ] **Step 3: Redirect legacy `/console/$screen` to reference**

```tsx
beforeLoad: ({ params }) => {
  throw redirect({
    to: '/console/reference/$slug',
    params: { slug: params.screen },
  });
},
```

- [ ] **Step 4: generate-routes + unit registry test PASS**

---

### Task 8: E2E smoke, DESIGN.md, verify

**Files:**
- Create: `e2e/console-smoke.spec.ts`
- Modify: `DESIGN.md` — Console application subsection pointing at spec
- Modify: `README.md` — `/console` → redirects to case overview; reference gallery path

- [ ] **Step 1: E2E smoke**

```ts
import { expect, test } from '@playwright/test';

test('console redirects to case overview', async ({ page }) => {
  await page.goto('/console');
  await expect(page).toHaveURL(/\/console\/cases\/northridge\/overview/);
  await expect(page.getByRole('heading', { name: /Northridge/i })).toBeVisible();
});
```

Add to Playwright smoke project or rely on `test:e2e` include — if smoke project only runs `e2e/smoke.spec.ts`, either extend that file with a second test or register `console-smoke` in config. Prefer adding test to `e2e/smoke.spec.ts` if config is narrow.

- [ ] **Step 2: Docs update** — DESIGN.md + README paths

- [ ] **Step 3: Full verify**

Run: `pnpm verify`  
Expected: All verification steps passed.

- [ ] **Step 4: Commit (if requested)**

```bash
git add e2e DESIGN.md README.md src
git commit -m "feat(console): Phase A real case workspace application"
```

---

## Phase C (out of scope for this plan — next plan)

Separate plan after Phase A ships: agency shell, remaining screens rebuilt from Paper → composed pages, deprecate product use of dumps, keep `/console/reference` until parity sign-off.

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Nested case routes + redirect | 4 |
| CaseShell chrome | 3 |
| Mock getters | 2 |
| Overview / Timeline / Evidence / Leads / People | 5–6 |
| shadcn + Phosphor | 1 |
| Reference gallery | 7 |
| DESIGN.md / verify / e2e | 8 |
| Phase C full rewrite | Deferred (explicit) |
