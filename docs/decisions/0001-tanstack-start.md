# ADR: TanStack Start

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

Need a production React full-stack framework with first-class routing, SSR, and server functions without adopting RSC.

## Decision

Use current stable TanStack Start with React, file-based TanStack Router, and server functions.

## Consequences

Type-safe routing and SSR aligned with TanStack ecosystem; smaller vendor surface than Next.js for this foundation.

## Alternatives considered

Next.js App Router, Remix/React Router framework mode
