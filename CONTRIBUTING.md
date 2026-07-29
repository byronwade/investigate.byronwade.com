# Contributing

Thank you for contributing to Investigate.

Contributors and AI agents must follow repository-local Markdown instructions. Instruction precedence is defined in [AGENTS.md](./AGENTS.md).

## Prerequisites

- Node.js 22 LTS (see `.nvmrc`)
- pnpm 10.33.3 (pinned via `packageManager`)
- Git
- For E2E: Playwright browsers (`pnpm exec playwright install`)

## Initial setup

```bash
pnpm install
cp .env.example .env
pnpm generate-routes
pnpm dev
```

## Package-manager policy

- Use **pnpm only**
- Commit `pnpm-lock.yaml`
- CI installs with `pnpm install --frozen-lockfile`
- Do not introduce npm/yarn lockfiles

## Branch naming

- `cursor/<short-description>-<id>` for agent branches
- `feat/<short-description>` for features
- `fix/<short-description>` for fixes
- `chore/<short-description>` for maintenance
- `docs/<short-description>` for documentation

Default branch: `main`.

## Development workflow

1. Create a branch from `main`
2. Make focused changes
3. Run relevant checks while iterating
4. Run `pnpm verify` before opening a PR
5. Open a PR using the template

## Environment setup

Copy `.env.example` to `.env`. Document every new variable in `.env.example` and `src/lib/shared/env.ts`.

Never commit real secrets.

## Available commands

See the command table in [AGENTS.md](./AGENTS.md). Canonical full pipeline: `pnpm verify`.

## Code style

- Biome formats and lints — do not add Prettier
- 2-space indentation, single quotes, semicolons
- Organize imports via Biome assist
- Warnings are treated as errors in `pnpm check`

## TypeScript

- `strict` and additional strict flags enabled (see `tsconfig.json`)
- `verbatimModuleSyntax` is intentionally **disabled** (TanStack Start server/client boundary guidance)
- No `any` except at documented untyped boundaries
- Prefer `unknown` + Zod validation, discriminated unions, exhaustive switches
- Use type-only imports where Biome requires

## Architecture boundaries

- Do not import `src/lib/server/*` from client components or client libs
- Routes stay thin; put logic in `src/features` / `src/lib`
- No database/auth/payment vendors unless explicitly requested
- Extension points are documented in `docs/architecture/`

## UI requirements

Read [DESIGN.md](./DESIGN.md) before any user-facing UI change.

## Testing expectations

- Unit tests for pure logic
- Component tests with Testing Library (accessible queries)
- Integration tests for shared behavior
- Playwright smoke + a11y on PRs; full browsers on schedule
- Coverage thresholds enforced in `pnpm test:coverage`

## Accessibility

- Keyboard operable controls
- Visible focus styles
- Labels for inputs
- Serious/critical axe violations fail CI
- Automated checks do not replace manual testing

## Performance

- Prefer SSR and route-level code splitting
- Avoid unnecessary client JS and barrel-file traps
- Run `pnpm perf` after builds
- Measure before optimizing

## Dependency policy

- Every dependency needs a clear responsibility
- Pin exact versions in `package.json`
- Prefer platform APIs
- Majors are ignored by Dependabot grouping and require a deliberate PR
- Run `pnpm deps:check` to report outdated packages without mutating the tree
- `pnpm audit` has false positives — triage thoughtfully

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`, `perf:`

Lefthook validates commit messages.

## Pull requests

- Fill out the PR template
- Keep PRs reviewable
- Squash merge recommended
- Required checks must pass on self-hosted runners

## Required checks

- Lockfile-faithful install
- Biome check
- Typecheck
- Coverage tests
- Knip
- Production build
- Playwright smoke + a11y

## Documentation requirements

Update docs when you change:

- Scripts
- Environment variables
- Architecture
- CI / runner setup
- User-visible behavior

## Security reporting

See [SECURITY.md](./SECURITY.md). Never disclose vulnerabilities in public issues.

## Self-hosted CI limitations

- All workflows use labels: `self-hosted`, `linux`, `x64`, `tanstack-ci`
- Jobs will queue if no runner is online
- Fork PRs must not receive repository secrets
- See docs/operations/self-hosted-runners.md

## Troubleshooting local runners

1. Confirm the runner service is online in GitHub → Settings → Actions → Runners
2. Run `pnpm runner:check` on the host
3. Clear stale workspaces under the runner directory
4. Re-register if the token was rotated

## Updating dependencies safely

1. Read changelogs for majors
2. Update in a dedicated branch
3. Run `pnpm verify`
4. For TanStack packages, update as a group

## Definition of done

- Behavior correct and tested
- Types/lint/knip/build/e2e smoke green via `pnpm verify`
- Docs updated
- No secrets or artifacts committed
- PR description explains intent and validation
