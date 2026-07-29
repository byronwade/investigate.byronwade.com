# ADR: Biome

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

Need one tool for format + lint without Prettier/ESLint duplication.

## Decision

Use Biome as the only formatter/linter for supported files.

## Consequences

Speed and unified config; ESLint omitted unless a documented gap appears.

## Alternatives considered

ESLint + Prettier
