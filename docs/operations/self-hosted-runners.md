# Self-Hosted GitHub Actions Runners

All workflows target labels:

`self-hosted`, `linux`, `x64`, `tanstack-ci`

Configure labels via runner registration (`RUNNER_LABELS` in `scripts/runners/install-runner.sh`).

## Recommendations

| Resource | Recommendation |
| --- | --- |
| OS | Ubuntu 22.04+ LTS |
| CPU | 4+ cores |
| Memory | 16 GB+ |
| Disk | 50 GB+ free SSD |
| Account | Dedicated low-privilege OS user |
| Isolation | Prefer a dedicated machine/VM; not a daily workstation |

## Required software

- Git
- Node.js 22 LTS
- pnpm 10.33.3
- curl, ca-certificates, build essentials for Playwright deps
- Docker optional (not required by default workflows)

Validate with:

```bash
pnpm runner:check
```

## Registration (repository-scoped)

1. GitHub → Settings → Actions → Runners → New self-hosted runner
2. Export `RUNNER_TOKEN` in your shell (do not commit)
3. Run `scripts/runners/install-runner.sh`
4. Install service: `sudo ./svc.sh install && sudo ./svc.sh start`

## Operations

| Task | Action |
| --- | --- |
| Start/stop | `sudo ./svc.sh start\|stop\|status` |
| Update runner | Download new release; stop service; replace; restart |
| Offline diagnosis | Check service logs under runner `_diag` / journalctl |
| Stale workspaces | Remove `_work` contents after stopping the runner |
| Cache management | Clear pnpm store / Playwright browsers carefully on disk pressure |
| Rotate token | Remove runner in GitHub UI; re-register with new token |
| Remove runner | `./config.sh remove --token <TOKEN>` then delete service |

## Security risks

- Runners execute PR code — treat as untrusted compute
- Never expose repository secrets to untrusted fork PRs
- Do not place personal SSH keys or unrelated cloud credentials on the runner
- Containers are not a complete security boundary
- Prefer ephemeral runners when possible
