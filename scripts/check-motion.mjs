// Post-build barrier (spec 018): the motion grammar holds in what ships.
// Runs from `postbuild`, last, after check-no-dev-routes.
//
// First scan: every built stylesheet (`_astro/*.css`) and every <style>
// block of every page — Astro's `inlineStylesheets: 'auto'` puts the
// small ones there — through scanMotion (src/lib/motion-scan.mjs): no
// literal duration or curve, no iteration count, in any transition or
// animation. The source scan in motion.test.mjs catches the site's own
// rules; this one catches whatever the build adds.
//
// Second scan, the no-script pin: every page's markup, with its <script>
// and <style> blocks removed first (the site's own rules and scripts name
// these attributes), must carry no motion state attribute — data-motion,
// data-shown, data-moving, data-understudy — since a frame the script
// hasn't touched must be visible; no `autoplay`; and no
// `view-transition-name` inside a `style="…"` attribute.
//
// `<dir>/pagefind/` is excluded: pagefind's UI stylesheet is a third
// party's, on the search page alone, and its transitions are not the
// site's (plan.md, "Known limitations").
//
//   node scripts/check-motion.mjs [dir]   # default: dist
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { scanMotion } from '../src/lib/motion-scan.mjs';

const root = process.argv[2] ?? 'dist';
const excluded = join(root, 'pagefind');

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (path === excluded) continue;
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

const STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const SCRIPT = /<script\b[^>]*>[\s\S]*?<\/script>/gi;

/** An attribute on a tag, and the message its presence earns. */
const ATTRIBUTES = [
  ...['data-motion', 'data-shown', 'data-moving', 'data-understudy'].map((name) => ({
    name,
    what: 'a frame hidden by default',
  })),
  { name: 'autoplay', what: 'an element that plays by itself' },
].map((one) => ({ ...one, pattern: new RegExp(`<[a-zA-Z][^>]*\\s${one.name}(?=[\\s=/>])`) }));
const INLINE_NAME = /style="[^"]*view-transition-name/;

const problems = [];
const literal = (found) =>
  problems.push(
    `[check-motion] literal motion in ${found.file}: ${found.declaration} — ${found.findings
      .map((text) => `"${text}"`)
      .join(', ')}`,
  );

let stylesheets = 0;
let astro = [];
try {
  astro = await readdir(join(root, '_astro'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
for (const name of astro) {
  if (extname(name) !== '.css') continue;
  const file = join(root, '_astro', name);
  stylesheets += 1;
  scanMotion(await readFile(file, 'utf8'), file).forEach(literal);
}

let pages = 0;
for await (const file of files(root)) {
  if (extname(file) !== '.html') continue;
  pages += 1;
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(STYLE)) {
    stylesheets += 1;
    scanMotion(match[1], file).forEach(literal);
  }
  const markup = html.replace(SCRIPT, '').replace(STYLE, '');
  for (const { name, what, pattern } of ATTRIBUTES)
    if (pattern.test(markup)) problems.push(`[check-motion] ${what} in ${file}: ${name}`);
  if (INLINE_NAME.test(markup))
    problems.push(`[check-motion] an inline transition name in ${file}: view-transition-name`);
}

if (problems.length > 0) {
  for (const line of problems) console.error(line);
  process.exit(1);
}
console.log(
  `[check-motion] no literal duration or curve in ${stylesheets} stylesheets; no hidden frame, inline transition name or autoplay in ${pages} pages.`,
);
