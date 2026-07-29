# ADR: Playwright

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

Need reliable E2E and accessibility automation.

## Decision

Use Playwright with smoke/chromium on PRs and firefox/webkit on schedule; axe for a11y.

## Consequences

Multi-browser, auto webServer, traces on retry.

## Alternatives considered

Cypress
