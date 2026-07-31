/**
 * Convert a Paper get_jsx (inline-styles) JSON dump into a console screen module.
 *
 * Usage:
 *   node scripts/paper-jsx-to-screen.mjs <input.json|txt> <slug> <Title>
 */
import fs from 'node:fs';
import path from 'node:path';

const [inputPath, slug, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ') || slug;

if (!inputPath || !slug) {
  console.error('Usage: node scripts/paper-jsx-to-screen.mjs <input|-> <slug> <Title>');
  process.exit(1);
}

const raw =
  inputPath === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(inputPath, 'utf8');
let jsx;
try {
  const data = JSON.parse(raw);
  jsx = data.jsx ?? data;
} catch {
  jsx = raw;
}

if (typeof jsx !== 'string') {
  console.error('Could not find jsx string');
  process.exit(1);
}

let body = jsx.trim();
if (body.startsWith('(') && body.endsWith(')')) {
  body = body.slice(1, -1).trim();
}

body = body
  .replaceAll("fontFamily: 'system-ui, sans-serif'", "fontFamily: 'var(--console-font-sans)'")
  .replaceAll(
    'fontFamily: "system-ui, sans-serif"',
    "fontFamily: 'var(--console-font-sans)'",
  )
  .replaceAll(
    "fontFamily: '\"Geist Mono\", system-ui, sans-serif'",
    "fontFamily: 'var(--console-font-mono)'",
  )
  .replaceAll(
    'fontFamily: \'"Geist Mono", system-ui, sans-serif\'',
    "fontFamily: 'var(--console-font-mono)'",
  )
  .replaceAll(
    "fontFamily: '\"Geist\", system-ui, sans-serif'",
    "fontFamily: 'var(--console-font-sans)'",
  )
  .replaceAll(
    "fontFamily: 'Geist Mono', system-ui, sans-serif",
    "fontFamily: 'var(--console-font-mono)'",
  )
  .replaceAll("fontFamily: 'Geist', system-ui, sans-serif", "fontFamily: 'var(--console-font-sans)'");

// Normalize outer artboard frame to fill the viewport instead of Paper absolute coords.
body = body.replace(
  /position:\s*'absolute',\s*/g,
  "position: 'relative', ",
);
body = body.replace(/top:\s*'0px',\s*/g, '');
body = body.replace(/left:\s*'0px',\s*/g, '');
body = body.replace(/width:\s*'1760px'/g, "width: '100%'");
body = body.replace(/height:\s*'fit-content'/g, "minHeight: '100vh'");
body = body.replace(/height:\s*'802px'/g, "minHeight: '100vh'");
body = body.replace(/overflow:\s*'clip'/g, "overflow: 'auto'");
body = body.replace(
  /(<div style=\{\{ backgroundColor: '[^']+', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', fontSynthesis: 'none', minHeight: '100vh')(?!, position: 'relative')/,
  "$1, position: 'relative'",
);

const pascal = slug
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');
const exportName = `${pascal}Screen`;

const outPath = path.join('src', 'features', 'console', 'screens', 'paper', `${slug}.tsx`);
const file = `/** Paper artboard: ${title} — exact visual export */
export function ${exportName}() {
  return (
    <div className="console-screen" data-screen="${slug}">
      ${body}
    </div>
  );
}
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, file);
console.info(`Wrote ${outPath} (${file.length} bytes)`);
