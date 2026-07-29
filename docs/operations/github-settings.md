# Recommended GitHub Repository Settings

These cannot be applied from the codebase alone. Configure in GitHub UI:

## General

- Default branch: `main`
- Squash merge: enabled (preferred)
- Merge commit / rebase: optional off
- Automatically delete head branches: enabled

## Branch protection (`main`)

- Require pull request before merging
- Require status checks:
  - `Quality pipeline` (PR Validation)
  - Optionally `Full quality suite` after stabilising
- Require branches to be up to date before merging
- Restrict force pushes
- Do not allow bypassing for administrators in production orgs if possible

## Actions

- Require self-hosted runners online with labels `self-hosted,linux,x64,tanstack-ci`
- Disable GitHub-hosted runners for this repo if your plan allows
- Fork PR secrets: disabled

## Security

- Dependabot alerts + security updates
- Secret scanning + push protection
- Private vulnerability reporting

## CODEOWNERS

Update `.github/CODEOWNERS` with real teams/users, then enable required review from Code Owners.
