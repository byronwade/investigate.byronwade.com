# ADR: Feature-oriented source structure

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

Need scalable boundaries for humans and agents.

## Decision

Organize by features/ + lib/{client,server,shared} + components/ui.

## Consequences

Clear ownership and import rules; avoids premature package splits.

## Alternatives considered

Layer-only structure, monorepo packages day one
