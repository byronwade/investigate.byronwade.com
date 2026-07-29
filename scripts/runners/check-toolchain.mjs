#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const checks = [
  ['node', ['-v']],
  ['pnpm', ['-v']],
  ['git', ['--version']],
];

let failed = false;
for (const [command, args] of checks) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(`Missing required tool: ${command}`);
    failed = true;
  } else {
    console.info(`${command}: ${(result.stdout || result.stderr).trim()}`);
  }
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 22) {
  console.error('Node.js 22 LTS or newer is required');
  failed = true;
}

if (failed) process.exit(1);
console.info('Runner toolchain looks ready.');
