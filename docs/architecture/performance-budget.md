# Performance Budget

Starter budgets enforced by `pnpm perf` (uncompressed on-disk assets after build):

| Metric | Budget |
| --- | --- |
| Total JS (shared/entry) | 900 KiB |
| Total CSS | 120 KiB |
| Largest JS chunk (shared/entry) | 450 KiB |

Lazy Investigation Console Paper dumps (`src/features/console/screens/paper/*`, one chunk per `/console/<slug>` route) are excluded from the total/largest JS budgets so exact visual exports do not inflate the marketing-shell baseline. Their aggregate size is still printed by `pnpm perf` for visibility.

## Core Web Vitals / Lighthouse expectations

Configured in `lighthouserc.cjs` (warn-level initially for performance variance on self-hosted hardware):

| Category | Target |
| --- | --- |
| Performance | ≥ 0.85 (warn) |
| Accessibility | ≥ 0.95 (error) |
| Best practices | ≥ 0.90 (warn) |
| SEO | ≥ 0.90 (warn) |

## Promoting to blocking

1. Collect baselines on the self-hosted runner for a week
2. Tighten budgets to p75 observations + margin
3. Remove `continue-on-error: true` from `.github/workflows/performance.yml`
