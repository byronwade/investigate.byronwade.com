# AGENTS.md

Instructions for coding agents working in this repository.

## Instruction precedence

1. Explicit task instructions from the user
2. Nearest nested `AGENTS.md` (if introduced later)
3. This root `AGENTS.md`
4. [CONTRIBUTING.md](./CONTRIBUTING.md)
5. [DESIGN.md](./DESIGN.md) for all user-facing UI
6. Architecture decision records in `docs/decisions/`
7. README.md and other documentation

Repository-local Markdown instructions override generic agent defaults.

## Before you change anything

1. Read `AGENTS.md`, `CONTRIBUTING.md`, `DESIGN.md`, `README.md`, and relevant ADRs
2. Inspect the repository structure — do not assume architecture from memory
3. Search for existing components, hooks, and utilities before adding new ones
4. Keep changes scoped to the request — no unrelated refactors
5. Preserve existing architecture unless the task requires a deliberate change

## Non-negotiable rules

1. Never bypass tests, linting, type checks, hooks, or CI requirements
2. Never weaken a rule simply to make a check pass
3. Never hide errors with broad ignores, unsafe casts, non-null assertions, blanket suppressions, or disabled checks
4. Prefer strict TypeScript and narrow types (`unknown` + validation over `any`)
5. Use `src/lib/server/` for secrets and privileged operations
6. Never expose secrets to browser bundles — only `VITE_*` public env via `getPublicEnv()`
7. Follow `DESIGN.md` for all UI work; use design tokens, not one-off hardcoded styling
8. Maintain accessibility (keyboard, focus-visible, labels, semantics)
9. Add or update tests when behavior changes
10. Update documentation when architecture, scripts, env vars, behavior, or setup changes
11. Run the smallest relevant tests during development and `pnpm verify` before completion
12. Report all commands executed and any checks that could not be run
13. Never claim success when a check is failing
14. Avoid adding dependencies when the platform or an existing dependency already provides the capability
15. Confirm package compatibility before installation; pin exact versions
16. Keep bundle impact in mind; prefer direct imports over accidental large barrels
17. Keep browser/client boundaries minimal
18. Prefer server-rendered output and progressive enhancement where practical
19. Avoid unnecessary client state and premature memoization
20. Measure before making performance claims
21. Use Conventional Commits if creating commits
22. Leave the working tree understandable and clean

## Architecture reminders

- Framework: TanStack Start (React) with file-based TanStack Router
- Build: Vite + Nitro Node adapter (see ADR-0002)
- Feature code: `src/features/`
- Shared UI primitives: `src/components/ui/`
- Shared pure logic: `src/lib/shared/`
- Client-only helpers: `src/lib/client/`
- Server-only helpers: `src/lib/server/`
- Routes: `src/routes/` (file-based). `src/routeTree.gen.ts` is generated — do not edit
- Env: only through `src/lib/shared/env.ts`

## Command reference

| Task | Command |
| --- | --- |
| Development | `pnpm dev` |
| Build | `pnpm build` |
| Start production | `pnpm start` |
| Format | `pnpm format` |
| Format check | `pnpm format:check` |
| Lint | `pnpm lint` |
| Biome check | `pnpm check` |
| Type check | `pnpm typecheck` |
| Unit tests | `pnpm test:unit` |
| Integration/component tests | `pnpm test:integration` |
| All Vitest | `pnpm test` |
| Coverage | `pnpm test:coverage` |
| E2E (smoke + chromium) | `pnpm test:e2e` |
| E2E smoke | `pnpm test:e2e:smoke` |
| E2E all browsers | `pnpm test:e2e:all` |
| Accessibility E2E | `pnpm test:a11y` |
| Dead-code analysis | `pnpm knip` |
| Dependency report | `pnpm deps:check` |
| Performance budgets | `pnpm perf` |
| Full verification | `pnpm verify` |
| Local CI parity | `pnpm ci:local` |

## Required completion checklist

- [ ] Scope matches the request
- [ ] Existing utilities reused where possible
- [ ] UI changes follow DESIGN.md
- [ ] Server/client boundaries preserved
- [ ] Types are strict; no unjustified `any` / `!`
- [ ] Tests added/updated
- [ ] Docs updated if needed
- [ ] `pnpm verify` executed and passing (or failures honestly reported)
- [ ] No secrets, artifacts, or generated noise committed
