# Architecture Overview

## Rendering strategy

TanStack Start renders full documents on the server by default. Routes use loaders for server data. Client components are used where interactivity requires them (theme toggle, forms, Query refresh).

## Routing

File-based routes in `src/routes` via TanStack Router. The route tree is generated to `src/routeTree.gen.ts`.

Includes:

- Root layout, error, not-found, pending states
- Route metadata via `head`
- Intent preloading
- Focus management on navigation

## Server/client boundaries

| Path | Allowed to contain |
| --- | --- |
| `src/lib/server` | Secrets, privileged ops, Node APIs |
| `src/lib/client` | Browser APIs, Query client helpers |
| `src/lib/shared` | Isomorphic pure logic + public env |

Server functions (`createServerFn`) are the bridge for mutations/queries that must run on the server.

## Data flow

1. Route loader calls server function / server util
2. SSR sends HTML + dehydrated state as applicable
3. TanStack Query used only when client caching/refetch adds value (status panel)

No database is wired. Persistence is an extension point.

## Styling and design tokens

Tailwind CSS v4 via `@tailwindcss/vite`. Semantic tokens in `src/styles/tokens.css`. See DESIGN.md.

## Testing strategy

See docs/testing/strategy.md.

## Dependency boundaries

- Features may import components, hooks, lib
- Components should not import features
- Client modules must not import server modules
- Routes orchestrate; they should stay thin

## Performance strategy

- Route-level code splitting (framework default)
- Minimal root client JS
- Fonts via preconnect + display=swap
- Hashed assets from Vite for long-cache immutable files
- Bundle report + budgets in CI scripts
- Circular dependency check via madge

## CI architecture

GitHub Actions → self-hosted runners only (`self-hosted,linux,x64,tanstack-ci`). Workflows call repository scripts (`pnpm verify`) for local parity.

## Security posture

- Typed env separation
- Security header helper
- No untrusted HTML
- Dependency pinning + Dependabot
- Least-privilege workflow permissions
