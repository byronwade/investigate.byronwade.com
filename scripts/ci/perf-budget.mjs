#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

/** Soft starter budgets (bytes, uncompressed on disk). Promote after baseline. */
const BUDGETS = {
  totalJs: 900 * 1024,
  totalCss: 120 * 1024,
  largestJsChunk: 450 * 1024,
};

const clientDirCandidates = [
  '.output/public/_build/assets',
  '.output/public/assets',
  'dist/client/assets',
];

/**
 * Lazy Investigation Console Paper dumps are route-split and intentionally large.
 * Budget total JS against shared/entry assets only — not the sum of every screen chunk.
 */
function loadConsoleScreenSlugs() {
  const registryPath = join('src', 'features', 'console', 'screens', 'registry.ts');
  if (!existsSync(registryPath)) return [];
  const source = readFileSync(registryPath, 'utf8');
  return [...source.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);
}

function isDeferredConsoleScreenChunk(filePath, slugs) {
  const name = basename(filePath);
  return slugs.some((slug) => name.startsWith(`${slug}-`));
}

function findAssetsDir() {
  for (const candidate of clientDirCandidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function listFiles(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else files.push(full);
  }
  return files;
}

const assetsDir = findAssetsDir();
if (!assetsDir) {
  console.error('perf-budget: build assets not found. Run pnpm build first.');
  process.exit(1);
}

const consoleSlugs = loadConsoleScreenSlugs();
const files = listFiles(assetsDir);
const jsFiles = files.filter((f) => f.endsWith('.js'));
const budgetedJsFiles = jsFiles.filter((f) => !isDeferredConsoleScreenChunk(f, consoleSlugs));
const cssFiles = files.filter((f) => f.endsWith('.css'));
const totalJs = budgetedJsFiles.reduce((n, f) => n + statSync(f).size, 0);
const deferredJs = jsFiles
  .filter((f) => isDeferredConsoleScreenChunk(f, consoleSlugs))
  .reduce((n, f) => n + statSync(f).size, 0);
const totalCss = cssFiles.reduce((n, f) => n + statSync(f).size, 0);
const largestJs = Math.max(0, ...budgetedJsFiles.map((f) => statSync(f).size));

/** @type {string[]} */
const failures = [];
if (totalJs > BUDGETS.totalJs) failures.push(`total JS ${totalJs} > ${BUDGETS.totalJs}`);
if (totalCss > BUDGETS.totalCss) failures.push(`total CSS ${totalCss} > ${BUDGETS.totalCss}`);
if (largestJs > BUDGETS.largestJsChunk) {
  failures.push(`largest JS chunk ${largestJs} > ${BUDGETS.largestJsChunk}`);
}

console.info('Performance budget check');
console.info(
  `  total JS (shared/entry): ${(totalJs / 1024).toFixed(1)} KiB / ${(BUDGETS.totalJs / 1024).toFixed(0)} KiB`,
);
console.info(
  `  deferred console screens: ${(deferredJs / 1024).toFixed(1)} KiB (${consoleSlugs.length} slugs, excluded from total)`,
);
console.info(
  `  total CSS: ${(totalCss / 1024).toFixed(1)} KiB / ${(BUDGETS.totalCss / 1024).toFixed(0)} KiB`,
);
console.info(
  `  largest JS: ${(largestJs / 1024).toFixed(1)} KiB / ${(BUDGETS.largestJsChunk / 1024).toFixed(0)} KiB`,
);

if (failures.length) {
  console.error(`Budget exceeded:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}

console.info('Performance budgets passed.');
