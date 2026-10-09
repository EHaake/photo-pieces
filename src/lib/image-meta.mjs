// Pure image-metadata logic for spec 004 — no Astro imports, so it runs
// under Vitest and inside the remark transform (which can't import
// anything touching `astro:content` or `import.meta.glob`). The thin
// Astro-coupled registry (`images.ts`) wraps these.
//
// The one identity rule, shared by the registry and the transform
// (`imageIdOf`, the only place it is written):
//
//   id = <folder>/<basename>   a journal entry's photograph
//   id = <basename>            a photograph in the flat `photographs/` folder
//
// where folder is the image's immediate parent folder — a journal
// entry's folder name — and basename is the file name without its
// extension. The photographs folder's segment is empty
// (`PHOTOGRAPHS_FOLDER`), so its ids carry none. Folder names must
// already be slugs so ids match Astro's entry ids without re-running
// its slugger; that is validated here, loudly, with a rename hint.

import { EMPTY_GEAR } from './gear.mjs';

export const IMAGE_EXTENSIONS = Object.freeze(['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff']);

/** The flat folder for photographs that belong to no journal entry. */
export const PHOTOGRAPHS_ROOT = 'photographs';
/** The photographs folder's id segment: none, so its ids are bare
 *  (`<basename>`). Empty rather than a word because it can't be a slug
 *  and it is what the id literally has — so test it by comparison, never
 *  by truthiness. */
export const PHOTOGRAPHS_FOLDER = '';
/** The journal's folder: one folder per entry, `journal/<slug>/`. */
export const JOURNAL_ROOT = 'journal';

const CONTENT_ROOT = '/src/content/';
const SLUG = /^[a-z0-9-]+$/;
// File names become URL segments verbatim (`/photographs/<folder>/<basename>/`):
// camera-style `DSC_0001` is fine, spaces and punctuation are not.
const BASENAME = /^[A-Za-z0-9._-]+$/;

/**
 * Private rasters (spec 006, widened at spec 019): a raster whose
 * basename starts with `_` is not an image of the site — it is a file of
 * the photograph it names, the underscore rule the sidecar
 * (`_land-b.md`) already uses. The family: the camera's frame
 * (`_land-b.jpg`), a stage (`_land-b.tones.jpg`) and the loupe's detail
 * export (`_land-b.detail.jpg`). No id, no page, never in a gallery;
 * the registry attaches each to its photograph (`attachPrivates`).
 */
const PRIVATE = /^_/;

/** An image's id from its folder segment and basename — the one copy of
 *  the identity rule at the top of this file. */
export function imageIdOf(folder, basename) {
  return folder === PHOTOGRAPHS_FOLDER ? basename : `${folder}/${basename}`;
}

/** The stage word that names the loupe's detail export, not a stage. */
export const DETAIL_WORD = 'detail';

export function isPrivateRaster(basename) {
  return PRIVATE.test(String(basename));
}

/**
 * `_land-b` → `land-b`, `_land-b.tones` → `land-b`: the basename of the
 * photograph a private raster names, read from the name alone — strip
 * the `_`, then a trailing `.<word>`. Messages only: without the folder
 * it can't tell `_land.b` (the frame of `land.b`) from stage `b` of
 * `land`, so anything that attaches a file uses `privateRole`.
 */
export function privateTargetOf(basename) {
  return String(basename)
    .replace(PRIVATE, '')
    .replace(/\.[^.]*$/, '');
}

/**
 * What a private raster is, given the public basenames of its folder:
 * `{ role, target, word? }`. `_X` with `X` public is the camera's frame
 * of `X`; otherwise `X` split at its last dot, `T.W` with `T` public,
 * is stage `W` of `T` — or its detail export when `W` is `detail`;
 * anything else is an orphan, whose `target` is the name's best guess
 * for the message. Frame first, because a basename may hold dots:
 * `_land.b` beside `land.b` is that photograph's frame, not stage `b`
 * of `land`.
 */
export function privateRole(basename, publicBasenames) {
  const own = publicBasenames instanceof Set ? publicBasenames : new Set(publicBasenames ?? []);
  const name = String(basename).replace(PRIVATE, '');
  if (own.has(name)) return { role: 'frame', target: name };
  const dot = name.lastIndexOf('.');
  if (dot > 0) {
    const target = name.slice(0, dot);
    const word = name.slice(dot + 1);
    if (word && own.has(target)) {
      return { role: word === DETAIL_WORD ? 'detail' : 'stage', target, word };
    }
  }
  return { role: 'orphan', target: privateTargetOf(basename) };
}

/**
 * The one sentence for a private raster met where an image was
 * expected — the registry, the transform, and the gallery check all
 * say it this way. `hint` is the caller's advice on what to do instead.
 */
export function privateMessage(file, basename, hint) {
  const target = privateTargetOf(basename);
  const advice = hint ?? "it has no page and can't be placed in a piece or a gallery";
  return `"${file}" is private — a file of "${target}" (its camera's frame, a stage, or the loupe's export), not an image of the site: ${advice}`;
}

/**
 * Attaches a folder's private rasters to their photographs (spec 019).
 * `privates` is `{ key, folder, basename, file }[]`, `basenamesByFolder`
 * maps a folder segment to its public basenames. Returns three maps
 * keyed by the photograph's id — `frame` and `detail` to one file's
 * key, `stages` to `{ file, key }[]` in file-name order — and the
 * `problems`: an orphan, a second frame, a second detail export, one
 * line each, in the order the files came, so the caller fails the build
 * with all of them at once.
 */
export function attachPrivates(privates, basenamesByFolder) {
  const frame = new Map();
  const detail = new Map();
  const stages = new Map();
  const problems = [];
  for (const { key, folder, basename, file } of privates) {
    const where = String(key).replace(/^\//, '');
    const { role, target } = privateRole(basename, basenamesByFolder.get(folder));
    const id = imageIdOf(folder, target);
    if (role === 'orphan') {
      problems.push(
        `${where} has no photograph: a "_" file belongs to the photograph it names, so "${target}.<ext>" should sit beside it (its camera's frame is _${target}.<ext>, a stage _${target}.<word>.<ext>, the loupe's export _${target}.${DETAIL_WORD}.<ext>)`,
      );
    } else if (role === 'frame') {
      if (frame.has(id)) {
        problems.push(
          `${where} is a second camera's frame for "${id}" — keep one (any accepted extension)`,
        );
      } else frame.set(id, key);
    } else if (role === 'detail') {
      if (detail.has(id)) {
        problems.push(`${where} is a second detail export for "${id}" — keep one`);
      } else detail.set(id, key);
    } else {
      const list = stages.get(id) ?? [];
      list.push({ file, key });
      stages.set(id, list);
    }
  }
  for (const list of stages.values()) {
    list.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
  }
  return { frame, detail, stages, problems };
}

/**
 * Checks a sidecar's `stages:` against the photograph's own stage
 * files and returns them in the sidecar's order. `listed` is the
 * sidecar's `{ file, label, note? }[]`, `own` the photograph's stage
 * files as `attachPrivates` gives them (`{ file, key }[]`), `where` the
 * sidecar's path — whose name, by the underscore rule, is the
 * photograph's. A listed `file` must be one of `own` by exact name; the
 * camera's frame and the detail export fail with their own line, a
 * name listed twice fails once, anything else is "not a stage of".
 */
export function resolveStages(listed, own, where) {
  const target = String(where).split('/').at(-1).replace(/\.md$/, '').replace(PRIVATE, '');
  const byFile = new Map((own ?? []).map((stage) => [stage.file, stage.key]));
  const stages = [];
  const problems = [];
  const seen = new Map();
  for (const entry of listed ?? []) {
    const file = String(entry.file);
    const count = seen.get(file) ?? 0;
    seen.set(file, count + 1);
    if (count > 0) {
      if (count === 1) problems.push(`${where}: stages lists "${file}" twice`);
      continue;
    }
    const dot = file.lastIndexOf('.');
    const base = dot > 0 ? file.slice(0, dot) : file;
    const ext = dot > 0 ? file.slice(dot + 1).toLowerCase() : '';
    const raster = IMAGE_EXTENSIONS.includes(ext);
    if (raster && base === `_${target}`) {
      problems.push(
        `${where}: stages lists "${file}", the camera's frame — it is always the first stage; leave it out`,
      );
    } else if (raster && base === `_${target}.${DETAIL_WORD}`) {
      problems.push(`${where}: stages lists "${file}", the loupe's export — not a stage`);
    } else if (byFile.has(file)) {
      const stage = { key: byFile.get(file), label: entry.label };
      if (entry.note !== undefined) stage.note = entry.note;
      stages.push(stage);
    } else {
      problems.push(
        `${where}: stages lists "${file}", which is not a stage of "${target}" — a stage is _${target}.<word>.<ext> beside the photograph`,
      );
    }
  }
  return { stages, problems };
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
  const folder = parent === PHOTOGRAPHS_ROOT ? PHOTOGRAPHS_FOLDER : parent;
  // The photographs folder's empty segment is no slug, and needs none.
  if (folder !== PHOTOGRAPHS_FOLDER && !SLUG.test(folder)) {
    throw new ImageIdError(
      `image folder "${parent}" is not a slug — rename it to lowercase letters, digits, and hyphens (e.g. "${slugHint(parent)}") so image ids line up with piece ids`,
    );
  }
  return { id: imageIdOf(folder, basename), folder, basename, ext, file };
}

/** The image id for a file path — see parseImagePath for accepted forms. */
export function imageIdFor(filePath) {
  return parseImagePath(filePath).id;
}

/** The canonical page URL for an image id. `BASE_URL` is `/` and a
 *  remark plugin can't call `withBase`, so this is the one place the
 *  URL shape lives. */
export function imageUrlFor(id) {
  return `/photographs/${id}/`;
}

/**
 * The shape of an image `src` written in a piece body (spec 008) — the
 * single definition the transform, the scanner, and the registry share:
 *
 *   local       — `./<file>` or `<file>`         (the piece's own folder)
 *   piece       — `../<slug>/<file>`             (another piece's folder)
 *   photographs — `../../photographs/<file>`     (the photographs folder)
 *
 * Returns `{ kind, folder, file, basename, ext }`, where `folder` is the
 * folder segment of the image's id: the other piece's slug,
 * `PHOTOGRAPHS_FOLDER` (empty) for the photographs folder, and null for
 * a local src — whose folder only the
 * caller knows. Any other path — a sub-folder, a deeper `../`, the
 * wrong depth to the photographs folder, a bare `..` — comes back as `invalid`
 * with the `message` the transform fails the build with.
 *
 * Shape only: the accepted extensions, the private-frame rule
 * (`_<basename>`), and whether the file is there at all stay where they
 * are today (`parseImagePath`, and the transform's `rejectPrivateSrc`
 * and `checkSrcExists`). Remote and root-absolute srcs are Astro's
 * business rather than this rule's, so they come back as `external` for
 * a caller to skip — the same three guards the transform's checks open
 * with today. The long shape into the piece's *own* folder
 * (`../<own-slug>/<file>`) parses as `piece`: only the transform knows
 * which folder is its own, and it refuses it there.
 */
export function parseReference(src) {
  if (typeof src !== 'string' || URL.canParse(src) || src.startsWith('/')) {
    return { kind: 'external', folder: null, file: null, basename: null, ext: null };
  }
  const parts = src.split('/');
  if (parts[0] === '.') parts.shift();
  const file = parts.at(-1);
  // `.`, `..`, and a trailing slash name a folder, not an image.
  const named = file !== undefined && file !== '' && file !== '.' && file !== '..';
  if (named) {
    if (parts.length === 1) return referenceParts('local', null, file);
    // `../photographs/<file>` is the photographs folder written at the
    // wrong depth, not a sibling piece — the plan calls it invalid.
    if (
      parts.length === 3 &&
      parts[0] === '..' &&
      parts[1] !== PHOTOGRAPHS_ROOT &&
      SLUG.test(parts[1])
    ) {
      return referenceParts('piece', parts[1], file);
    }
    if (
      parts.length === 4 &&
      parts[0] === '..' &&
      parts[1] === '..' &&
      parts[2] === PHOTOGRAPHS_ROOT
    ) {
      return referenceParts('photographs', PHOTOGRAPHS_FOLDER, file);
    }
  }
  return {
    kind: 'invalid',
    folder: null,
    file: null,
    basename: null,
    ext: null,
    message: `image src "${src}" is not a path this site accepts — a piece places its own images as ./<file>, a journal entry's as ../<slug>/<file>, and a photograph from the photographs folder as ../../${PHOTOGRAPHS_ROOT}/<file>`,
  };
}

function referenceParts(kind, folder, file) {
  const dot = file.lastIndexOf('.');
  return {
    kind,
    folder,
    file,
    basename: dot > 0 ? file.slice(0, dot) : file,
    ext: dot > 0 ? file.slice(dot + 1).toLowerCase() : '',
  };
}

/**
 * Registry-side classification of a discovered file under
 * `src/content/`: which root it lives in, the owning piece's slug (or
 * null for the photographs folder), and whether it is nested deeper than an
 * image's home — `journal/<slug>/<file>` or `photographs/<file>`.
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
  if (root === JOURNAL_ROOT) expectedDepth = 2;
  else if (root === PHOTOGRAPHS_ROOT) expectedDepth = 1;
  else {
    throw new ImageIdError(
      `"${key}" is under ${CONTENT_ROOT}${root}/ — images live in ${JOURNAL_ROOT}/<slug>/ or ${PHOTOGRAPHS_ROOT}/`,
    );
  }
  if (root === JOURNAL_ROOT && rest.length < expectedDepth) {
    // An image directly in journal/ has no entry folder to belong to; a
    // flat `journal/foo.md` beside it would link to a page nobody makes.
    throw new ImageIdError(
      `"${key}" sits directly in ${CONTENT_ROOT}${JOURNAL_ROOT}/ — a journal entry lives in its own folder (${JOURNAL_ROOT}/<slug>/index.md) so its images can have pages`,
    );
  }
  if (root === JOURNAL_ROOT && rest[0] === PHOTOGRAPHS_ROOT) {
    // The photographs rule reads the parent folder alone, so an entry
    // folder of that name would mint bare ids for its images.
    throw new ImageIdError(
      `"${key}" is in a journal entry named "${PHOTOGRAPHS_ROOT}" — that name is the photographs folder's; rename the entry's folder`,
    );
  }
  const pieceSlug = root === JOURNAL_ROOT ? (rest[0] ?? null) : null;
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
      folder: root === JOURNAL_ROOT ? pieceSlug : PHOTOGRAPHS_FOLDER,
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
 * back to the humanized filename. References inside a stages-bodied
 * container — `:::compare`, `:::side`, `:::slider` — don't count
 * (spec 019).
 */
export function firstAltFor(body, basename) {
  for (const block of splitBlocks(body)) {
    // A stage's image text is its label ("Finished"), not the
    // photograph's title (spec 019), so every block whose body is
    // stages — by its BLOCK_BODIES kind, not its name — is skipped.
    if (block.kind === 'container' && BLOCK_BODIES[blockName(block.text)] === 'stages') continue;
    for (const ref of imageReferences(block.text)) {
      if (refersTo(ref.src, basename) && ref.alt) return ref.alt;
    }
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
 * The frames a piece places, as image ids in the piece's own order
 * (spec 008): the order the body first references them — its own images
 * as `<folder>/<basename>`, a borrowed one as `<slug>/<basename>` or
 * the bare `<basename>` — then the folder's unreferenced files by
 * name. `folder` is the piece's own folder segment and
 * `basenames` the images that live in it.
 *
 * A frame referenced twice appears once, at its first reference; so does
 * one written both ways (`./x.jpg` and the long `../<own-slug>/x.jpg`,
 * which the transform refuses but which must not double a frame here).
 * A local reference to a file that isn't in the folder is ignored — it
 * has no id, and the transform has already failed the build over it.
 */
export function pieceFrames(body, folder, basenames) {
  const own = new Set(basenames);
  // Rank by reference order, not text offset: a pair's two slots share
  // one offset, and left must still come before right.
  const firstAt = new Map();
  let rank = 0;
  for (const ref of imageReferences(body)) {
    rank += 1;
    const id = frameIdFor(ref.shape, folder, own);
    if (id && !firstAt.has(id)) firstAt.set(id, rank);
  }
  const referenced = [...firstAt.keys()].sort((a, b) => firstAt.get(a) - firstAt.get(b));
  const unreferenced = [...basenames]
    .filter((b) => !firstAt.has(imageIdOf(folder, b)))
    .sort()
    .map((b) => imageIdOf(folder, b));
  return [...referenced, ...unreferenced];
}

// The id a parsed reference names, or null when it names no frame of
// this piece: a local src for a file the folder doesn't have, a src
// whose extension is not an accepted raster (the rule `refersTo`
// applies — a borrowed image must be a photograph this site pages, and
// the transform refuses any other src), an invalid shape, or a
// remote/root-absolute src.
function frameIdFor(shape, folder, own) {
  if (shape.kind === 'local') {
    return IMAGE_EXTENSIONS.includes(shape.ext) && own.has(shape.basename)
      ? imageIdOf(folder, shape.basename)
      : null;
  }
  if (shape.kind === 'piece' || shape.kind === 'photographs') {
    return IMAGE_EXTENSIONS.includes(shape.ext) ? imageIdOf(shape.folder, shape.basename) : null;
  }
  return null;
}

/**
 * The borrowed image ids a body places (spec 008) — another piece's or
 * the photographs folder's — deduplicated, in document order. The registry
 * checks these against the images it knows (see `referenceProblems`).
 * A borrowed image must be a photograph this site pages, so a src whose
 * extension is not an accepted raster mints no id here — it names no
 * image, and the transform has already refused it.
 */
export function crossReferences(body) {
  const ids = [];
  const seen = new Set();
  for (const ref of imageReferences(body)) {
    const { kind, folder, basename, ext } = ref.shape;
    if (kind !== 'piece' && kind !== 'photographs') continue;
    if (!IMAGE_EXTENSIONS.includes(ext)) continue;
    const id = imageIdOf(folder, basename);
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
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
 * piece's own prose, images then a caption, or a compare's stages
 * (spec 019 — their notes are not the photograph's caption). The transform's
 * descriptor table is the vocabulary's source of truth; this map
 * mirrors it here because this module must stay Astro-free, and a
 * test asserts the two agree — names and kinds.
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
  compare: 'stages',
  side: 'stages',
  slider: 'stages',
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

/**
 * Whether this markdown writes a `:::name` container (spec 019) — read
 * through the same block split the passage uses, so a leaf `::name` or
 * the word in prose doesn't count.
 */
export function hasBlock(text, name) {
  return splitBlocks(text).some(
    (block) => block.kind === 'container' && blockName(block.text) === name,
  );
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
 * label is always present. The compare shows when the camera's frame
 * or a declared stage exists and the story doesn't write its own
 * `:::compare` (spec 019). The processing note has one home: it belongs
 * to the compare when the compare shows, and to the record otherwise,
 * so a record of processing alone doesn't render a section beside the
 * compare that already carries it.
 */
export function sectionsFor(image) {
  const has = (value) => typeof value === 'string' && value.trim() !== '';
  const record = image.record ?? {};
  const print = image.print ?? {};
  const compareShown =
    (Boolean(image.before) || (image.stages?.length ?? 0) > 0) && !image.storyHasCompare;
  const recordShown =
    [record.format, record.filters, record.support].some(has) ||
    (!compareShown && has(record.processing));
  const sections = [];
  if (image.hasStory) sections.push('story');
  sections.push('label');
  if (recordShown) sections.push('record');
  if (compareShown) sections.push('compare');
  if (image.passage) sections.push('passage');
  if (image.related?.length) sections.push('related');
  if ([print.edition, print.sizes, print.paper].some(has)) sections.push('print');
  return sections;
}

/**
 * The compare's shared shape (spec 019), one spelling each, imported by
 * the transform, the image page and the compare script: its methods,
 * the class names its markup carries, and the widths it may take.
 */
export const COMPARE_MODES = Object.freeze(['slider', 'side', 'switch', 'filmstrip']);
export const COMPARE_CLASSES = Object.freeze({
  root: 'compare',
  frames: 'compare-frames',
  stage: 'compare-stage',
  pane: 'compare-pane',
  caption: 'compare-caption',
  label: 'compare-label',
  note: 'compare-note',
});
export const COMPARE_WIDTHS = Object.freeze(['column', 'wide', 'stage']);
/** Tunable: the compare's width per surface. */
export const COMPARE_WIDTH = Object.freeze({ piece: 'column', page: 'column' });
/**
 * The pair blocks' width (spec 019 amendment), one value each of
 * `COMPARE_WIDTHS`: side by side's and the slider's kept widths. A
 * piece is their only surface, so one value per block is all there is.
 */
export const PAIR_WIDTH = Object.freeze({ side: 'wide', slider: 'column' });

const COMPARE_SIZES = Object.freeze({
  column: '(min-width: 720px) 680px, 94vw',
  wide: '(min-width: 1240px) 1160px, 96vw',
  stage: '100vw',
});

/** The `sizes` hint for a compare at one of `COMPARE_WIDTHS`. */
export function compareSizes(width) {
  const sizes = COMPARE_SIZES[width];
  if (sizes === undefined) {
    throw new Error(`unknown compare width "${width}" — allowed: ${COMPARE_WIDTHS.join(' | ')}`);
  }
  return sizes;
}

/**
 * A stage image's request on one surface of `COMPARE_WIDTH`, spelled
 * once for both builders (D1723): the transform's stage images and the
 * image page's section reach `getImage` with it, and neither passes a
 * width, so a stage shown by several blocks of one page is one file.
 */
export function stageImageOptions(surface) {
  return { layout: 'constrained', sizes: compareSizes(COMPARE_WIDTH[surface]) };
}

/**
 * The image page's compare, as `{ src, label, note? }[]`: the camera's
 * frame first (labelled `words.camera`, with `words.cameraNote` when
 * given) when there is one, the declared stages in order, and the photograph last (labelled
 * `words.finished`) with the processing note — the one place the
 * `processing:` fallback is written.
 */
export function compareStages(
  { before, stages, image, processing },
  { camera, cameraNote, finished },
) {
  const list = [];
  if (before) {
    const first = { src: before, label: camera };
    if (cameraNote !== undefined) first.note = cameraNote;
    list.push(first);
  }
  for (const stage of stages ?? []) {
    const entry = { src: stage.src, label: stage.label };
    if (stage.note !== undefined) entry.note = stage.note;
    list.push(entry);
  }
  const last = { src: image, label: finished };
  if (typeof processing === 'string' && processing.trim() !== '') last.note = processing;
  list.push(last);
  return list;
}

// Every image reference in document order, as `{ src, alt, index, shape }`:
// shorthand `![alt](./x.jpg)`, a directive's `src="./x.jpg" alt="…"`,
// and the pair/triptych `left|center|right` slots with their `…Alt`.
// `shape` is the src parsed by `parseReference` — local, borrowed, or
// neither — while `refersTo` stays local-only, so the title, the
// passage, and the story remain a frame's home's (spec 008).
function* imageReferences(text) {
  const refs = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?[^)]*\)|\{([^}]*)\}/g;
  for (const match of String(text).matchAll(refs)) {
    const [, shorthandAlt, shorthandSrc, attrText] = match;
    if (attrText !== undefined) {
      const attrs = parseAttributeText(attrText);
      for (const key of ['src', 'left', 'center', 'right']) {
        if (attrs[key]) {
          const alt = key === 'src' ? attrs.alt : attrs[`${key}Alt`];
          yield { src: attrs[key], alt, index: match.index, shape: parseReference(attrs[key]) };
        }
      }
    } else {
      yield {
        src: shorthandSrc,
        alt: shorthandAlt,
        index: match.index,
        shape: parseReference(shorthandSrc),
      };
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
 * prints what exists and nothing else. `gear` is the parsed gear table
 * (gear.mjs): a camera's Model or a lens string it lists prints as its
 * display name; one it lacks prints as today.
 */
export function formatExposure(raw, gear = EMPTY_GEAR) {
  const tags = raw ?? {};
  const out = {};
  const camera = gear.cameras.get(cleanString(tags.Model)) ?? formatCamera(tags.Make, tags.Model);
  if (camera) out.camera = camera;
  const lensModel = cleanString(tags.LensModel);
  const lens = gear.lenses.get(lensModel) ?? lensModel;
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
 * → the image id it describes: `journal/<slug>/_land-b` → `<slug>/land-b`,
 * `photographs/_dock-b` → `dock-b`.
 */
export function sidecarImageId(entryId) {
  const m = String(entryId).match(/^(?:journal\/([^/]+)|photographs)\/_([^/]+)$/);
  if (!m) {
    throw new ImageIdError(
      `sidecar "${entryId}" is not an _<basename>.md beside an image in ${JOURNAL_ROOT}/<slug>/ or ${PHOTOGRAPHS_ROOT}/`,
    );
  }
  return imageIdOf(m[1] ?? PHOTOGRAPHS_FOLDER, m[2]);
}

/**
 * The sidecar fields that belong to a photograph in the photographs
 * folder alone (spec 019): whether it is a draft, the date it is
 * published under, and its categories. A journal entry's photographs are
 * published and dated by their entry and take their entry's categories,
 * so a journal-folder sidecar may write none of them. The message's tail
 * for each comes from FROM_THE_ENTRY.
 */
export const PHOTOGRAPH_FIELDS = Object.freeze({
  draft: 'draft',
  published: 'published',
  categories: 'categories',
}); // tunable: the names draft and published (categories is the journal's word, not a tunable)
const FROM_THE_ENTRY = Object.freeze({
  draft: 'are published and dated by their entry',
  published: 'are published and dated by their entry',
  categories: "take their entry's categories",
});

/**
 * The photograph-only fields a journal-folder sidecar writes (spec 019).
 * `entries` is `{ file, inJournal, data }[]` — the sidecar's path, whether
 * it sits in a journal folder, and its frontmatter. One line per written
 * field (a written `false` counts), in the order of `entries`; empty when
 * there are none — the caller fails the build with all of them.
 */
export function photographOnlyProblems(entries) {
  const problems = [];
  for (const { file, inJournal, data } of entries) {
    if (!inJournal) continue;
    for (const [key, name] of Object.entries(PHOTOGRAPH_FIELDS)) {
      if (data?.[name] === undefined) continue;
      problems.push(
        `[images] ${file}: "${name}" is for a photograph in src/content/${PHOTOGRAPHS_ROOT}/ — a journal entry's photographs ${FROM_THE_ENTRY[key]}; remove the line`,
      );
    }
  }
  return problems;
}

/**
 * Checks every gallery's image list against the registry: each id must
 * name an image on the site, belong to a published piece (or, in the
 * photographs folder, not be a draft), and appear once. `galleries` is `[{ id, filePath, source,
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
      // An old `gallery/<name>` id gets its own line (spec 019), before
      // the did-you-mean, which would find the bare id but not say why.
      const bare = status === undefined ? oldIdHint(imageId, known) : null;
      let reason;
      if (occurrence > 0) reason = `"${imageId}" is listed more than once`;
      else if (isPrivateRaster(imageId.split('/').at(-1)))
        reason = privateMessage(
          imageId,
          imageId.split('/').at(-1),
          `list "${privateTargetImageId(imageId)}" instead`,
        );
      else if (bare !== null) reason = oldIdMessage(imageId, bare);
      else if (status === undefined)
        reason = `"${imageId}" is not an image on the site${nearestHint(imageId, known)}`;
      else if (status === 'draft')
        reason =
          homeSlugOf(imageId) === null
            ? `"${imageId}" is a draft (its sidecar says draft: true) — publish it or drop it from the gallery`
            : `"${imageId}" belongs to a draft piece — publish the piece or drop the image`;
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
 * The draft rule for borrowed images (spec 008): a published piece may
 * only place a photograph that has a page. `borrower` is the borrowing
 * piece's slug, `ids` the ids it places (from `crossReferences`, plus
 * its cover), `known` the registry's map of every discovered id to
 * 'published' | 'draft' | 'unowned'. The home piece an id names is the
 * folder segment of the id itself, by the identity rule at the top of
 * this file, so it is derived here rather than passed in; a bare id has
 * none, and is a draft by its own sidecar (spec 019). Returns one
 * message per problem, in the order the ids came, empty when there are
 * none — the caller fails the build with all of them.
 */
export function referenceProblems(borrower, ids, known) {
  const problems = [];
  for (const id of ids) {
    const status = known.get(id);
    if (status === 'published') continue;
    if (status === undefined) {
      problems.push(`[images] ${borrower} places ${id}, which is not an image this site pages`);
    } else if (status === 'draft') {
      const home = homeSlugOf(id);
      problems.push(
        home === null
          ? `[images] ${borrower} places ${id}, which is a draft (its sidecar says draft: true) — publish it first, or place a photograph that has a page`
          : `[images] ${borrower} places ${id} from ${home}, which is a draft — publish ${home} first, or place a photograph that has a page`,
      );
    } else {
      problems.push(
        `[images] ${borrower} places ${id}, but src/content/journal/${homeSlugOf(id)}/ has no index.md — it is not a piece yet`,
      );
    }
  }
  return problems;
}

/** An id's home piece slug — its folder by the id rule at the top of this
 *  file, the text before the first `/` — or null for a bare id, which
 *  belongs to no piece. */
export function homeSlugOf(id) {
  const text = String(id);
  const slash = text.indexOf('/');
  return slash < 0 ? null : text.slice(0, slash);
}

// The id a photographs-folder photograph had before spec 019's lexicon.
const OLD_PHOTOGRAPHS_SEGMENT = 'gallery/';

/**
 * The bare id an old `gallery/<name>` id became (spec 019), or null:
 * when `id` begins `gallery/`, is not itself a known id (a journal entry
 * may be named `gallery`), and the rest is a known photographs-folder
 * id. `known` is the registry's map (or set) of every discovered id.
 */
export function oldIdHint(id, known) {
  const text = String(id);
  if (!text.startsWith(OLD_PHOTOGRAPHS_SEGMENT) || known.has(text)) return null;
  const rest = text.slice(OLD_PHOTOGRAPHS_SEGMENT.length);
  return homeSlugOf(rest) === null && known.has(rest) ? rest : null;
}

function oldIdMessage(id, bare) {
  return `"${id}" is an old id — the photograph in src/content/${PHOTOGRAPHS_ROOT}/ is "${bare}" now`;
}

/**
 * A place's declared cover checked against its frames (spec 009): null
 * when there is no cover or it is one of `frames`, else the message —
 * with the old-id line when `oldIdHint` answers. `file` is the place
 * file's path, `known` the registry's map of every discovered id.
 */
export function placeCoverProblem(cover, frames, file, known) {
  if (cover === undefined || cover === null || frames.includes(cover)) return null;
  const bare = oldIdHint(cover, known);
  if (bare !== null) {
    return `[places] ${file}: cover ${oldIdMessage(cover, bare)} (a place's cover must be one of its frames)`;
  }
  return `[places] ${file}: cover "${cover}" is not one of this place's frames`;
}

/**
 * A photographs-folder name that is also a journal slug (spec 019):
 * `/photographs/bank/` would read as the page above
 * `/photographs/bank/<name>/`. `names` is `{ name, file }[]` — the
 * photographs folder's public basenames — and `slugs` `{ slug, where }[]`
 * — every journal entry's id and every journal folder holding images.
 * Compared lowercased, since two addresses differing only in case read
 * as one. One message per pair naming both, in the order of `names`.
 */
export function nameCollisions(names, slugs) {
  const bySlug = new Map();
  for (const entry of slugs) {
    const key = String(entry.slug).toLowerCase();
    if (!bySlug.has(key)) bySlug.set(key, []);
    bySlug.get(key).push(entry);
  }
  const problems = [];
  for (const { name, file } of names) {
    for (const { slug, where } of bySlug.get(String(name).toLowerCase()) ?? []) {
      problems.push(
        `[images] "${name}" is both a photograph (${file}) and a journal entry (${where}) — ${imageUrlFor(name)} would read as the page above ${imageUrlFor(`${slug}/<name>`)}; rename one`,
      );
    }
  }
  return problems;
}

/**
 * Places (spec 009). A frame's place, the slug rules, and the grouping
 * a place page is — pure, so the registry and the tests share one copy
 * of the precedence rather than each writing it out.
 */

/** The word a piece or a sidecar uses for "no place" — never a slug. */
export const PLACE_NONE = 'none';

/**
 * A frame's place: its sidecar's `at` when that names a place, null
 * when the sidecar says `none`, else the piece's default, else null.
 * Blanks are unset, and a piece whose `at` is `none` has no default —
 * the word means on a piece what it means on a sidecar. This is the
 * spec's "a frame's own line always wins", and the only place the
 * precedence is written.
 */
export function placeOf(at, pieceDefault) {
  const own = cleanString(at);
  if (own) return own === PLACE_NONE ? null : own;
  const fallback = cleanString(pieceDefault);
  return !fallback || fallback === PLACE_NONE ? null : fallback;
}

/**
 * A place file's name is its URL: `name` is the file's id (the file
 * name without `.md`), `file` its path for the message. Returns the
 * message, or null when the name is a usable slug.
 */
export function placeNameProblem(name, file) {
  const id = String(name ?? '');
  if (!SLUG.test(id)) {
    return `[places] ${file}: a place's file name is its URL — lowercase letters, digits, and hyphens only`;
  }
  if (id === PLACE_NONE) {
    return `[places] ${file}: "${PLACE_NONE}" is the word for no place — a place needs another name`;
  }
  return null;
}

/**
 * A place's name (spec 019, amendment 5). A place is made by being
 * named: an `at:` whose slug has no place file makes the place, its
 * title read from the slug. The title rule, the shape of a name where
 * it is written, and the guard against a misspelt one.
 */

export const PLACE_TITLE_SMALL_WORDS = Object.freeze([
  'a',
  'an',
  'and',
  'at',
  'by',
  'for',
  'in',
  'of',
  'on',
  'the',
  'to',
]); // tunable: lower case after the first word of a made place's title
export const PLACE_NEAR_MISS = 2; // tunable: letters off that read as a typo
export const PLACE_NEAR_MISS_SHORT = 1; // tunable: the same, for a short name
export const PLACE_SHORT_NAME = 6; // tunable: a name this long or shorter is short

/**
 * The title rule: a made place's title, read from its slug. The words
 * between hyphens, empty ones dropped (`a--b` is a legal file name),
 * each given a capital except a small word after the first, joined by
 * spaces. Digits pass through.
 */
export function placeTitle(slug) {
  return String(slug ?? '')
    .split('-')
    .filter((word) => word !== '')
    .map((word, index) =>
      index > 0 && PLACE_TITLE_SMALL_WORDS.includes(word)
        ? word
        : word[0].toUpperCase() + word.slice(1),
    )
    .join(' ');
}

/**
 * The slug a value that is not one should have been: NFKD, combining
 * marks removed, lower case, every run outside `a-z0-9` one hyphen,
 * hyphens trimmed from the ends. Empty when nothing is left.
 */
function slugSuggestion(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * The shape of a place's name, checked where it is written. `refs` is
 * `{ file, slug }[]` — every `at:` on any journal entry or sidecar,
 * draft or not, already trimmed. A value passes when it is blank,
 * `none`, or a slug holding at least one letter or digit — one step
 * tighter than a place file's name, since `--` would make a place with
 * an empty title. Returns one message per value that is not a name, in
 * the order of `refs`, each showing the slug it should be when there is
 * one to show; empty when there are none, so the caller fails the build
 * with all of them at once.
 */
export function placeAtProblems(refs) {
  const problems = [];
  for (const { file, slug } of refs) {
    if (!slug || slug === PLACE_NONE) continue;
    if (SLUG.test(slug) && /[a-z0-9]/.test(slug)) continue;
    const suggestion = slugSuggestion(slug);
    problems.push(
      `[places] ${file}: at: "${slug}" is not a place's name — lowercase letters, digits and hyphens only, or ${PLACE_NONE} for no place${suggestion ? `: write at: ${suggestion}` : ''}`,
    );
  }
  return problems;
}

/**
 * How many letters off two names are: the fewest single-character
 * insertions, deletions and substitutions that turn `a` into `b`, a
 * swap of two adjacent characters counted as one (optimal string
 * alignment) — the swap is the commonest slip of the hand, and counted
 * as two it would slip past the short-name allowance. Hyphens and
 * digits count as letters.
 */
export function lettersOff(a, b) {
  const from = String(a);
  const to = String(b);
  let before = [];
  let above = Array.from({ length: to.length + 1 }, (_, j) => j);
  for (let i = 1; i <= from.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= to.length; j += 1) {
      const same = from[i - 1] === to[j - 1];
      let off = Math.min(above[j] + 1, row[j - 1] + 1, above[j - 1] + (same ? 0 : 1));
      if (i > 1 && j > 1 && from[i - 1] === to[j - 2] && from[i - 2] === to[j - 1]) {
        off = Math.min(off, before[j - 2] + 1);
      }
      row.push(off);
    }
    before = above;
    above = row;
  }
  return above[to.length];
}

const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * The guard: a name with no place file that is one or two letters off
 * another place's name is a probable typo, and the build refuses it
 * rather than make a second place in silence. `refs` is `{ file, slug
 * }[]` — every `at:`, a draft's included, already trimmed — and
 * `declared` `{ slug, file }[]`, every place file, drafts included.
 * The names with no file are the distinct slugs of `refs` that are not
 * blank, not `none` and not declared; each is measured against every
 * declared slug and against every other name with no file, once per
 * pair. A pair is refused within `PLACE_NEAR_MISS` letters —
 * `PLACE_NEAR_MISS_SHORT` when the longer of the two names has
 * `PLACE_SHORT_NAME` characters or fewer. Two declared slugs are never
 * measured against each other. Returns one message per pair, pairs
 * sorted by name, empty when there are none.
 */
export function nearMissProblems(refs, declared) {
  const placeFiles = new Map(declared.map(({ slug, file }) => [slug, file]));
  const writers = new Map();
  for (const { file, slug } of refs) {
    if (!slug || slug === PLACE_NONE || placeFiles.has(slug)) continue;
    if (!writers.has(slug)) writers.set(slug, []);
    writers.get(slug).push(file);
  }
  const written = (name) => {
    const [first, ...rest] = writers.get(name);
    return `"${name}" (${rest.length > 0 ? `${first} and ${rest.length} more` : first})`;
  };
  const near = (a, b) => {
    const off = lettersOff(a, b);
    const allowance =
      Math.max(a.length, b.length) <= PLACE_SHORT_NAME ? PLACE_NEAR_MISS_SHORT : PLACE_NEAR_MISS;
    return off <= allowance ? `${off} letter${off === 1 ? '' : 's'} off` : null;
  };
  const toAdd = (name) => `src/content/places/${name}.md`;
  const ways = 'Correct the spelling; or, if they really are two places, add';

  const names = [...writers.keys()].sort(byCodeUnit);
  const pairs = [];
  for (const [index, name] of names.entries()) {
    for (const [place, file] of placeFiles) {
      const off = near(name, place);
      if (off === null) continue;
      pairs.push({
        first: name,
        second: place,
        message: `[places] ${written(name)} is ${off} the place "${place}" (${file}) — a probable typo. ${ways} ${toAdd(name)}`,
      });
    }
    for (const other of names.slice(index + 1)) {
      const off = near(name, other);
      if (off === null) continue;
      pairs.push({
        first: name,
        second: other,
        message: `[places] ${written(name)} is ${off} ${written(other)}, and neither has a place file — one is a probable typo. ${ways} ${toAdd(name)} and ${toAdd(other)}`,
      });
    }
  }
  return pairs
    .sort((a, b) => byCodeUnit(a.first, b.first) || byCodeUnit(a.second, b.second))
    .map((pair) => pair.message);
}

/**
 * The order of a place's outings (spec 019): a journal outing is dated by
 * its entry's publish date, a photographs-folder frame — an outing of its
 * own — by its capture date. `journal` is `{ key: slug, date }[]`,
 * `photographs` `{ key: id, date }[]`; returns the keys oldest first, a
 * tie putting the journal outing first, then by key.
 */
export function outingOrder(journal, photographs) {
  const outings = [
    ...journal.map(({ key, date }) => ({ key, date, rank: 0 })),
    ...photographs.map(({ key, date }) => ({ key, date, rank: 1 })),
  ];
  return outings
    .sort(
      (a, b) =>
        a.date.valueOf() - b.date.valueOf() ||
        a.rank - b.rank ||
        String(a.key).localeCompare(String(b.key)),
    )
    .map((outing) => outing.key);
}

/**
 * A photographs-folder frame at a place with no capture date (spec 019)
 * cannot be ordered among the outings, and the build refuses it rather
 * than guess. `entries` is `{ file, slug, date }[]` — the sidecar (or
 * image) path, the place it stands at or null, and its capture date —
 * and the result one message per undated frame at a place, in order.
 */
export function undatedAtPlace(entries) {
  const problems = [];
  for (const { file, slug, date } of entries) {
    if (!slug) continue;
    if (date instanceof Date && !Number.isNaN(date.valueOf())) continue;
    problems.push(
      `[places] ${file}: names the place "${slug}" but has no capture date, which orders it on the wall — add a date: line to the sidecar`,
    );
  }
  return problems;
}

/**
 * A place's outings and its frames. `framesByOuting` maps an outing key
 * to its frames — a journal slug to the entry's frames in its order
 * (borrowed ids included — that is what the registry holds), a
 * photographs-folder id to `[id]` — `placeOfId` an image id to its
 * resolved place or null, `order` the outing keys oldest first
 * (`outingOrder`). Only an outing's own frames count — a frame's outing
 * is its journal slug, or itself in the photographs folder — so a
 * borrowed frame is never counted under the borrower; an outing exists
 * only where it has at least one frame at the place, and a place's
 * frames are its outings' frames concatenated — the set the arrows step
 * through. A place with no frame is absent.
 */
export function groupByPlace(framesByOuting, placeOfId, order) {
  const places = new Map();
  for (const key of order) {
    const outing = new Map();
    for (const id of framesByOuting.get(key) ?? []) {
      if ((homeSlugOf(id) ?? id) !== key) continue;
      const place = placeOfId.get(id);
      if (!place) continue;
      const frames = outing.get(place) ?? [];
      frames.push(id);
      outing.set(place, frames);
    }
    for (const [place, frames] of outing) {
      const entry = places.get(place) ?? { outings: [], frames: [] };
      entry.outings.push({ key, frames });
      entry.frames.push(...frames);
      places.set(place, entry);
    }
  }
  return places;
}

/**
 * The roll of places (spec 019, amendment 5). `declared` is
 * `{ slug, draft }[]`, the place files in their order; `grouped` is
 * `groupByPlace`'s map. Every declared place, in order — 'draft',
 * 'declared' (it has frames) or 'empty' — then every grouped name
 * with no file, sorted: 'made'. Returns `{ slug, status }[]`.
 */
export function placeRoll(declared, grouped) {
  const files = new Set(declared.map(({ slug }) => slug));
  return [
    ...declared.map(({ slug, draft }) => ({
      slug,
      status: draft ? 'draft' : grouped.has(slug) ? 'declared' : 'empty',
    })),
    ...[...grouped.keys()]
      .filter((slug) => !files.has(slug))
      .sort(byCodeUnit)
      .map((slug) => ({ slug, status: 'made' })),
  ];
}

/**
 * What the build says about places (spec 019, amendment 5). Every note
 * opens with `PLACE_NOTE`, which is what `scripts/verify.sh` greps the
 * build log for to print the notes as a group of their own. None fails
 * the build: the registry prints them with `console.warn`.
 */

export const PLACE_NOTE = '[places] note:'; // tunable: with the notes' wording and grouping below

const photographsCount = (count) => `${count} ${count === 1 ? 'photograph' : 'photographs'}`;

/**
 * The made place's line: its slug, the title read from it, how many
 * published photographs name it, and the file that would take it over.
 */
export function madePlaceNote(slug, title, count) {
  return `${PLACE_NOTE} made ${slug} ("${title}") — ${photographsCount(count)}; src/content/places/${slug}.md would take it over`;
}

/**
 * The published photographs that name no place. `photographs` is
 * `{ id, at, entryAt }[]` — every published photograph, its sidecar's
 * `at:` and its journal entry's, as written. A photograph names no
 * place when its own line is blank and, in a journal folder, its
 * entry's is blank too. `none` is not blank on either line: it says no
 * place on purpose, and is left off — which is why the entry's line is
 * read here as written and not through `placeOf`, where an entry's
 * `none` is no default. The photographs folder's are one line, a count
 * and their ids, sorted; each journal entry's one line with a count,
 * entries sorted by slug. Empty when there is nothing to say.
 */
export function noPlaceNotes(photographs) {
  const folder = [];
  const byEntry = new Map();
  for (const { id, at, entryAt } of photographs) {
    if (cleanString(at)) continue;
    const slug = homeSlugOf(id);
    if (slug === null) {
      folder.push(String(id));
      continue;
    }
    if (cleanString(entryAt)) continue;
    byEntry.set(slug, (byEntry.get(slug) ?? 0) + 1);
  }
  const nameNoPlace = (count) => (count === 1 ? 'names no place' : 'name no place');
  const onPurpose = `at: ${PLACE_NONE} says none on purpose`;
  const notes = [];
  if (folder.length > 0) {
    notes.push(
      `${PLACE_NOTE} ${photographsCount(folder.length)} in src/content/photographs/ ${nameNoPlace(folder.length)} — ${folder.sort(byCodeUnit).join(', ')} (at: <slug> in a sidecar names one; ${onPurpose})`,
    );
  }
  for (const slug of [...byEntry.keys()].sort(byCodeUnit)) {
    const count = byEntry.get(slug);
    notes.push(
      `${PLACE_NOTE} ${photographsCount(count)} in src/content/journal/${slug}/ ${nameNoPlace(count)} (at: <slug> in its index.md names one for the folder; ${onPurpose})`,
    );
  }
  return notes;
}

/**
 * A place card's meta line — "2 outings · 7 frames · 2019–2026", with
 * singulars and one year when the outings share one. `outings` is what
 * `groupByPlace` returns; `dateByOuting` maps an outing key to its date
 * (a journal entry's publish date, a photograph's capture date), read as
 * UTC like every date the site prints.
 */
export function placeSummary(outings, dateByOuting) {
  const frames = outings.reduce((total, outing) => total + outing.frames.length, 0);
  const years = outings
    .map((outing) => dateByOuting.get(outing.key))
    .filter((date) => date instanceof Date && !Number.isNaN(date.valueOf()))
    .map((date) => date.getUTCFullYear())
    .sort((a, b) => a - b);
  const parts = [
    `${outings.length} ${outings.length === 1 ? 'outing' : 'outings'}`,
    `${frames} ${frames === 1 ? 'frame' : 'frames'}`,
  ];
  if (years.length > 0) {
    const first = years[0];
    const last = years.at(-1);
    parts.push(first === last ? `${first}` : `${first}–${last}`);
  }
  return parts.join(' · ');
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
