// Pure image-metadata logic for spec 004 — no Astro imports, so it runs
// under Vitest and inside the remark transform (which can't import
// anything touching `astro:content` or `import.meta.glob`). The thin
// Astro-coupled registry (`images.ts`) wraps these.
//
// The one identity rule, shared by the registry and the transform:
//
//   id = <folder>/<basename>
//
// where folder is the image's immediate parent folder — a piece's
// folder name, or `gallery` for the flat `gallery-images/` root — and
// basename is the file name without its extension. Folder names must
// already be slugs so ids match Astro's piece ids without re-running
// its slugger; that is validated here, loudly, with a rename hint.

export const IMAGE_EXTENSIONS = Object.freeze(['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff']);

/** The flat root for images that belong to no piece, and the folder
 *  segment their ids use (`gallery/<basename>`). */
export const GALLERY_ROOT = 'gallery-images';
export const GALLERY_FOLDER = 'gallery';

const CONTENT_ROOT = '/src/content/';
const SLUG = /^[a-z0-9-]+$/;
// File names become URL segments verbatim (`/images/<folder>/<basename>/`):
// camera-style `DSC_0001` is fine, spaces and punctuation are not.
const BASENAME = /^[A-Za-z0-9._-]+$/;

/**
 * Private rasters (spec 006): a raster whose basename starts with `_`
 * is not an image of the site — it is the camera's frame of the image
 * with the same basename (`_land-b.jpg` beside `land-b.jpg`), the
 * underscore rule the sidecar (`_land-b.md`) already uses. No id, no
 * page, never in a gallery, never referenced from a piece; the
 * registry attaches it to its target for the raw-to-finished compare.
 */
const PRIVATE = /^_/;

export function isPrivateRaster(basename) {
  return PRIVATE.test(String(basename));
}

/** `_land-b` → `land-b`: the basename of the image a private raster belongs to. */
export function privateTargetOf(basename) {
  return String(basename).replace(PRIVATE, '');
}

/**
 * The one sentence for a private raster met where an image was
 * expected — the registry, the transform, and the gallery check all
 * say it this way. `hint` is the caller's advice on what to do instead.
 */
export function privateMessage(file, basename, hint) {
  const target = privateTargetOf(basename);
  const advice = hint ?? "it has no page and can't be placed in a piece or a gallery";
  return `"${file}" is private — the camera's frame of "${target}", not an image of the site: ${advice}`;
}

export class ImageIdError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImageIdError';
  }
}

/**
 * Parse any path to an image file — a root-absolute `import.meta.glob`
 * key, an absolute filesystem path, or the transform's resolved
 * `dirname(file.path) + src` — into its id parts. Throws ImageIdError
 * with an authoring hint on anything that can't be an image id.
 */
export function parseImagePath(filePath) {
  const parts = String(filePath).split('/').filter(Boolean);
  const file = parts.at(-1);
  const parent = parts.at(-2);
  if (!file || parent === undefined) {
    throw new ImageIdError(`cannot derive an image id from "${filePath}": no parent folder`);
  }
  const dot = file.lastIndexOf('.');
  const ext = dot > 0 ? file.slice(dot + 1).toLowerCase() : '';
  if (!IMAGE_EXTENSIONS.includes(ext)) {
    throw new ImageIdError(
      `"${file}" is not an accepted image — expected one of ${IMAGE_EXTENSIONS.join(', ')}`,
    );
  }
  const basename = file.slice(0, dot);
  if (!BASENAME.test(basename)) {
    throw new ImageIdError(
      `image file name "${file}" can't be a URL segment — use letters, digits, dots, hyphens, and underscores only (e.g. "${slugHint(basename)}.${ext}")`,
    );
  }
  if (isPrivateRaster(basename)) {
    throw new ImageIdError(privateMessage(file, basename));
  }
  const folder = parent === GALLERY_ROOT ? GALLERY_FOLDER : parent;
  if (!SLUG.test(folder)) {
    throw new ImageIdError(
      `image folder "${parent}" is not a slug — rename it to lowercase letters, digits, and hyphens (e.g. "${slugHint(parent)}") so image ids line up with piece ids`,
    );
  }
  return { id: `${folder}/${basename}`, folder, basename, ext, file };
}

/** The image id for a file path — see parseImagePath for accepted forms. */
export function imageIdFor(filePath) {
  return parseImagePath(filePath).id;
}

/** The canonical page URL for an image id. `BASE_URL` is `/` and a
 *  remark plugin can't call `withBase`, so this is the one place the
 *  URL shape lives. */
export function imageUrlFor(id) {
  return `/images/${id}/`;
}

/**
 * Registry-side classification of a discovered file under
 * `src/content/`: which root it lives in, the owning piece's slug (or
 * null for the gallery root), and whether it is nested deeper than an
 * image's home — `pieces/<slug>/<file>` or `gallery-images/<file>`.
 * Nested files are not images' homes: the registry warns and ignores
 * them rather than minting an id from a sub-folder name.
 */
export function classifyContentImage(globKey) {
  const key = String(globKey);
  const at = key.indexOf(CONTENT_ROOT);
  if (at < 0) {
    throw new ImageIdError(`"${key}" is outside ${CONTENT_ROOT} — not a site image`);
  }
  const [root, ...rest] = key.slice(at + CONTENT_ROOT.length).split('/');
  let expectedDepth;
  if (root === 'pieces') expectedDepth = 2;
  else if (root === GALLERY_ROOT) expectedDepth = 1;
  else {
    throw new ImageIdError(
      `"${key}" is under ${CONTENT_ROOT}${root}/ — images live in pieces/<slug>/ or ${GALLERY_ROOT}/`,
    );
  }
  if (root === 'pieces' && rest.length < expectedDepth) {
    // An image directly in pieces/ has no piece folder to belong to; a
    // flat `pieces/foo.md` beside it would link to a page nobody makes.
    throw new ImageIdError(
      `"${key}" sits directly in ${CONTENT_ROOT}pieces/ — a piece lives in its own folder (pieces/<slug>/index.md) so its images can have pages`,
    );
  }
  const pieceSlug = root === 'pieces' ? (rest[0] ?? null) : null;
  if (rest.length > expectedDepth) {
    return { path: key, root, pieceSlug, nested: true };
  }
  // A private raster is classified before an id would be minted: the
  // registry attaches it to its target instead of paging it.
  const file = rest.at(-1);
  const dot = file.lastIndexOf('.');
  const basename = dot > 0 ? file.slice(0, dot) : file;
  const ext = dot > 0 ? file.slice(dot + 1).toLowerCase() : '';
  if (IMAGE_EXTENSIONS.includes(ext) && isPrivateRaster(basename)) {
    return {
      path: key,
      root,
      pieceSlug,
      nested: false,
      private: true,
      folder: root === 'pieces' ? pieceSlug : GALLERY_FOLDER,
      basename,
      target: privateTargetOf(basename),
      ext,
      file,
    };
  }
  return { path: key, root, pieceSlug, nested: false, private: false, ...parseImagePath(key) };
}

/**
 * Two files that differ only by extension (`shot.jpg` + `shot.webp`)
 * would claim the same id. Returns every such group so the caller can
 * fail the build naming all the files involved.
 */
export function findIdCollisions(filePaths) {
  const byId = new Map();
  for (const path of filePaths) {
    const id = imageIdFor(path);
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(path);
  }
  return [...byId].filter(([, files]) => files.length > 1).map(([id, files]) => ({ id, files }));
}

export function formatCollision({ id, files }) {
  return `image id "${id}" is claimed by ${files.length} files (${files.map((f) => f.split('/').at(-1)).join(', ')}) — one image per basename per folder`;
}

/**
 * The first non-empty alt text a piece body gives an image, scanning
 * every reference form the vocabulary allows, in document order:
 * shorthand `![alt](./x.jpg)`, a directive's `src="./x.jpg" alt="…"`,
 * and the pair/triptych `left|center|right="./x.jpg"` with its
 * `leftAlt|centerAlt|rightAlt`. References to other folders (any `/`
 * beyond a leading `./`) never match. Undefined when the body never
 * names the image with a non-empty alt — the image page then falls
 * back to the humanized filename.
 */
export function firstAltFor(body, basename) {
  for (const ref of imageReferences(body)) {
    if (refersTo(ref.src, basename) && ref.alt) return ref.alt;
  }
  return undefined;
}

/**
 * Whether a piece body (or any markdown text) references the image
 * with this basename, in any form the vocabulary allows — the one
 * definition of "this text names this file" (spec 006), shared by the
 * title fallback, the piece's frame order, and the passage lookup so
 * they can't disagree about what counts as a reference.
 */
export function referencesImage(text, basename) {
  for (const ref of imageReferences(text)) {
    if (refersTo(ref.src, basename)) return true;
  }
  return false;
}

/**
 * The frames of a piece folder in the piece's own order (spec 006): the
 * order the body first references them, then the unreferenced ones by
 * name. Drives the piece set (previous/next) and the related strip.
 */
export function pieceOrder(body, basenames) {
  // Rank by reference order, not text offset: a pair's two slots share
  // one offset, and left must still come before right.
  const firstAt = new Map();
  let rank = 0;
  for (const ref of imageReferences(body)) {
    rank += 1;
    for (const basename of basenames) {
      if (!firstAt.has(basename) && refersTo(ref.src, basename)) firstAt.set(basename, rank);
    }
  }
  const referenced = [...basenames]
    .filter((b) => firstAt.has(b))
    .sort((a, b) => firstAt.get(a) - firstAt.get(b));
  const unreferenced = [...basenames].filter((b) => !firstAt.has(b)).sort();
  return [...referenced, ...unreferenced];
}

/**
 * Where `id` sits in an ordered list and what surrounds it: `{ index,
 * prev?, next? }`, with the ends simply absent. An id not in the list
 * has index -1 and no neighbours.
 */
export function neighbours(list, id) {
  const index = list.indexOf(id);
  if (index < 0) return { index };
  const out = { index };
  if (index > 0) out.prev = list[index - 1];
  if (index < list.length - 1) out.next = list[index + 1];
  return out;
}

/**
 * Up to `limit` other entries nearest to `id` in list order — half on
 * each side where the list allows, the balance from the longer side at
 * either end — in list order. Empty for an id not in the list.
 */
export function nearest(list, id, limit) {
  const at = list.indexOf(id);
  if (at < 0 || limit <= 0) return [];
  let lo = at;
  let hi = at;
  let taken = 0;
  // Grow outwards, alternating sides, until the cap or the list ends.
  while (taken < limit && (lo > 0 || hi < list.length - 1)) {
    if (lo > 0 && (taken % 2 === 0 || hi >= list.length - 1)) {
      lo -= 1;
      taken += 1;
    } else if (hi < list.length - 1) {
      hi += 1;
      taken += 1;
    }
  }
  return list.slice(lo, hi + 1).filter((other) => other !== id);
}

/**
 * What each block's container body is (spec 007): a caption, the
 * piece's own prose, images then a caption, or nothing (leaf-only and
 * reserved blocks). The transform's descriptor table is the vocabulary's
 * source of truth; this map mirrors it here because this module must
 * stay Astro-free, and a test asserts the two agree — names and kinds.
 */
export const BLOCK_BODIES = Object.freeze({
  single: 'caption',
  fullbleed: 'caption',
  wide: 'caption',
  tall: 'caption',
  inset: 'caption',
  diptych: 'caption',
  triptych: 'caption',
  grid: 'images+caption',
  strip: 'images+caption',
  aside: 'prose',
  row: 'prose',
  held: 'prose',
  pause: 'none',
  sequence: 'none',
});

// The body kinds whose non-image lines are a caption. A prose body is
// the piece's own writing, which an image page must not quote twice.
const CAPTION_BODIES = new Set(['caption', 'images+caption']);

/**
 * The passage of a piece an image sits in (spec 006): the nearest prose
 * block before the body's first reference to the image, plus the
 * caption of the container block that holds the reference, if any —
 * both as markdown source. A prose block is one with no image reference
 * and no directive; a heading doesn't count. Only a caption-bodied
 * block contributes a caption (spec 007): a `row`, `aside`, or `held`
 * body is prose beside the frame, not a caption. Null when the body
 * never references the image.
 */
export function passageFor(body, basename) {
  const blocks = splitBlocks(body);
  const hit = blocks.findIndex((block) => referencesImage(block.text, basename));
  if (hit < 0) return null;
  const out = {};
  for (let i = hit - 1; i >= 0; i--) {
    if (blocks[i].kind === 'prose') {
      out.prose = blocks[i].text;
      break;
    }
  }
  if (
    blocks[hit].kind === 'container' &&
    CAPTION_BODIES.has(BLOCK_BODIES[blockName(blocks[hit].text)])
  ) {
    const caption = blocks[hit].text
      .split('\n')
      .slice(1)
      .filter((line) => {
        const t = line.trim();
        return t !== '' && t !== ':::' && !t.startsWith('![') && !t.startsWith('::');
      })
      .map((line) => line.trim())
      .join(' ');
    if (caption) out.caption = caption;
  }
  return out.prose || out.caption ? out : null;
}

// A piece body as blocks: container directives (`:::name … :::`, kept
// whole so a caption after a blank line stays with its block), leaf
// directives, image-bearing paragraphs, headings, and prose.
function splitBlocks(body) {
  const lines = String(body).split(/\r?\n/);
  const blocks = [];
  let current = [];
  let inContainer = false;
  const flush = () => {
    const text = current.join('\n').trim();
    if (text) blocks.push({ text, kind: kindOf(text) });
    current = [];
  };
  for (const line of lines) {
    const t = line.trim();
    if (inContainer) {
      current.push(line);
      if (t === ':::') {
        inContainer = false;
        flush();
      }
      continue;
    }
    if (t.startsWith(':::')) {
      flush();
      current.push(line);
      inContainer = true;
      continue;
    }
    if (t === '') {
      flush();
      continue;
    }
    current.push(line);
  }
  flush();
  return blocks;
}

// The directive's name from its opening line: `:::name{…}` or `:::name`.
function blockName(text) {
  return /^:::([A-Za-z][\w-]*)/.exec(text)?.[1] ?? '';
}

function kindOf(text) {
  if (text.startsWith(':::')) return 'container';
  if (text.startsWith('::')) return 'leaf';
  if (text.startsWith('#')) return 'heading';
  if (/!\[/.test(text)) return 'image';
  return 'prose';
}

/**
 * The image page's sections, in the spec's reading order, for one
 * image — the single statement of "renders when, and only when". The
 * label is always present. The processing note has one home: it
 * belongs to the compare when the camera's frame exists, and to the
 * record otherwise, so a record of processing alone doesn't render a
 * section beside the compare that already carries it.
 */
export function sectionsFor(image) {
  const has = (value) => typeof value === 'string' && value.trim() !== '';
  const record = image.record ?? {};
  const print = image.print ?? {};
  const recordShown =
    [record.format, record.filters, record.support].some(has) ||
    (!image.before && has(record.processing));
  const sections = [];
  if (image.hasStory) sections.push('story');
  sections.push('label');
  if (recordShown) sections.push('record');
  if (image.before) sections.push('compare');
  if (image.passage) sections.push('passage');
  if (image.related?.length) sections.push('related');
  if ([print.edition, print.sizes, print.paper].some(has)) sections.push('print');
  return sections;
}

// Every image reference in document order, as `{ src, alt, index }`:
// shorthand `![alt](./x.jpg)`, a directive's `src="./x.jpg" alt="…"`,
// and the pair/triptych `left|center|right` slots with their `…Alt`.
function* imageReferences(text) {
  const refs = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?[^)]*\)|\{([^}]*)\}/g;
  for (const match of String(text).matchAll(refs)) {
    const [, shorthandAlt, shorthandSrc, attrText] = match;
    if (attrText !== undefined) {
      const attrs = parseAttributeText(attrText);
      for (const key of ['src', 'left', 'center', 'right']) {
        if (attrs[key]) {
          const alt = key === 'src' ? attrs.alt : attrs[`${key}Alt`];
          yield { src: attrs[key], alt, index: match.index };
        }
      }
    } else {
      yield { src: shorthandSrc, alt: shorthandAlt, index: match.index };
    }
  }
}

/** `land-a` → `Land a`, `IMG_1234` → `IMG 1234`: the last title fallback. */
export function humanizeBasename(basename) {
  const words = String(basename).replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The EXIF tags the site reads — and the only ones. The reader in
 * `exif.mjs` picks exactly these with GPS parsing disabled, and filters
 * its output to this set again on the way out, so nothing else in a
 * file (GPS above all) can reach a page.
 */
export const EXPOSURE_TAGS = Object.freeze([
  'Make',
  'Model',
  'LensModel',
  'FocalLength',
  'FNumber',
  'ExposureTime',
  'ISO',
  'DateTimeOriginal',
]);

/** The wall-label fields a sidecar may override, in label order. The
 *  capture date is handled beside them (a sidecar `date` wins). */
export const EXPOSURE_FIELDS = Object.freeze([
  'camera',
  'lens',
  'focalLength',
  'aperture',
  'shutter',
  'iso',
]);

/**
 * Formats exifr's raw allowlisted tags into wall-label strings, using
 * exifr's real value shapes: numbers for ExposureTime (seconds, e.g.
 * 0.004), FNumber, FocalLength, and ISO; a Date for DateTimeOriginal.
 * Fields absent from the file are absent from the result — the page
 * prints what exists and nothing else.
 */
export function formatExposure(raw) {
  const tags = raw ?? {};
  const out = {};
  const camera = formatCamera(tags.Make, tags.Model);
  if (camera) out.camera = camera;
  const lens = cleanString(tags.LensModel);
  if (lens) out.lens = lens;
  if (isPositive(tags.FocalLength)) out.focalLength = `${trimNumber(tags.FocalLength)} mm`;
  if (isPositive(tags.FNumber)) out.aperture = `f/${trimNumber(tags.FNumber)}`;
  const shutter = formatShutter(tags.ExposureTime);
  if (shutter) out.shutter = shutter;
  if (isPositive(tags.ISO)) out.iso = `ISO ${Math.round(tags.ISO)}`;
  const date = toDate(tags.DateTimeOriginal);
  if (date) out.date = date;
  return out;
}

/**
 * A sidecar's label fields win verbatim over the EXIF-derived ones;
 * a sidecar `date` (already a Date via the schema) replaces the capture
 * date. Empty strings don't override — an author clearing a field in
 * Obsidian shouldn't blank the label.
 */
export function mergeOverrides(exposure, sidecar) {
  const merged = { ...(exposure ?? {}) };
  const overrides = sidecar ?? {};
  for (const field of EXPOSURE_FIELDS) {
    const value = overrides[field];
    if (typeof value === 'string' && value.trim() !== '') merged[field] = value.trim();
  }
  if (overrides.date instanceof Date && !Number.isNaN(overrides.date.valueOf())) {
    merged.date = overrides.date;
  }
  return merged;
}

function formatCamera(make, model) {
  const m = cleanString(make);
  const mo = cleanString(model);
  if (!m && !mo) return undefined;
  if (!mo) return m;
  if (!m) return mo;
  // "Canon" + "Canon EOS R5" → "Canon EOS R5"; "NIKON CORPORATION" +
  // "NIKON Z 8" → "NIKON Z 8"; "FUJIFILM" + "X-T5" → "FUJIFILM X-T5".
  const brand = m.split(/\s+/)[0].toLowerCase();
  return mo.toLowerCase().startsWith(brand) ? mo : `${m} ${mo}`;
}

/**
 * A sidecar collection entry id (the path verbatim, extension dropped)
 * → the image id it describes: `pieces/<slug>/_land-b` → `<slug>/land-b`,
 * `gallery-images/_dock-b` → `gallery/dock-b`.
 */
export function sidecarImageId(entryId) {
  const m = String(entryId).match(/^(?:pieces\/([^/]+)|gallery-images)\/_([^/]+)$/);
  if (!m) {
    throw new ImageIdError(
      `sidecar "${entryId}" is not an _<basename>.md beside an image in pieces/<slug>/ or ${GALLERY_ROOT}/`,
    );
  }
  return `${m[1] ?? GALLERY_FOLDER}/${m[2]}`;
}

/**
 * Checks every gallery's image list against the registry: each id must
 * name an image on the site, belong to a published piece (or to no
 * piece), and appear once. `galleries` is `[{ id, filePath, source,
 * images }]` with `source` the gallery file's text so each problem can
 * carry the line the id sits on; `known` maps every discovered image
 * id to 'published' | 'draft' | 'unowned'. Returns problems in file
 * order — the caller fails the build with all of them at once.
 */
export function validateGalleries(galleries, known) {
  const problems = [];
  for (const gallery of galleries) {
    const seen = new Map();
    gallery.images.forEach((imageId) => {
      const occurrence = seen.get(imageId) ?? 0;
      seen.set(imageId, occurrence + 1);
      const status = known.get(imageId);
      let reason;
      if (occurrence > 0) reason = `"${imageId}" is listed more than once`;
      else if (isPrivateRaster(imageId.split('/').at(-1)))
        reason = `"${imageId}" is a camera's frame, not an image of the site — list "${privateTargetImageId(imageId)}" instead`;
      else if (status === undefined)
        reason = `"${imageId}" is not an image on the site${nearestHint(imageId, known)}`;
      else if (status === 'draft')
        reason = `"${imageId}" belongs to a draft piece — publish the piece or drop the image`;
      else if (status !== 'published')
        reason = `"${imageId}" sits in a piece folder with no index.md, so it is unpublished`;
      if (reason) {
        problems.push({
          galleryId: gallery.id,
          filePath: gallery.filePath,
          line: findIdLine(gallery.source, imageId, occurrence),
          imageId,
          reason,
        });
      }
    });
  }
  return problems;
}

export function formatGalleryProblems(problems) {
  return problems
    .map(
      (p) => `${p.filePath}${p.line ? `:${p.line}` : ''} — gallery "${p.galleryId}": ${p.reason}`,
    )
    .join('\n');
}

/**
 * Latest-work ordering: galleries newest first, each gallery's images
 * in the photographer's order, de-duplicated across galleries. A
 * gallery with no date is placed by its newest image's capture date —
 * the only place EXIF dates affect ordering — and after everything
 * dated if none of its images has one. `galleries` is `[{ id, date?,
 * images }]`; `captureDates` maps image ids to Dates.
 */
export function orderLatestWork(galleries, captureDates, limit = Infinity) {
  const placed = galleries.map((gallery) => ({
    gallery,
    when: gallery.date ?? newestCapture(gallery.images, captureDates),
  }));
  // Undated galleries rank below every dated one and keep their input
  // order among themselves (a plain subtraction would be NaN there).
  const rank = (entry) => entry.when?.valueOf() ?? -Infinity;
  placed.sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    return ra === rb ? 0 : rb > ra ? 1 : -1;
  });
  const out = [];
  const seen = new Set();
  for (const { gallery } of placed) {
    for (const id of gallery.images) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function newestCapture(ids, captureDates) {
  let newest;
  for (const id of ids) {
    const date = captureDates.get(id);
    if (date instanceof Date && (newest === undefined || date > newest)) newest = date;
  }
  return newest;
}

// The 1-based line of the nth list item naming `id` in a gallery file
// (`  - <id>`, quoted or not), falling back to the nth line mentioning
// it at all. Undefined only if the id isn't in the file — which can't
// happen for an id that came out of parsing it.
function findIdLine(source, id, nth) {
  if (typeof source !== 'string') return undefined;
  const lines = source.split(/\r?\n/);
  const item = new RegExp(`^\\s*-\\s*["']?${escapeRegExp(id)}["']?\\s*$`);
  const matches = lines.flatMap((line, i) => (item.test(line) ? [i + 1] : []));
  if (matches[nth] !== undefined) return matches[nth];
  const mentions = lines.flatMap((line, i) => (line.includes(id) ? [i + 1] : []));
  return mentions[nth] ?? mentions[0];
}

// `a-piece/_land-b` → `a-piece/land-b`: the image a private id points at.
function privateTargetImageId(imageId) {
  const parts = imageId.split('/');
  parts[parts.length - 1] = privateTargetOf(parts.at(-1));
  return parts.join('/');
}

function nearestHint(imageId, known) {
  const basename = imageId.split('/').at(-1);
  const candidates = [...known.keys()].filter((k) => k.split('/').at(-1) === basename);
  return candidates.length
    ? ` — did you mean ${candidates.map((c) => `"${c}"`).join(' or ')}?`
    : '';
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatShutter(seconds) {
  if (!isPositive(seconds)) return undefined;
  if (seconds >= 1) return `${trimNumber(seconds)} s`;
  // Reconstruct the 1/n form from the decimal exifr returns, unless the
  // exposure genuinely isn't a unit fraction (0.4 s stays 0.4 s).
  const denominator = 1 / seconds;
  const rounded = Math.round(denominator);
  if (Math.abs(denominator - rounded) / denominator < 0.02) return `1/${rounded} s`;
  return `${trimNumber(seconds)} s`;
}

function isPositive(n) {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

function trimNumber(n) {
  return String(Math.round(n * 100) / 100);
}

function cleanString(value) {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.replaceAll('\0', '').trim();
  return cleaned === '' ? undefined : cleaned;
}

// EXIF capture times carry no zone — "2026:08:29 18:12:44" is the
// camera's wall clock. exifr revives that as a *local* Date on the build
// machine; re-based here to UTC wall-clock (same digits, zone UTC) so
// the site's UTC date formatting prints the day the frame was taken,
// whatever zone the build runs in. YAML dates are already UTC midnight,
// so every Date the site formats shares one convention.
function toDate(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.valueOf())) return undefined;
    return new Date(
      Date.UTC(
        value.getFullYear(),
        value.getMonth(),
        value.getDate(),
        value.getHours(),
        value.getMinutes(),
        value.getSeconds(),
      ),
    );
  }
  if (typeof value !== 'string') return undefined;
  // EXIF's own "YYYY:MM:DD HH:MM:SS" — the fallback for a file exifr
  // left as text.
  const m = value.match(/^(\d{4}):(\d{2}):(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
  if (!m) return undefined;
  const [, y, mo, d, h = '0', mi = '0', s = '0'] = m;
  const date = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

function refersTo(value, basename) {
  if (!value) return false;
  const rel = value.startsWith('./') ? value.slice(2) : value;
  if (rel.includes('/')) return false;
  const dot = rel.lastIndexOf('.');
  if (dot <= 0) return false;
  return (
    rel.slice(0, dot) === basename && IMAGE_EXTENSIONS.includes(rel.slice(dot + 1).toLowerCase())
  );
}

// Directive attribute text as remark-directive accepts it: quoted with
// either quote, or bare (the Obsidian plugin accepts unquoted values).
function parseAttributeText(text) {
  const attrs = {};
  const pair = /([A-Za-z][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'}]+)))?/g;
  for (const m of text.matchAll(pair)) {
    attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

function slugHint(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
