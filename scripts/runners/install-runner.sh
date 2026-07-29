#!/usr/bin/env bash
set -euo pipefail

# Repository-scoped GitHub Actions runner bootstrap helper.
# Do NOT commit registration tokens. Pass RUNNER_TOKEN at runtime.

ROOT_DIR="${RUNNER_DIR:-$HOME/actions-runners/investigate}"
REPO_URL="${REPO_URL:-https://github.com/byronwade/investigate.byronwade.com}"
RUNNER_VERSION="${RUNNER_VERSION:-2.323.0}"
LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,tanstack-ci}"

if [[ -z "${RUNNER_TOKEN:-}" ]]; then
  echo "RUNNER_TOKEN is required (repository Settings → Actions → Runners → New self-hosted runner)"
  exit 1
fi

mkdir -p "$ROOT_DIR"
cd "$ROOT_DIR"

if [[ ! -f ./config.sh ]]; then
  curl -fsSL -o actions-runner-linux-x64.tar.gz \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
  tar xzf actions-runner-linux-x64.tar.gz
fi

./config.sh --url "$REPO_URL" --token "$RUNNER_TOKEN" --labels "$LABELS" --unattended --replace
echo "Runner configured with labels: $LABELS"
echo "Install as a service with: sudo ./svc.sh install && sudo ./svc.sh start"
