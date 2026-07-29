# Testing Strategy

## Pyramid

1. **Unit** — pure functions, schemas, transforms (Vitest node env)
2. **Component** — user-visible behavior (Vitest jsdom + Testing Library + user-event)
3. **Integration** — shared composition / form behavior
4. **E2E** — Playwright smoke, regression, mobile, a11y
5. **Manual** — exploratory accessibility and UX review

## Network mocking

Prefer MSW when HTTP mocking is required. Avoid fragile global `fetch` stubs.

## Coverage

Global thresholds (Vitest):

- Statements/lines/functions: 80%
- Branches: 75%

Excluded: generated route tree, route bootstrapping files, declaration files.

## Accessibility

`@axe-core/playwright` fails on serious/critical violations. Automated checks do not replace manual testing.

## E2E projects

| Project | When |
| --- | --- |
| smoke | Every verify / PR |
| chromium / mobile | PR broader / main |
| a11y | Every verify / PR |
| firefox / webkit | Scheduled / manual full |
