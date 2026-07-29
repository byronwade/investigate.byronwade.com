#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

function run(command, args) {
  console.info(`==> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const changelog = readFileSync('CHANGELOG.md', 'utf8');

if (!pkg.version) {
  console.error('package.json missing version');
  process.exit(1);
}

if (!changelog.includes(pkg.version) && pkg.version !== '0.1.0') {
  console.error(`CHANGELOG.md does not mention version ${pkg.version}`);
  process.exit(1);
}

run('pnpm', ['verify']);

if (existsSync('.output/server/index.mjs')) {
  console.info('Release artifact present: .output/server/index.mjs');
}

console.info('Release readiness checks passed (non-publishing).');
