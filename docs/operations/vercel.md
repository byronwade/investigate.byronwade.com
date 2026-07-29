# Vercel Deployment

This repository is connected to the Vercel project `investigate.byronwade.com`.

## Why `vercel.json` exists

The project previously used **Next.js**. Vercel can retain that framework preset after a migration, which causes preview deployments to fail (for example by invoking Next.js tooling that is no longer present).

`vercel.json` forces the correct preset:

```json
{
  "framework": "tanstack-start",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build"
}
```

This matches [Vercel's TanStack Start guidance](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel) for projects that previously used another framework.

## How the build works

1. Vercel installs with pnpm (pinned via `packageManager`)
2. `pnpm build` runs `NODE_ENV=production vite build`
3. Nitro detects the Vercel environment and emits the Vercel Functions output
4. TanStack Start SSR + server functions run on Fluid compute by default

## Environment variables

Set in the Vercel project settings (Preview + Production as needed):

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_APP_NAME` | No | Defaults to `Investigate` |
| `VITE_APP_URL` | Recommended | Public origin for metadata (preview URL or production domain) |
| `VITE_ENABLE_ANALYTICS` | No | `true` / `false`, default `false` |
| `SERVER_SESSION_SECRET` | No | Optional future server-only secret (≥ 32 chars) |

Blank public env values are treated as unset so schema defaults apply.

## Dashboard checklist

If Git deployments still fail after `vercel.json` is present:

1. Project → Settings → Build and Deployment
2. Framework Preset = **TanStack Start**
3. Install / Build commands match `vercel.json` (or leave overridden by the file)
4. Node.js version ≥ 22
5. Redeploy the latest commit
