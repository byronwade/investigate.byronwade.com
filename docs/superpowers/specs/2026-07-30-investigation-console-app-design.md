# Investigation Console — Real Application Design

**Date:** 2026-07-30  
**Branch:** `design/investigation-console`  
**Status:** Approved in chat (Approach 1; Sections 1–2). Awaiting final spec review before implementation plan.

## Goal

Turn the Paper Investigation Console migration from static visual dumps into a real TanStack Start application: shared shell, nested routes, shadcn primitives, Phosphor Duotone icons, typed mock case data — while keeping exact Paper dumps available as a reference gallery. Phase A ships the case workspace core; Phase C rebuilds the remaining screens onto the same architecture.

## Decisions (locked)

| Topic | Choice |
| --- | --- |
| Delivery order | Phase A (case core) → Phase C (full console rewrite) |
| Data | Typed mock fixtures (“Northridge”); no backend in Phase A |
| Product routes | Nested: `/console/cases/$caseId/...` |
| Paper dumps | Keep as reference gallery at `/console/reference` and `/console/reference/$slug` |
| Architecture | Shared `CaseShell` + page modules (Approach 1) |
| Icons | Phosphor Duotone (`@phosphor-icons/react`) |
| UI kit | shadcn/ui, themed to console tokens (not marketing brand greens) |

## Non-goals (Phase A)

- Auth, RBAC enforcement, or real network APIs
- Convex / database persistence
- Rebuilding all 40 Paper screens in one pass
- Changing the marketing site design system (Fraunces / brand green)
- Pixel-identical reimplementation of every dump detail when composition + tokens already match the design language

## Information architecture

### Routes

| Path | Role | Phase |
| --- | --- | --- |
| `/console` | Redirect to `/console/cases/northridge/overview` | A |
| `/console/cases/$caseId` | Layout: `CaseShell` + `<Outlet />` | A |
| `/console/cases/$caseId/overview` | Case overview | A |
| `/console/cases/$caseId/timeline` | Case timeline | A |
| `/console/cases/$caseId/evidence` | Evidence & custody | A |
| `/console/cases/$caseId/leads` | Leads board | A |
| `/console/cases/$caseId/people` | People (case-scoped) | A |
| `/console/reference` | Index of Paper dump screens | A |
| `/console/reference/$slug` | Exact Paper JSX dump (lazy) | A |
| Agency / media / system screens | Command center, intake, forensics, … | C |

Default demo case id: `northridge` (matches Paper copy). Unknown `$caseId` shows a calm not-found state inside the console surface (not the marketing 404).

### Shell layout (fixed chrome)

Order, always:

1. Classification strip (26px)
2. Top bar (48px) — agency, case chip, ask/search, New, network indicators
3. Case tabs (42px) — Overview, Timeline, Investigative plan (Phase C), People, … as links
4. Body: Sidebar (212px) · Main · Rail (344px when the page provides rail content)

Pages never re-render classification / top bar / sidebar / tabs. They only supply main content and optional rail slots.

## Feature structure

```
src/features/console/
  shell/                 # ClassificationStrip, TopBar, CaseTabs, Sidebar, CaseShell
  ui/                    # Console-tuned composites (StatusDot, MetaChip, PageHeader, …)
  data/                  # types, northridge fixtures, getters
  pages/                 # overview, timeline, evidence, leads, people
  styles/console.css     # Console design tokens (keep / extend)
  screens/paper/         # Exact Paper dumps (reference routes only)
  screens/registry.ts    # Slug metadata for reference gallery
  screens/screen-loader.tsx
```

Routes live under `src/routes/console/` following TanStack file routing. Marketing chrome continues to skip `/console/*` in `__root.tsx`.

## Design system

### Tokens

Console surface remains scoped under `[data-surface='console']` with Geist / Geist Mono and Paper ink palette (`#111111`, `#3D3D3D`, `#6B6B6B`, `#ECECEC`, categorical blues/ambers/purples/greens). Marketing tokens in `src/styles/tokens.css` stay for the public site; do not force Fraunces into the console.

Extend `console.css` with semantic aliases used by shadcn theme variables when initializing shadcn (e.g. map `--primary` → console ink for primary buttons on this surface).

### shadcn (Phase A install set)

`button`, `input`, `badge`, `tabs`, `dropdown-menu`, `separator`, `scroll-area`, `tooltip`, `dialog`, `command`, `table`, `avatar`, `sheet`.

Initialize `components.json` for this repo. Prefer New York-style density and small radii consistent with Paper (~4–8px). Existing `src/components/ui/button.tsx` is marketing-oriented; either:

- Keep marketing `Button` and add shadcn under a clear split (`src/components/ui` for shared shadcn, console wrappers in `features/console/ui`), or
- Migrate marketing button to shadcn variants carefully without breaking home tests.

**Preference:** introduce shadcn primitives in `src/components/ui` (standard path); console pages import them and apply console-scoped classNames / CSS variables. Do not duplicate a second button system long-term — migrate the custom marketing button onto shadcn variants in a small follow-up if needed for compile/knip cleanliness.

### Icons

Phosphor Duotone for sidebar, tabs, and toolbar actions. Always pair with visible text in primary nav. Decorative icons: `aria-hidden="true"`. No emoji as UI icons.

### Motion

Honor Paper motion rules already documented in Foundations / Motion dumps:

- Press feedback, menus/popovers, side panels, indeterminate agent bar only
- Respect `prefers-reduced-motion`
- No decorative list reshuffles or ease-in menus

## Data model (mock)

Typed fixtures under `src/features/console/data/`:

- `Case` — id, number, title, status, openedAt, assignees, reviewDue
- `Person` — id, name, role (subject / witness / poi / …), notes, contradictionCount
- `EvidenceItem` — id, label, custody state, type
- `Lead` — id, title, column (kanban), owner
- `TimelineEvent` — id, at, kind, summary, sourceRefs
- `AssistantRun` — steps, findings, humanOnlyDecisions (overview)

Public getters (sync for Phase A):

- `getCase(caseId)`, `listPeople(caseId)`, `listEvidence(caseId)`, `listLeads(caseId)`, `listTimeline(caseId)`, `getOverview(caseId)`

Shape getters so a later Convex/API layer can replace implementations without changing page components. No `Date.now()` inside future Convex queries (N/A for mocks).

## Page composition (Phase A)

### Overview

- Page header (title, meta, Request approval / New lead)
- Investigative assistant run block (steps + findings + human-only decisions)
- Compact people strip or table linking to People
- Rail: authority / techniques / access (slot from page)

### Timeline

- Vertical lifeline / filterable event list from fixtures
- Rail optional (filters or event detail)

### Evidence

- Custody-oriented table/list; status badges
- Row focus may drive rail detail

### Leads

- Kanban columns from fixtures; cards with owner + status
- Prefer board over nested cards-inside-cards

### People

- Directory table for case people; link affordance toward person profile (profile detail can be Phase C)

## Navigation & UX

- Sidebar and case tabs use TanStack `Link` with active styles from router
- Skip link to `#console-main`; focus main on route change
- Top bar search opens Command palette (shadcn `command`) — client-only island
- Unknown reference slugs: not-found with link back to gallery
- Empty states: not required for Phase A mock data (fixtures are non-empty); shared empty/denied components land when Phase C hits Empty States screen

## Reference gallery

- `/console/reference` lists registry entries (reuse `consoleScreens`)
- `/console/reference/$slug` lazy-loads `screens/paper/*` via existing loader
- Product shell does not wrap dumps (dumps include their own chrome) — reference route is a bare surface like today’s dump routes
- Catalog link from console top bar or sidebar footer: “Paper reference”

## Testing (Phase A)

- Unit: registry still 40 slugs; data getters return expected Northridge shapes
- Component/integration: CaseShell renders nav links; overview shows case title from fixture
- E2E smoke: `/console` redirects and overview heading visible
- Do not axe-test dense Paper dumps; axe the new shell + overview for serious/critical

## Error handling

- Missing case id → console-native not-found
- Missing reference slug → gallery not-found
- Command / dialog failures → inline status, no silent catch

## Phase C (after A)

Rebuild remaining Paper screens onto nested or agency-level routes under `/console/...`, reusing `CaseShell` or an `AgencyShell` variant (no case tabs). Replace dump usage for product navigation; keep `/console/reference` until parity is signed off, then optionally deprecate.

Suggested Phase C batches: agency workspace → media tools → system/modes → foundations pages as docs routes.

## Success criteria (Phase A)

1. Nested case routes navigate as one application (shared chrome, correct active states)
2. Five case pages consume mock fixtures through getters
3. shadcn + Phosphor Duotone used in shell and pages; console visual language preserved
4. Paper dumps reachable under `/console/reference`
5. `pnpm verify` passes

## Implementation notes

- Exact package versions: pin after `pnpm add` (project rule: exact versions)
- Prefer progressive enhancement; command palette is the main justified client island
- Keep bundle impact in mind: lazy reference dumps; case pages can be eager or lazy per route
- Update `DESIGN.md` with a short “Console application” subsection pointing at this spec and token ownership
