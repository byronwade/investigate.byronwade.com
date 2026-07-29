# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a vulnerability

Do **not** open a public GitHub issue for security vulnerabilities.

Prefer:

1. GitHub Security Advisories for this repository
2. A private email to the repository owner if advisories are unavailable

Include:

- Impact description
- Reproduction steps or proof of concept
- Affected commit / version
- Any suggested remediation

You should receive an acknowledgement within 7 days.

## Security baseline

- No secrets in source control — use `.env.example` only
- Centralized env access via `src/lib/shared/env.ts`
- Server-only modules under `src/lib/server/`
- Security headers helper in `src/lib/server/security-headers.ts`
- No untrusted HTML rendering (`dangerouslySetInnerHTML` forbidden by Biome)
- External links use `rel="noopener noreferrer"`
- Dependency updates via Dependabot with review
- Lockfile committed; CI uses `pnpm install --frozen-lockfile`
- Conventional Commits and PR reviews before merge

## Headers

Production responses should include:

- Content-Security-Policy (pragmatic; fonts allowed from Google Fonts)
- Referrer-Policy: strict-origin-when-cross-origin
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY / CSP frame-ancestors 'none'
- Permissions-Policy denying powerful APIs by default
- HSTS in production behind HTTPS

Wire `getSecurityHeaders()` into the Nitro / hosting layer when deploying.

## Cookies

When auth is added later:

- Prefer `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict`
- Never store long-lived secrets in localStorage

## Secret scanning

Enable GitHub secret scanning and push protection on the repository.
Never paste tokens into issues, PRs, or chat logs.
