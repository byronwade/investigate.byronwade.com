# Task 6 Report: Timeline, Evidence, Leads, People pages

## Status

**DONE**

## Summary

Replaced case-route stubs with composed pages driven by `listTimeline`, `listEvidence`, `listLeads`, and `listPeople`. Each page uses `PageHeader`, console tokens, and shadcn/Phosphor primitives per the brief (timeline list, evidence table + custody badges, 4-column leads board, people table + decorative `StatusDot`).

## Commit

- (pending) `feat(console): add timeline evidence leads people pages`

Base HEAD before this task: `6a3fbd6` (Overview a11y follow-up).

## What changed

### Created
- `src/features/console/pages/timeline-page.tsx` — event list from `listTimeline`
- `src/features/console/pages/evidence-page.tsx` — `Table` + custody `Badge` from `listEvidence`
- `src/features/console/pages/leads-page.tsx` — triage/active/blocked/done board from `listLeads`
- `src/features/console/pages/people-page.tsx` — `Table` + role `StatusDot` from `listPeople`
- `src/features/console/pages/case-pages.test.tsx` — unique heading + fixture row/card per page

### Modified
- `src/routes/console/cases/$caseId/timeline.tsx` → `TimelinePage`
- `src/routes/console/cases/$caseId/evidence.tsx` → `EvidencePage`
- `src/routes/console/cases/$caseId/leads.tsx` → `LeadsPage`
- `src/routes/console/cases/$caseId/people.tsx` → `PeoplePage`

## Verification

| Check | Result |
| --- | --- |
| Failing test first (missing modules) | Confirmed FAIL before implementation |
| `pnpm exec vitest run src/features/console/pages` | PASS (6 tests: 2 overview + 4 case pages) |
| `pnpm exec biome check --error-on-warnings` (scoped) | PASS |

## Notes / follow-ups

- People role dots stay decorative when role text is visible (same a11y pattern as Overview follow-up).
- Full `pnpm verify` not required for this slice; scoped vitest is the brief gate.
