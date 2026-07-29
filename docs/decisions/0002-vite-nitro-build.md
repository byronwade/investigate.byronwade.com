# ADR: Vite + Nitro build/deploy

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

TanStack Start supports Vite and Rsbuild. Need fastest stable option with Node deployment.

## Decision

Use Vite 8 as the build system (official default path) and Nitro as the Node deployment adapter selected by the TanStack CLI.

## Consequences

Best framework compatibility and docs fidelity. Nitro package is currently published on a beta channel — documented limitation; still the official CLI Node path.

Because this repository was previously a Next.js app linked to Vercel, `vercel.json` sets `"framework": "tanstack-start"` so Vercel preview/production builds do not keep using a stale Next.js preset.

## Alternatives considered

Rsbuild (newer alternate), Cloudflare/Netlify adapters, raw Node without Nitro
