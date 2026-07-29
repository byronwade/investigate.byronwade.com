# ADR: Self-hosted GitHub runners

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

Org requires CI exclusively on approved local runners.

## Decision

All workflows use runs-on labels self-hosted,linux,x64,tanstack-ci; no GitHub-hosted images.

## Consequences

Control over toolchain and data residency; owners must keep runners online.

## Alternatives considered

GitHub-hosted ubuntu-latest
