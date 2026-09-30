// Post-build barrier (spec 019): the site speaks the lexicon — journal,
// photograph, place, gallery — in what ships. Runs from `postbuild`, after
// check-private-files.
//
// First scan, the old addresses: no `<dist>/pieces/`, `<dist>/images/` or
// `<dist>/og/pieces/`; and in every `.html` and `.xml` file, no attribute
// value or element text that is a URL — root-relative, or absolute on the
// site's own origin (the `site:` line of astro.config.mjs, read as text;
// the site's base is `/`) — whose path begins `/pieces/` or `/images/`. A
// link to another host's `/images/…` is not the site's address and passes.
//
// Second scan, the words: per page, the `<title>` text and the `<body>`
// markup, with <script>, <style>, <template>, <svg> and comments removed,
// then the authored regions removed by a tag-depth walk (check-private-
// files' scan 3 walk): `figcaption` and `blockquote` elements, and any
// element whose class list holds one of AUTHORED_CLASSES. From what remains,
// the values of the three attributes a reader meets (aria-label, title,
// placeholder) are collected and every tag is stripped, so no other
// attribute value, class name, id or URL is read; entities are decoded and
// whitespace collapsed. Then every authored string is removed — harvested
// from the content's frontmatter scalars and body alt texts (journal,
// photographs, galleries, places) that contain the word, block and
// continued scalars read as their lines joined by single spaces. What
// remains must not say "piece" or "pieces". Authored text is excused by
// region and by harvest, never by class name or URL; a harvested string
// is removed wherever it appears on a page.
//
// Third scan, the drafts: a photograph whose sidecar
// (`<content>/photographs/_<name>.md`) says `draft: true` has no page, and
// no `.html` or `.xml` file names `/photographs/<name>/`. Pagefind indexes
// built pages only, so no page means no search entry; its compressed
// fragments are not read.
//
// Fourth scan, the front door: every link to a one-segment
// `/photographs/<name>/` inside `<dist>/index.html`'s `.index-feed` names
// a sidecar with a `published:` line and no `draft: true`.
//
// Fifth scan, the photographs index: `<dist>/photographs/index.html`
// exists, and the links inside its `.photographs-index` list name every
// photograph page (`<dist>/photographs/**/index.html` but the index, read
// as its id) exactly once, and nothing else. On every page the layout's
// `footer.site-footer` (outside the authored regions) holds exactly one
// link to `/photographs/`, and the site header's `<nav>` none.
//
// `<dist>/pagefind/` is excluded: pagefind's index is a third party's.
//
//   node scripts/check-lexicon.mjs [dist] [content]   # defaults: dist, src/content
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';
import { PHOTOGRAPH_FIELDS } from '../src/lib/image-meta.mjs';

const root = process.argv[2] ?? 'dist';
const content = process.argv[3] ?? 'src/content';
const excluded = join(root, 'pagefind');
const problems = [];

// The site's origin, from the config's `site:` line. Read as text so the
// barrier needs no Astro; a config that stops writing it as a literal line
// fails here rather than letting absolute old addresses through.
const config = await readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8');
const siteLine = /^\s*site:\s*(['"])(https?:\/\/[^'"]+?)\/?\1\s*,?\s*$/m.exec(config);
if (!siteLine) {
  console.error(
    '[check-lexicon] astro.config.mjs has no literal `site: \'https://…\'` line — the old-address scan reads the site\'s origin from it',
  );
  process.exit(1);
}
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ORIGIN = escape(siteLine[2]);

/** The word the lexicon retires; "masterpiece" is not it. */
const WORD = /\bpieces?\b/i;
/** Classes whose elements hold authored text (plan.md, "The lexicon barrier"). */
const AUTHORED_CLASSES = ['prose', 'image-caption', 'compare-note'];
const AUTHORED_TAGS = ['figcaption', 'blockquote'];
const READ_ATTRIBUTES = ['aria-label', 'title', 'placeholder'];

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
const TEMPLATE = /<template\b[^>]*>[\s\S]*?<\/template>/gi;
const SVG = /<svg\b[^>]*>[\s\S]*?<\/svg>/gi;
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

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', middot: '·', copy: '©',
};
const decode = (text) =>
  text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, name) => {
    if (name[0] === '#') {
      const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return ENTITIES[name.toLowerCase()] ?? whole;
  });
const collapse = (text) => text.replace(/\s+/g, ' ').trim();

/**
 * Every outermost element whose open tag satisfies `matches(tag, attributes)`,
 * walked by tag depth from its open tag to its matching close: `{ start, end }`.
 */
function elements(markup, matches) {
  const found = [];
  const tags = [...markup.matchAll(TAG)];
  for (let i = 0; i < tags.length; i += 1) {
    const [whole, closing, tag, attributes] = tags[i];
    const lower = tag.toLowerCase();
    if (closing || !matches(lower, attributes)) continue;
    if (VOID.has(lower) || whole.endsWith('/>')) {
      found.push({ start: tags[i].index, end: tags[i].index + whole.length });
      continue;
    }
    let depth = 1;
    let j = i + 1;
    for (; j < tags.length && depth > 0; j += 1) {
      const [w, isClose, t] = tags[j];
      if (isClose) depth -= 1;
      else if (!VOID.has(t.toLowerCase()) && !w.endsWith('/>')) depth += 1;
    }
    const last = tags[j - 1];
    found.push({ start: tags[i].index, end: depth === 0 ? last.index + last[0].length : markup.length });
    i = j - 1;
  }
  return found;
}
const inside = (markup, matches) => elements(markup, matches).map(({ start, end }) => markup.slice(start, end));
const without = (markup, spans) => {
  let kept = '';
  let at = 0;
  for (const { start, end } of spans) {
    kept += markup.slice(at, start) + ' ';
    at = end;
  }
  return kept + markup.slice(at);
};
const hrefs = (markup) =>
  [...markup.matchAll(TAG)].filter(([, closing]) => !closing).map(([, , , attrs]) => attribute(attrs, 'href')).filter((h) => h !== undefined);
const hasClass = (name) => (_tag, attributes) => classesOf(attributes).includes(name);

// ---- the harvest: authored strings that hold the word ----

/** The frontmatter lines of a Markdown file, and its body. */
function split(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  return match ? { front: match[1].split(/\r?\n/), body: text.slice(match[0].length) } : { front: [], body: text };
}
const indentOf = (line) => /^\s*/.exec(line)[0].length;
const KEY_LINE = /^(\s*)(-\s+)?([A-Za-z_][\w-]*):(?:\s+(.*))?$/;
const BLOCK = /^[>|][+-]?$/;
const unquote = (value) => {
  const match = /^(["'])([\s\S]*)\1$/.exec(value);
  return match ? match[2] : value;
};

/** Every scalar value of a frontmatter, block and continued scalars joined. */
function scalars(lines) {
  const values = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = KEY_LINE.exec(lines[i]);
    if (!match) continue;
    const value = (match[4] ?? '').trim();
    const indent = indentOf(lines[i]) + (match[2] ? match[2].length : 0);
    const deeper = [];
    let j = i + 1;
    for (; j < lines.length; j += 1) {
      if (lines[j].trim() === '') {
        if (BLOCK.test(value)) continue;
        break;
      }
      if (indentOf(lines[j]) <= indent) break;
      deeper.push(lines[j].trim());
    }
    if (BLOCK.test(value)) {
      values.push(deeper.join(' '));
      i = j - 1;
    } else if (value !== '') {
      const quoted = /^["']/.test(value);
      const first = quoted ? value : value.replace(/\s+#.*$/, '');
      values.push(unquote([first, ...deeper].join(' ')));
      i = j - 1;
    }
  }
  return values;
}

/** Body alt texts: `![…]`, and any `…alt="…"` / `…Alt="…"`. */
const alts = (body) => [
  ...[...body.matchAll(/!\[([^\]]*)\]/g)].map((m) => m[1]),
  ...[...body.matchAll(/[A-Za-z]*(?:alt|Alt)="([^"]*)"/g)].map((m) => m[1]),
];

async function* markdown(dir) {
  if (!existsSync(dir)) return;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* markdown(path);
    else if (extname(entry.name) === '.md') yield path;
  }
}

const harvested = new Set();
for (const folder of ['journal', 'photographs', 'galleries', 'places']) {
  for await (const file of markdown(join(content, folder))) {
    const { front, body } = split(await readFile(file, 'utf8'));
    for (const text of [...scalars(front), ...alts(body)]) {
      const string = collapse(text);
      if (WORD.test(string)) harvested.add(string);
    }
  }
}
const excusable = [...harvested].sort((a, b) => b.length - a.length);
const excused = new Set();

// ---- the photographs' sidecars ----

const sidecars = new Map(); // name → frontmatter lines (top level)
const photographsContent = join(content, 'photographs');
if (existsSync(photographsContent)) {
  for (const entry of await readdir(photographsContent)) {
    const match = /^_(.+)\.md$/.exec(entry);
    if (match) sidecars.set(match[1], split(await readFile(join(photographsContent, entry), 'utf8')).front);
  }
}
const topLevel = (lines, key) => lines.find((line) => new RegExp(`^${escape(key)}:`).test(line));
const isDraft = (lines) => /^\S+:\s*true\s*(?:#.*)?$/.test(topLevel(lines, PHOTOGRAPH_FIELDS.draft) ?? '');
const isDated = (lines) => topLevel(lines, PHOTOGRAPH_FIELDS.published) !== undefined;
const drafts = [...sidecars].filter(([, lines]) => isDraft(lines)).map(([name]) => name);

// ---- scan 1: old folders ----

const OLD_FOLDERS = [
  ['pieces', 'the journal is at /journal/'],
  ['images', 'a photograph is at /photographs/'],
  [join('og', 'pieces'), "the journal's cards are at /og/journal/"],
];
for (const [folder, hint] of OLD_FOLDERS) {
  if (existsSync(join(root, folder))) problems.push(`[check-lexicon] ${join(root, folder)}${sep} exists — ${hint}`);
}
const OLD_ADDRESS = {
  pieces: [new RegExp(`(?:="|>)(?:${ORIGIN})?/pieces/`), 'links to /pieces/… — a journal entry is at /journal/…'],
  images: [new RegExp(`(?:="|>)(?:${ORIGIN})?/images/`), 'links to /images/… — a photograph is at /photographs/…'],
};
const PHOTOGRAPH_LINK = new RegExp(`^(?:${ORIGIN})?/photographs/(.+)/$`);
const INDEX_LINK = new RegExp(`^(?:${ORIGIN})?/photographs/$`);

// ---- one pass over <dist> ----

const photographsDir = join(root, 'photographs');
const indexFile = join(photographsDir, 'index.html');
const pageIds = new Set();
let pages = 0;
let regions = 0;
let frontDoor = 0;
let listed = 0;

for await (const file of files(root)) {
  const extension = extname(file);
  if (extension !== '.html' && extension !== '.xml') continue;
  const text = await readFile(file, 'utf8');

  for (const [pattern, message] of Object.values(OLD_ADDRESS)) {
    if (pattern.test(text)) problems.push(`[check-lexicon] ${file}: ${message}`);
  }
  for (const name of drafts) {
    if (text.includes(`/photographs/${name}/`)) problems.push(`[check-lexicon] draft photograph "${name}" is named in ${file}`);
  }
  if (extension !== '.html') continue;
  pages += 1;

  if (file.startsWith(photographsDir + sep) && file !== indexFile && file.endsWith(`${sep}index.html`)) {
    pageIds.add(relative(photographsDir, file).split(sep).slice(0, -1).join('/'));
  }

  // scan 2: the words
  const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(text)?.[1] ?? '';
  const body = (/<body\b[^>]*>([\s\S]*)<\/body>/i.exec(text)?.[1] ?? '')
    .replace(COMMENT, '')
    .replace(SCRIPT, '')
    .replace(STYLE, '')
    .replace(TEMPLATE, '')
    .replace(SVG, '');
  const authored = elements(
    body,
    (tag, attributes) =>
      AUTHORED_TAGS.includes(tag) || classesOf(attributes).some((token) => AUTHORED_CLASSES.includes(token)),
  );
  regions += authored.length;
  const chrome = without(body, authored);
  const said = [collapse(decode(title.replace(TAG, ' ')))];
  for (const [, closing, , attributes] of chrome.matchAll(TAG)) {
    if (closing) continue;
    for (const name of READ_ATTRIBUTES) {
      const value = attribute(attributes, name);
      if (value !== undefined) said.push(collapse(decode(value)));
    }
  }
  said.push(collapse(decode(chrome.replace(TAG, ' '))));
  for (let words of said) {
    for (const string of excusable) {
      if (!words.includes(string)) continue;
      excused.add(string);
      words = words.split(string).join(' ');
    }
    for (const hit of words.matchAll(new RegExp(WORD.source, 'gi'))) {
      const context = words.slice(Math.max(0, hit.index - 30), hit.index + hit[0].length + 30);
      problems.push(`[check-lexicon] ${file}: "${hit[0]}" in the page's words — "…${context}…"`);
    }
  }

  // scan 5: the footer and the nav
  const footerLinks = inside(chrome, (tag, attributes) => tag === 'footer' && classesOf(attributes).includes('site-footer'))
    .flatMap(hrefs)
    .filter((href) => INDEX_LINK.test(href)).length;
  if (footerLinks !== 1) {
    problems.push(`[check-lexicon] ${file}: the footer has ${footerLinks} links to /photographs/ (one expected)`);
  }
  const navLinks = inside(chrome, (tag, attributes) => tag === 'header' && classesOf(attributes).includes('site-header'))
    .flatMap((header) => inside(header, (tag) => tag === 'nav'))
    .flatMap(hrefs)
    .filter((href) => INDEX_LINK.test(href)).length;
  if (navLinks > 0) problems.push(`[check-lexicon] ${file}: the nav links to /photographs/`);
}

// scan 3: a draft has no page
for (const name of drafts) {
  if (existsSync(join(photographsDir, name))) problems.push(`[check-lexicon] draft photograph "${name}" has a page`);
}

// scan 4: the front door
const home = join(root, 'index.html');
const feeds = existsSync(home) ? inside(await readFile(home, 'utf8'), hasClass('index-feed')) : [];
if (feeds.length === 0) {
  problems.push(`[check-lexicon] ${home} has no .index-feed section — the front door's list is where this scan reads`);
}
const onFrontDoor = new Set();
for (const href of feeds.flatMap(hrefs)) {
  const name = PHOTOGRAPH_LINK.exec(href)?.[1];
  if (name === undefined || name.includes('/') || onFrontDoor.has(name)) continue;
  onFrontDoor.add(name);
  const lines = sidecars.get(name);
  if (lines && isDraft(lines)) problems.push(`[check-lexicon] the front door lists "${name}", which is a draft`);
  else if (!lines || !isDated(lines)) problems.push(`[check-lexicon] the front door lists "${name}", which has no published: date`);
}
frontDoor = onFrontDoor.size;

// scan 5: the photographs index
if (!existsSync(indexFile)) {
  problems.push(`[check-lexicon] ${indexFile} is missing — the photographs index is at /photographs/`);
} else {
  const seen = new Map();
  for (const list of inside(await readFile(indexFile, 'utf8'), hasClass('photographs-index'))) {
    for (const href of hrefs(list)) {
      const id = PHOTOGRAPH_LINK.exec(href)?.[1];
      if (id !== undefined) seen.set(id, (seen.get(id) ?? 0) + 1);
    }
  }
  for (const id of [...pageIds].sort()) if (!seen.has(id)) problems.push(`[check-lexicon] the photographs index misses "${id}"`);
  for (const [id, times] of seen) {
    if (times > 1) problems.push(`[check-lexicon] the photographs index lists "${id}" twice`);
    if (!pageIds.has(id)) problems.push(`[check-lexicon] the photographs index lists "${id}", which has no page`);
  }
  listed = seen.size;
}

if (problems.length > 0) {
  for (const line of problems) console.error(line);
  process.exit(1);
}
console.log(
  `[check-lexicon] ${pages} pages read, ${regions} authored regions set aside, ${excused.size} authored strings excused; 0 old addresses; ${drafts.length} draft photographs, none published; ${frontDoor} front-door photographs, each dated; the index lists ${listed} photographs, each once`,
);
