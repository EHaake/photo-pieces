// Post-build barrier (spec 019): what the image page keeps private stays
// private in what ships, and the compare has one shape. Runs from
// `postbuild`, after check-no-gps.
//
// First scan, the loupe: every image page (`<dir>/images/**/index.html`)
// names its loupe file in `data-loupe-src`. That file must exist under
// <dir> (so the pruner cannot have taken it) and be no larger than the
// deploy target's per-file limit. A stage that also carries
// `data-loupe-detail` names a detail export — a larger file made only
// for the loupe — and its URL must occur nowhere else in any text file
// in <dir>: no `src`, no `srcset`, no `og:image`, no gallery page, no
// `rss.xml`, no stylesheet or script. The scan reads the URLs the pages
// declare rather than recognising detail exports by their emitted names:
// how Vite names a file is not a contract, and a rule keyed to a name
// pattern would pass silently the day the pattern changed. An own-file
// loupe (no `data-loupe-detail`) may share a candidate with the page's
// `srcset` — Astro dedupes equal transforms — so its URL is not checked.
//
// Second scan, the no-script pin: every page's markup, with its <script>
// and <style> blocks removed first (the site's own rules and scripts name
// these), carries no state only the scripts write — no loupe or compare
// state attribute, no class naming a part the compare or loupe script
// builds. A page as shipped is the page without its script.
//
// Third scan, one compare shape: every `.compare` in any page's markup —
// a piece's, a sidecar story's, the image page's — has the shape in
// COMPARE_CLASSES, read by a small tag-depth walk from the figure's open
// tag to its matching close: frames > two or more stages, each stage >
// pane (holding its img) then caption > label and at most one note, and
// nothing else. Only the compare's own classes (`compare-…`) and the
// pane's img are read; an element carrying none of them — a wrapper, a
// class Astro's image pipeline adds — is transparent, its children read
// as its parent's. Two builders (the transform and the image page) make
// the markup; this makes their agreement a fact of every build.
//
// `<dir>/pagefind/` is excluded: pagefind's index is a third party's.
//
//   node scripts/check-private-files.mjs [dir]   # default: dist
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, sep } from 'node:path';
import { COMPARE_CLASSES } from '../src/lib/image-meta.mjs';

// Cloudflare Workers static assets: "Individual file size 25 MiB", Free
// and Paid alike — https://developers.cloudflare.com/workers/platform/limits/
// (Static Assets), checked 2026-09-24 at spec 019 (T1703).
const MAX_BYTES = 25 * 1024 * 1024;

const root = process.argv[2] ?? 'dist';
const excluded = join(root, 'pagefind');
const TEXT = new Set(['.html', '.xml', '.css', '.js', '.mjs', '.json', '.txt', '.svg', '.webmanifest', '.map']);

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (path === excluded) continue;
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

const STYLE = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const SCRIPT = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const COMMENT = /<!--[\s\S]*?-->/g;
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const CLASS = /\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

const classesOf = (attributes) => {
  const match = CLASS.exec(attributes);
  return match ? (match[1] ?? match[2] ?? match[3]).split(/\s+/).filter(Boolean) : [];
};
const attribute = (attributes, name) => {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(attributes);
  return match ? (match[1] ?? match[2]) : undefined;
};
const hasAttribute = (attributes, name) => new RegExp(`\\s${name}(?=[\\s=/>]|$)`, 'i').test(attributes);

/** States only the scripts write (plan.md, "The private-files barrier"). */
const STATE_ATTRIBUTES = [
  'data-js', 'data-view', 'data-narrow', 'data-settling', 'data-fresh',
  'data-part', 'data-loupe-ready', 'data-loupe-open', 'data-glide', 'data-dragging',
];
const STATE_CLASSES = new Set([
  'compare-line', 'compare-handle', 'compare-legend', 'compare-stop', 'compare-control',
  'compare-now', 'compare-tag', 'compare-slot', 'compare-hint',
  'loupe', 'loupe-layer', 'loupe-base', 'loupe-detail',
]);

/**
 * Every element with `class` token `root`, walked by tag depth from its
 * open tag to its matching close: `{ start, end, node }`, the node tree
 * holding only `compare-…`-classed elements and `img`.
 */
function compares(markup) {
  const found = [];
  const tags = [...markup.matchAll(TAG)];
  for (let i = 0; i < tags.length; i += 1) {
    const [, closing, , attributes] = tags[i];
    if (closing || !classesOf(attributes).includes(COMPARE_CLASSES.root)) continue;
    const top = { name: COMPARE_CLASSES.root, children: [] };
    const stack = [top]; // read nodes, innermost last
    const open = [top]; // every open element: its read node, or null
    let j = i + 1;
    for (; j < tags.length && open.length > 0; j += 1) {
      const [whole, isClose, tag, attrs] = tags[j];
      if (isClose) {
        if (open.pop()) stack.pop();
        continue;
      }
      const own = classesOf(attrs).filter((token) => token.startsWith('compare-'));
      const lower = tag.toLowerCase();
      const read = lower === 'img' || own.length > 0;
      const node = read ? { name: lower === 'img' ? 'img' : own.join('.'), children: [] } : null;
      if (node) stack[stack.length - 1].children.push(node);
      if (VOID.has(lower) || whole.endsWith('/>')) continue;
      open.push(node);
      if (node) stack.push(node);
    }
    const last = tags[j - 1];
    found.push({ start: tags[i].index, end: last.index + last[0].length, node: top });
    i = j - 1;
  }
  return found;
}

/** The first way a compare departs from the one shape, or null. */
function outOfShape(top) {
  const C = COMPARE_CLASSES;
  const names = (node) => node.children.map((child) => child.name);
  const stray = (node, allowed) => {
    const odd = node.children.find((child) => !allowed.includes(child.name));
    return odd ? `${node.name} > ${odd.name}, not part of the shape` : null;
  };
  const leaf = (node) => (node.children.length ? `${node.name} > ${node.children[0].name}, not part of the shape` : null);

  const first = stray(top, [C.frames]);
  if (first) return first;
  if (top.children.length !== 1) return `${C.root} > ${top.children.length} ${C.frames}, not one`;
  const frames = top.children[0];
  const inFrames = stray(frames, [C.stage]);
  if (inFrames) return inFrames;
  if (frames.children.length < 2) return `${C.frames} > ${frames.children.length} ${C.stage}, not two or more`;
  for (const stage of frames.children) {
    const inStage = stray(stage, [C.pane, C.caption]);
    if (inStage) return inStage;
    const seq = names(stage);
    if (!seq.includes(C.pane)) return `${C.stage} > no ${C.pane}`;
    if (!seq.includes(C.caption)) return `${C.stage} > no ${C.caption}`;
    if (seq.length !== 2) return `${C.stage} > ${seq.join(', ')}, not one ${C.pane} then one ${C.caption}`;
    if (seq[0] !== C.pane) return `${C.stage} > ${C.caption} before ${C.pane}`;
    const [pane, caption] = stage.children;
    const inPane = stray(pane, ['img']);
    if (inPane) return inPane;
    if (pane.children.length !== 1) return `${C.pane} > ${pane.children.length} img, not one`;
    const img = leaf(pane.children[0]);
    if (img) return img;
    const inCaption = stray(caption, [C.label, C.note]);
    if (inCaption) return inCaption;
    const parts = names(caption);
    if (parts[0] !== C.label) {
      return parts.includes(C.note) && !parts.includes(C.label)
        ? `${C.caption} > ${C.note} without ${C.label}`
        : `${C.caption} > no ${C.label} first`;
    }
    if (parts.length > 2 || (parts.length === 2 && parts[1] !== C.note)) {
      return `${C.caption} > ${parts.join(', ')}, not one ${C.label} and at most one ${C.note}`;
    }
    for (const part of caption.children) {
      const inside = leaf(part);
      if (inside) return inside;
    }
  }
  return null;
}

const problems = [];
const mib = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MiB`;

// One pass over <dir>: the text of every text file, and the markup scans.
const texts = new Map();
const loupes = []; // { url, file, detail }
let imagePages = 0;
let pages = 0;
let shaped = 0;
const imagesDir = join(root, 'images') + sep;

for await (const file of files(root)) {
  const extension = extname(file);
  if (!TEXT.has(extension)) continue;
  const text = await readFile(file, 'utf8');
  texts.set(file, text);
  if (extension !== '.html') continue;
  pages += 1;

  if (file.startsWith(imagesDir) && file.endsWith(`${sep}index.html`)) {
    imagePages += 1;
    for (const [, closing, , attributes] of text.matchAll(TAG)) {
      if (closing) continue;
      const url = attribute(attributes, 'data-loupe-src');
      if (url !== undefined) loupes.push({ url, file, detail: hasAttribute(attributes, 'data-loupe-detail') });
    }
  }

  const markup = text.replace(COMMENT, '').replace(SCRIPT, '').replace(STYLE, '');
  for (const { node } of compares(markup)) {
    shaped += 1;
    const problem = outOfShape(node);
    if (problem) problems.push(`[check-private-files] a compare out of shape in ${file}: ${problem}`);
  }

  const states = new Set();
  for (const [, closing, , attributes] of markup.matchAll(TAG)) {
    if (closing) continue;
    for (const name of STATE_ATTRIBUTES) if (hasAttribute(attributes, name)) states.add(name);
    for (const token of classesOf(attributes)) if (STATE_CLASSES.has(token)) states.add(`.${token}`);
  }
  for (const state of states) problems.push(`[check-private-files] a script-only state in the markup of ${file}: ${state}`);
}

let details = 0;
for (const { url, file, detail } of loupes) {
  const path = decodeURI(url.replace(/^[a-z]+:\/\/[^/]+/i, '').split(/[?#]/)[0]).replace(/^\/+/, '');
  const onDisk = join(root, path);
  let size;
  try {
    size = (await stat(onDisk)).size;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    problems.push(`[check-private-files] a loupe file missing from ${root}/: ${url} (${file})`);
    continue;
  }
  if (size > MAX_BYTES) problems.push(`[check-private-files] a loupe file over ${mib(MAX_BYTES)}: ${onDisk} (${mib(size)})`);
  if (!detail) continue;
  details += 1;
  const own = new RegExp(`\\sdata-loupe-src\\s*=\\s*(["'])${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g');
  for (const [other, text] of texts) {
    const rest = other === file ? text.replace(own, '') : text;
    if (rest.includes(path)) problems.push(`[check-private-files] a detail export named outside its loupe in ${other}: ${url}`);
  }
}

if (problems.length > 0) {
  for (const line of problems) console.error(line);
  process.exit(1);
}
console.log(
  `[check-private-files] ${loupes.length} loupe files on ${imagePages} image pages, ${details} of them detail exports named nowhere else; ${shaped} compares in one shape; no compare or loupe state in ${pages} pages.`,
);
