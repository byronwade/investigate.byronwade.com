# Final Review — Investigation Console Phase A

**Branch:** `design/investigation-console` (`937622e`…`4d76402`, 12 commits)  
**Spec:** `docs/superpowers/specs/2026-07-30-investigation-console-app-design.md`  
**Verify:** `pnpm verify` already passed (trusted for this review)  
**Date:** 2026-07-31

## Verdict

**Needs fixes** — no Critical defects; three Important gaps violate locked Phase A navigation / shell IA. Architecture, fixtures, routes, reference gallery, shadcn/Phosphor, docs, and smoke coverage otherwise match the spec.

## Spec checklist (summary)

| Success criterion | Status |
| --- | --- |
| Nested case routes + shared chrome | Partial — chrome shared; **active states missing** |
| Five pages via getters | Pass |
| shadcn + Phosphor + console tokens | Pass |
| Paper dumps under `/console/reference` | Pass |
| `pnpm verify` | Pass (reported) |

## Critical

None.

## Important

### 1. Case tabs / sidebar lack router active states (confidence 92)

**Where:** `src/features/console/shell/case-tabs.tsx`, `sidebar.tsx`, `console-link.tsx`  
**Why:** Spec Navigation & UX and success criterion #1 require TanStack `Link` **active styles**. `ConsoleLink` accepts `aria-current` but nothing sets it; no `activeProps` / pathname match. Users cannot tell the current case page from chrome.  
**Fix:** Drive `aria-current="page"` + active classNames from router state (or `Link` `activeProps`) for tab and sidebar destinations.

### 2. Route-change focus ignores `#console-main` (confidence 93)

**Where:** `src/routes/__root.tsx` `FocusOnNavigate` (lines ~113–131)  
**Why:** Spec: “Skip link to `#console-main`; focus main on route change.” Console mounts `FocusOnNavigate` but only focuses `#main-content`, which does not exist on `/console/*`. Keyboard focus is not moved into the case workspace after tab/sidebar navigation. Noted as deferred in Task 3 review; never shipped.  
**Fix:** Resolve `#console-main` when present, else `#main-content`.

### 3. Overview rail is inside `<main>`, not `CaseShell` rail slot (confidence 85)

**Where:** `src/routes/console/cases/$caseId/route.tsx` (never passes `rail`); `overview-page.tsx` embeds `<aside>` in page children  
**Why:** Locked shell IA is Sidebar · Main · Rail as peers; `CaseShell` already exposes `rail?: React.ReactNode`. Page-local rail scrolls with main and breaks the fixed chrome column model.  
**Fix:** Lift overview rail content into `CaseShell`’s `rail` prop (outlet context or page-level composition), keep main for primary content only.

## Out of threshold (not blocking)

- Skip link `#console-main` is a no-op on successful Paper dump loads (`ConsoleScreenLoader` has no target id) — reference-only surface; prefer omitting skip link or wrapping dumps with a focus target.
- `ConsoleLink` `to as never` type escape; intentional Phase A typing debt.
- Role helpers duplicated across overview/people pages.

## Ready when

Important items 1–3 are fixed (or explicitly waived in the spec). Then Phase A can ship and Phase C can proceed on the same shell.

## Fix notes (2026-07-31)

Addressed Important 1–3:

1. **Active nav** — `ConsoleLink` forwards TanStack `activeProps` / `activeOptions`. Case tabs use exact match + ink underline (`border-b-2`); sidebar uses `--console-row-active` bg + ink. Both set `aria-current="page"`.
2. **FocusOnNavigate** — prefers `#console-main`, falls back to `#main-content`.
3. **Shell rail** — added `ConsoleRailProvider` / `useConsoleRailSetter` in `shell/rail-context.tsx`. `CaseShell` consumes context rail (or explicit `rail` prop). `OverviewPage` mounts `OverviewRailPanel` into the shell slot via `useEffect` and clears on unmount.

**Checks:** `case-shell.test.tsx` + `overview-page.test.tsx` (6 tests) PASS; `pnpm typecheck` PASS.
