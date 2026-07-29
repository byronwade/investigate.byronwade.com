#!/usr/bin/env node
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const clientDirCandidates = [
  '.output/public/_build/assets',
  '.output/public/assets',
  'dist/client/assets',
];

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
  console.error('No client assets directory found after build.');
  process.exit(1);
}

const files = listFiles(assetsDir);
const jsFiles = files.filter((f) => f.endsWith('.js'));
const cssFiles = files.filter((f) => f.endsWith('.css'));

const sum = (paths) => paths.reduce((total, file) => total + statSync(file).size, 0);
const jsBytes = sum(jsFiles);
const cssBytes = sum(cssFiles);
const largestJs = jsFiles
  .map((file) => ({ file, size: statSync(file).size }))
  .sort((a, b) => b.size - a.size)[0];

console.info('Bundle report');
console.info(`  assets dir: ${assetsDir}`);
console.info(`  js files: ${jsFiles.length} (${(jsBytes / 1024).toFixed(1)} KiB)`);
console.info(`  css files: ${cssFiles.length} (${(cssBytes / 1024).toFixed(1)} KiB)`);
if (largestJs) {
  console.info(`  largest js: ${largestJs.file} (${(largestJs.size / 1024).toFixed(1)} KiB)`);
}
