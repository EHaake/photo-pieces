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
  const pieceSlug = root === 'pieces' ? (rest[0] ?? null) : null;
  if (rest.length > expectedDepth) {
    return { path: key, root, pieceSlug, nested: true };
  }
  return { path: key, root, pieceSlug, nested: false, ...parseImagePath(key) };
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
  const refs = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?[^)]*\)|\{([^}]*)\}/g;
  for (const match of String(body).matchAll(refs)) {
    const [, shorthandAlt, shorthandSrc, attrText] = match;
    if (attrText !== undefined) {
      const attrs = parseAttributeText(attrText);
      for (const key of ['src', 'left', 'center', 'right']) {
        if (refersTo(attrs[key], basename)) {
          const alt = key === 'src' ? attrs.alt : attrs[`${key}Alt`];
          if (alt) return alt;
        }
      }
    } else if (refersTo(shorthandSrc, basename) && shorthandAlt) {
      return shorthandAlt;
    }
  }
  return undefined;
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

function toDate(value) {
  if (value instanceof Date) return Number.isNaN(value.valueOf()) ? undefined : value;
  if (typeof value !== 'string') return undefined;
  // EXIF's own "YYYY:MM:DD HH:MM:SS" — exifr normally revives this to a
  // Date already; this is the fallback for a file it left as text.
  const m = value.match(/^(\d{4}):(\d{2}):(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
  if (!m) return undefined;
  const [, y, mo, d, h = '0', mi = '0', s = '0'] = m;
  const date = new Date(+y, +mo - 1, +d, +h, +mi, +s);
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
