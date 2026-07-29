#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const steps = [
  ['pnpm', ['format:check']],
  ['pnpm', ['check']],
  ['pnpm', ['typecheck']],
  ['pnpm', ['test:coverage']],
  ['pnpm', ['knip']],
  // Exclude generated route tree: it participates in TanStack Router's intentional graph.
  [
    'pnpm',
    [
      'exec',
      'madge',
      '--circular',
      '--extensions',
      'ts,tsx',
      '--exclude',
      'routeTree\\.gen\\.ts',
      'src',
    ],
  ],
  ['pnpm', ['build']],
  ['pnpm', ['bundle:report']],
  ['pnpm', ['perf']],
  ['pnpm', ['test:e2e:smoke']],
  ['pnpm', ['test:a11y']],
];

function run(command, args) {
  console.info(`\n==> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.error(`\nVerification failed: ${command} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

console.info('Running full local verification pipeline');
for (const [command, args] of steps) {
  run(command, args);
}
console.info('\nAll verification steps passed.');
