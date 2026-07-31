# Task 5 Report: Overview page (composed UI)

## Status

**DONE**

## Summary

Replaced the Overview route stub with a composed `OverviewPage` driven by `getOverview` / `listPeople`. Layout follows console ink/hairline tokens: PageHeader actions, investigative assistant run (steps + findings + human-only gate), people preview table linking to the People route, and a page-local `w-[344px]` techniques/access rail.

## Commit

- `2a661a2` — `feat(console): compose Overview page from Northridge fixtures`

Base HEAD before this task: `af918b5` (nested case routes).

## What changed

### Created
- `src/features/console/pages/overview-page.tsx` — composed Overview UI
- `src/features/console/pages/overview-page.test.tsx` — title + human-only gate copy

### Modified
- `src/routes/console/cases/$caseId/overview.tsx` — wires `OverviewPage` via `OverviewRoute`

## Composition

| Section | Implementation |
| --- | --- |
| Header | `PageHeader` + Request approval (outline) / New lead (primary + Phosphor Plus) |
| Assistant | Sparkle heading, `StatusDot` steps, offence-blue findings tags, Lock + human-only Review/Reject |
| People | shadcn `Table` + link to `/console/cases/$caseId/people` |
| Rail | Techniques + access at `w-[344px]` (page-local; Phase A deviation from shell slot) |

## Verification

| Check | Result |
| --- | --- |
| Failing test first (missing module) | Confirmed FAIL before implementation |
| `pnpm exec vitest run src/features/console/pages/overview-page.test.tsx` | PASS (1 test) |
| `pnpm typecheck` | PASS |
| `pnpm exec biome check --error-on-warnings` (scoped) | PASS |

## Notes / follow-ups

- Evidence/custody strip from Paper is deferred to Task 6 Evidence page.
- Rail remains page-local per Task 4 Phase A note.
- Full `pnpm verify` not required for this slice; scoped vitest + typecheck + biome passed.

## Follow-up: Important a11y (from Task 5 review)

**Status:** DONE

Addressed review findings on People role double-announcement and identical Review/Reject button names.

### Changes
- People table `StatusDot` is decorative (no `label`) when role text is visible — avoids duplicate accessible names.
- Human-only Review/Reject buttons use unique `aria-label`s: `Review: ${decision.label}` / `Reject: ${decision.label}`.
- Added test covering unique action labels.

### Verification
| Check | Result |
| --- | --- |
| `pnpm exec vitest run src/features/console/pages/overview-page.test.tsx` | PASS (2 tests) |

### Commit
- (pending) `fix(console): unique Overview action labels for a11y`
