# Investigation Console App (Phase C) Implementation Plan

**Goal:** Rebuild remaining Paper screens onto nested `/console/...` routes with shared `AgencyShell` / `CaseShell`, typed fixtures, shadcn + Phosphor Duotone — keep `/console/reference` until parity sign-off.

**Spec:** `docs/superpowers/specs/2026-07-30-investigation-console-app-design.md`  
**Branch:** `design/investigation-console`

## Architecture

| Piece | Role |
| --- | --- |
| `AgencyShell` | Classification strip · top bar · sidebar · main · optional rail (no case tabs) |
| `CaseShell` | Unchanged chrome + case tabs for case-scoped pages |
| Pathless layout `_workspace` | Wraps agency/media/system/docs product routes |
| `src/features/console/data/agency.ts` | Agency-level fixtures + getters |
| Pages only fill main (+ rail via `ConsoleRailContext`) |

## Route map

| Path | Shell | Batch |
| --- | --- | --- |
| `/console` | redirect → command-center | 1 |
| `/console/command-center` | Agency | 1 |
| `/console/intake` | Agency | 1 |
| `/console/intelligence` | Agency | 1 |
| `/console/reports` | Agency | 1 |
| `/console/oversight` | Agency | 1 |
| `/console/records` | Agency | 1 |
| `/console/incidents` | Agency | 1 |
| `/console/people-orgs` | Agency | 1 |
| `/console/prosecution` | Agency | 1 |
| `/console/cases` | Agency (portfolio) | 1 |
| `/console/scenes` | Agency | 1 |
| `/console/interviews` | Agency | 1 |
| `/console/media/{field-capture,video-review,audio-examination,photo-canvas}` | Agency | 2 |
| `/console/administration` | Agency | 3 |
| `/console/local-mode` | Agency | 3 |
| `/console/empty-states` | Agency | 3 |
| `/console/handoff` | Agency | 3 |
| `/console/search` | Agency | 3 |
| `/console/court-production` | Agency | 3 |
| `/console/foundations`, `/console/motion` | Agency (docs) | 3 |
| `/console/cases/$caseId/{plan,analysis,scene,legal,interview,digital,forensics,discovery,approvals,closure}` | Case | 3 |
| `/console/cases/$caseId/people/$personId` | Case | 3 |
| `/console/reference…` | Bare (Paper dumps) | keep |

## Batches

1. Foundation + agency workspace (shell, nav, fixtures, 12 pages)
2. Media tools (4 pages)
3. System/modes + case extras + foundations docs
4. Wire palette/sidebar/redirect/docs; tests; `pnpm verify`

## Constraints

- Do not edit `routeTree.gen.ts` by hand — `pnpm generate-routes`
- Pin exact deps if any new packages (prefer none)
- Conventional Commits per logical batch
- Paper dumps stay at `/console/reference`
