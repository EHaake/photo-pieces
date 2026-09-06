import type { ImageMetadata } from 'astro';
import { root } from 'astro:config/server';
import { getCollection, type CollectionEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readExposure } from './exif.mjs';
import { byNewestPublished, isPublished } from './pieces';
import {
  classifyContentImage,
  crossReferences,
  findIdCollisions,
  firstAltFor,
  formatCollision,
  formatExposure,
  formatGalleryProblems,
  homeSlugOf,
  humanizeBasename,
  ImageIdError,
  imageUrlFor,
  isPrivateRaster,
  mergeOverrides,
  nearest,
  neighbours,
  orderLatestWork,
  passageFor,
  pieceFrames,
  privateMessage,
  referenceProblems,
  sidecarImageId,
  validateGalleries,
} from './image-meta.mjs';

/**
 * The image registry (spec 004): every accepted raster in a published
 * piece's folder or the gallery root, with a stable id, Astro image
 * metadata for `<Image>`, the wall-label data (EXIF, overridden by a
 * sidecar), and back-references to its piece and galleries. Built once
 * per process and awaited by every page's `getStaticPaths`, so the
 * validation here — id collisions, orphan sidecars, gallery lists
 * naming missing or unpublished images — fails `astro build` even when
 * no page would have rendered the offending thing.
 *
 * The pure rules live in image-meta.mjs and are unit-tested there;
 * this module is the Astro-coupled shell (`astro:content`,
 * `import.meta.glob`), verified by build like `pieces.ts`.
 *
 * Dev-server note: the registry is cached for the life of the module.
 * Adding, removing, or renaming images needs a dev restart.
 */

export interface ImageLabel {
  /** Spec 006, sidecar-only: where and when, in the photographer's words. */
  place?: string;
  time?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  date?: Date;
}

/** "How it was made" (spec 006) — sidecar fields, all optional. */
export interface ImageRecord {
  format?: string;
  filters?: string;
  support?: string;
  processing?: string;
}

/** "The print" (spec 006) — sidecar fields, all optional. */
export interface ImagePrint {
  edition?: string;
  sizes?: string;
  paper?: string;
}

/**
 * A set the reader can step through from an image (spec 006): a
 * gallery in its curated order, or the piece's frames in the order the
 * piece shows them. Neighbours are ids — resolve through `byId` — so
 * the registry stays a tree, not a graph.
 */
export interface ImageSet {
  kind: 'gallery' | 'piece';
  /** The gallery's or piece's id. */
  id: string;
  title: string;
  /** Site-root path; pages apply `withBase`. */
  url: string;
  /** 0-based position in the set. */
  index: number;
  count: number;
  prev?: string;
  next?: string;
}

/** The passage of the piece an image sits in — markdown source. */
export interface ImagePassage {
  prose?: string;
  caption?: string;
}

export interface SiteImage {
  /** `<piece-folder>/<basename>` or `gallery/<basename>`. */
  id: string;
  /** `/images/<id>/`. */
  url: string;
  folder: string;
  basename: string;
  /** Astro's image metadata — pass to `<Image src>` or `getImage`. */
  image: ImageMetadata;
  /** The owning piece, or null for a gallery-root image. */
  piece: CollectionEntry<'pieces'> | null;
  /** Galleries that include this image, newest first. */
  galleries: CollectionEntry<'galleries'>[];
  sidecar: CollectionEntry<'imageMeta'> | null;
  /** Sidecar title → first alt in the piece body → humanized filename. */
  title: string;
  caption?: string;
  label: ImageLabel;
  /** The sidecar body has content — the image's story (spec 006). */
  hasStory: boolean;
  record: ImageRecord;
  print: ImagePrint;
  /** The camera's frame (`_<basename>.<ext>` beside the image), for the
   *  raw-to-finished compare; null when there is none. Never an image
   *  of the site — no id, no page. */
  before: ImageMetadata | null;
  /** Every set this image belongs to: its galleries newest first, then
   *  its home piece, then each other piece that places it, newest first
   *  (spec 008). `sets[0]` is the default the page shows. */
  sets: ImageSet[];
  /** The published pieces other than the home that place this image —
   *  in their body or as their cover — newest first (spec 008). Empty
   *  when only the home shows it. */
  appearances: CollectionEntry<'pieces'>[];
  /** Ids of the nearest other frames of the same outing (the piece
   *  folder, in the piece's order) — up to six; none at the gallery root. */
  related: string[];
  passage: ImagePassage | null;
}

export interface ImageRegistry {
  images: SiteImage[];
  byId: Map<string, SiteImage>;
  /** Every gallery, newest first (undated last). */
  galleries: CollectionEntry<'galleries'>[];
  /** The n newest curated images — see orderLatestWork. */
  latest(limit: number): SiteImage[];
}

// Both letter cases: the site accepts camera-style `.JPG` too, and the
// glob is case-sensitive, so the pattern has to say so.
const discovered = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/{pieces,gallery-images}/**/*.{jpg,jpeg,png,webp,avif,tiff,JPG,JPEG,PNG,WEBP,AVIF,TIFF}',
  { eager: true },
);

/** The related strip's cap (spec 006): the nearest frames of the outing. */
const RELATED_LIMIT = 6;

let registry: Promise<ImageRegistry> | undefined;

export function getImageRegistry(): Promise<ImageRegistry> {
  registry ??= buildRegistry();
  return registry;
}

type Status = 'published' | 'draft' | 'unowned';

// classifyContentImage's three shapes (image-meta.mjs is plain JS, and
// its inferred union is too loose to narrow on): nested, private, image.
type Classified = { path: string; root: string; pieceSlug: string | null } & (
  | { nested: true }
  | {
      nested: false;
      private: true;
      folder: string;
      basename: string;
      target: string;
      ext: string;
      file: string;
    }
  | {
      nested: false;
      private: false;
      id: string;
      folder: string;
      basename: string;
      ext: string;
      file: string;
    }
);

async function buildRegistry(): Promise<ImageRegistry> {
  const pieces = await getCollection('pieces');
  const pieceById = new Map(pieces.map((piece) => [piece.id, piece]));

  // Discovery: classify every file, drop nested ones with a warning,
  // set private rasters (camera's frames, spec 006) aside for their
  // photographs — they never get an id.
  const files: {
    key: string;
    id: string;
    folder: string;
    basename: string;
    pieceSlug: string | null;
  }[] = [];
  const privates: { key: string; folder: string; target: string }[] = [];
  for (const key of Object.keys(discovered).sort()) {
    const info = classifyContentImage(key) as Classified;
    if (info.nested) {
      console.warn(
        `[images] ignoring ${key}: images live directly in a piece folder or the gallery root, not in sub-folders`,
      );
      continue;
    }
    if (info.private) {
      privates.push({ key, folder: info.folder, target: info.target });
      continue;
    }
    files.push({
      key,
      id: info.id,
      folder: info.folder,
      basename: info.basename,
      pieceSlug: info.pieceSlug,
    });
  }

  // A piece's `cover` is a reference too, and since spec 008 it may be
  // another piece's or the gallery root's image — so the registry needs
  // its id, not just its filename. The built `src` is hashed; the id
  // comes from the source path Astro's ImageMetadata carries, read
  // straight off the entry (the field is `@internal` and
  // non-enumerable, so a spread, a clone, or a JSON round-trip loses it
  // silently — and its absence is a build failure, not a shrug). Body
  // references are the transform's to refuse; this is the frontmatter
  // half: a camera's frame here would present the raw as the piece's
  // face on every list. A cover that is not an image of the site — a
  // sub-folder, a non-photograph format, a file outside the content
  // root — is Astro's business to render and counts as no appearance.
  const coverIdByPiece = new Map<string, string>();
  for (const piece of pieces) {
    const cover = piece.data.cover as (ImageMetadata & { fsPath?: string }) | undefined;
    if (!cover) continue;
    const where = piece.filePath ?? piece.id;
    if (cover.fsPath === undefined) {
      throw new Error(
        `[images] ${where}: the cover's source path is unavailable (Astro's ImageMetadata.fsPath) — the registry cannot tell whose photograph it is`,
      );
    }
    // The private rule is applied to the file name first, before any
    // classification: `classifyContentImage` answers `nested` before it
    // looks at the basename, so a camera's frame in a sub-folder would
    // otherwise slip past the refusal on a technicality of path shape.
    const coverFile = cover.fsPath.split('/').at(-1)!;
    const dot = coverFile.lastIndexOf('.');
    const coverBasename = dot > 0 ? coverFile.slice(0, dot) : coverFile;
    if (isPrivateRaster(coverBasename)) {
      throw new Error(
        `[images] ${where}: ${privateMessage(coverFile, coverBasename, 'choose the photograph itself as the cover')}`,
      );
    }
    let info: Classified;
    try {
      info = classifyContentImage(cover.fsPath) as Classified;
    } catch (error) {
      // An ImageIdError here — a file outside the content root, a format
      // the site doesn't page, a name that can't be a URL segment — means
      // the cover is not an image of the site: Astro's to render, and no
      // appearance. Anything else thrown is a real fault, not a verdict.
      if (error instanceof ImageIdError) continue;
      throw error;
    }
    if (info.nested) continue;
    if (info.private) {
      throw new Error(
        `[images] ${where}: ${privateMessage(info.file, info.basename, 'choose the photograph itself as the cover')}`,
      );
    }
    coverIdByPiece.set(piece.id, info.id);
  }

  const collisions = findIdCollisions(files.map((f) => f.key));
  if (collisions.length) {
    throw new Error(`[images] ${collisions.map(formatCollision).join('\n')}`);
  }

  // Publication status by ownership. A piece folder without an
  // index.md isn't a piece yet; its images stay unpublished.
  const known = new Map<string, Status>();
  const folderWarned = new Set<string>();
  for (const file of files) {
    let status: Status = 'published';
    if (file.pieceSlug !== null) {
      const piece = pieceById.get(file.pieceSlug);
      if (!piece) {
        status = 'unowned';
        if (!folderWarned.has(file.pieceSlug)) {
          folderWarned.add(file.pieceSlug);
          console.warn(
            `[images] src/content/pieces/${file.pieceSlug}/ has images but no index.md — they stay unpublished until the piece exists`,
          );
        }
      } else if (!isPublished(piece)) {
        status = 'draft';
      }
    }
    known.set(file.id, status);
  }

  // Camera's frames: each must sit beside its photograph — by basename,
  // whatever the two extensions — in a folder the site knows, published
  // or not (a frame in a draft piece's folder is fine). An orphan is
  // the author's typo, and silence would hide it; two frames for one
  // photograph is a choice the site can't make for them.
  const basenamesByFolder = new Map<string, Set<string>>();
  for (const file of files) {
    if (!basenamesByFolder.has(file.folder)) basenamesByFolder.set(file.folder, new Set());
    basenamesByFolder.get(file.folder)!.add(file.basename);
  }
  const frameProblems: string[] = [];
  const beforeByTarget = new Map<string, ImageMetadata>();
  for (const frame of privates) {
    const targetId = `${frame.folder}/${frame.target}`;
    const where = frame.key.replace(/^\//, '');
    if (!basenamesByFolder.get(frame.folder)?.has(frame.target)) {
      frameProblems.push(
        `${where} has no photograph: a "_" raster is the camera's frame of the image with the same name, so "${frame.target}.<ext>" should sit beside it`,
      );
    } else if (beforeByTarget.has(targetId)) {
      frameProblems.push(
        `${where} is a second camera's frame for "${targetId}" — keep one (any accepted extension)`,
      );
    } else {
      beforeByTarget.set(targetId, discovered[frame.key].default);
    }
  }
  if (frameProblems.length) {
    throw new Error(
      `[images] camera's frame${frameProblems.length > 1 ? 's' : ''}:\n${frameProblems.join('\n')}`,
    );
  }

  // Sidecars: each must describe an image that exists (published or
  // not — a sidecar on a draft piece's image is fine, a typo is not).
  const sidecars = new Map<string, CollectionEntry<'imageMeta'>>();
  const orphans: string[] = [];
  for (const entry of await getCollection('imageMeta')) {
    const imageId = sidecarImageId(entry.id);
    if (!known.has(imageId)) {
      orphans.push(
        `${entry.filePath ?? entry.id} describes "${imageId}", which is not an image on the site`,
      );
    } else {
      sidecars.set(imageId, entry);
    }
  }
  if (orphans.length) {
    throw new Error(
      `[images] orphan sidecar${orphans.length > 1 ? 's' : ''}:\n${orphans.join('\n')}`,
    );
  }

  // Galleries: validated with file + line against everything known.
  const galleryEntries = await getCollection('galleries');
  const problems = validateGalleries(
    await Promise.all(
      galleryEntries.map(async (gallery) => ({
        id: gallery.id,
        filePath: gallery.filePath ?? `src/content/galleries/${gallery.id}.md`,
        source: gallery.filePath
          ? await readFile(new URL(gallery.filePath, root), 'utf8')
          : undefined,
        images: gallery.data.images,
      })),
    ),
    known,
  );
  if (problems.length) {
    throw new Error(`[images] gallery problems:\n${formatGalleryProblems(problems)}`);
  }
  const galleries = [...galleryEntries].sort(byNewest);

  // Each published piece's frames in the piece's own order (spec 006,
  // ids since 008): the images it places — its own, where the body
  // first shows them, with a borrowed one in its place, then its
  // folder's unreferenced files. This is the set a reader steps through
  // from that piece and the pool its related strips draw on.
  const ownBasenames = new Map<string, string[]>();
  for (const file of files) {
    if (known.get(file.id) !== 'published' || file.pieceSlug === null) continue;
    if (!ownBasenames.has(file.pieceSlug)) ownBasenames.set(file.pieceSlug, []);
    ownBasenames.get(file.pieceSlug)!.push(file.basename);
  }
  const framesByPiece = new Map<string, string[]>();
  for (const piece of pieces) {
    if (!isPublished(piece)) continue;
    framesByPiece.set(
      piece.id,
      pieceFrames(piece.body ?? '', piece.id, ownBasenames.get(piece.id) ?? []),
    );
  }

  // The draft rule (spec 008): every image a published piece borrows —
  // in its body or as its cover — must be a photograph with a page of
  // its own. Checked before any set is built, so a refused id never
  // reaches a neighbour link; a draft piece is skipped, as its images
  // are. A piece's own folder needs no check: it is published with the
  // piece.
  const borrowProblems: string[] = [];
  for (const piece of pieces) {
    if (!isPublished(piece)) continue;
    const borrowed = crossReferences(piece.body ?? '');
    const coverId = coverIdByPiece.get(piece.id);
    // A cover from elsewhere is a borrowed image too — unless the body
    // already placed it, since `crossReferences` deduplicates and the
    // cover must not undo that with a second copy.
    if (coverId && homeSlugOf(coverId) !== piece.id && !borrowed.includes(coverId)) {
      borrowed.push(coverId);
    }
    borrowProblems.push(...referenceProblems(piece.id, borrowed, known));
  }
  if (borrowProblems.length) {
    throw new Error(borrowProblems.join('\n'));
  }

  // Who shows what (spec 008). `framePieces` drives the sets — a piece
  // whose frames hold the image gives the reader arrows through that
  // piece's order — and `appearancePieces` the "Also in" line, which
  // counts a cover too even though a cover is no frame. Both are newest
  // first — `byNewestPublished`, the very comparator getPublishedPieces
  // sorts with — because the loop that fills them is.
  const framePieces = new Map<string, CollectionEntry<'pieces'>[]>();
  const appearancePieces = new Map<string, CollectionEntry<'pieces'>[]>();
  for (const piece of pieces.filter(isPublished).sort(byNewestPublished)) {
    const frames = framesByPiece.get(piece.id) ?? [];
    for (const id of frames) push(framePieces, id, piece);
    const shown = new Set(frames);
    const coverId = coverIdByPiece.get(piece.id);
    if (coverId) shown.add(coverId);
    for (const id of shown) push(appearancePieces, id, piece);
  }

  // The published set, with labels.
  const images = await Promise.all(
    files
      .filter((file) => known.get(file.id) === 'published')
      .map(async (file): Promise<SiteImage> => {
        const piece = file.pieceSlug === null ? null : (pieceById.get(file.pieceSlug) ?? null);
        const sidecar = sidecars.get(file.id) ?? null;
        const exposure = formatExposure(
          await readExposure(fileURLToPath(new URL(`.${file.key}`, root))),
        );
        const label: ImageLabel = mergeOverrides(exposure, sidecar?.data);
        Object.assign(label, pick(sidecar?.data, ['place', 'time']));
        const inGalleries = galleries.filter((gallery) => gallery.data.images.includes(file.id));
        const sets: ImageSet[] = inGalleries.map((gallery) => ({
          kind: 'gallery',
          id: gallery.id,
          title: gallery.data.title,
          url: `/galleries/${gallery.id}/`,
          count: gallery.data.images.length,
          ...neighbours(gallery.data.images, file.id),
        }));
        const homeFrames = piece ? (framesByPiece.get(piece.id) ?? []) : [];
        if (piece) {
          sets.push({
            kind: 'piece',
            id: piece.id,
            title: piece.data.title,
            url: `/pieces/${piece.id}/`,
            count: homeFrames.length,
            ...neighbours(homeFrames, file.id),
          });
        }
        // Then the pieces that borrow it, newest first: from each, the
        // arrows step through that piece's frames (spec 008).
        const borrowers = (framePieces.get(file.id) ?? []).filter(
          (other) => other.id !== piece?.id,
        );
        for (const other of borrowers) {
          const frames = framesByPiece.get(other.id) ?? [];
          sets.push({
            kind: 'piece',
            id: other.id,
            title: other.data.title,
            url: `/pieces/${other.id}/`,
            count: frames.length,
            ...neighbours(frames, file.id),
          });
        }
        const title =
          sidecar?.data.title ??
          (piece ? firstAltFor(piece.body ?? '', file.basename) : undefined) ??
          humanizeBasename(file.basename);
        return {
          id: file.id,
          url: imageUrlFor(file.id),
          folder: file.folder,
          basename: file.basename,
          image: discovered[file.key].default,
          piece,
          galleries: inGalleries,
          sidecar,
          title,
          caption: sidecar?.data.caption,
          label,
          hasStory: (sidecar?.body ?? '').trim() !== '',
          record: pick(sidecar?.data, ['format', 'filters', 'support', 'processing']),
          print: pick(sidecar?.data, ['edition', 'sizes', 'paper']),
          before: beforeByTarget.get(file.id) ?? null,
          sets,
          appearances: (appearancePieces.get(file.id) ?? []).filter(
            (other) => other.id !== piece?.id,
          ),
          // The outing's frames, not the borrowers': the home piece's
          // own folder, in the home's order (spec 008).
          related: piece
            ? nearest(
                homeFrames.filter((id) => id.startsWith(`${file.folder}/`)),
                file.id,
                RELATED_LIMIT,
              )
            : [],
          passage: piece ? passageFor(piece.body ?? '', file.basename) : null,
        };
      }),
  );

  const byId = new Map(images.map((image) => [image.id, image]));
  const captureDates = new Map(
    images.flatMap((image) => (image.label.date ? [[image.id, image.label.date] as const] : [])),
  );
  const galleryLists = galleries.map((gallery) => ({
    id: gallery.id,
    date: gallery.data.date,
    images: gallery.data.images,
  }));

  return {
    images,
    byId,
    galleries,
    latest: (limit) =>
      orderLatestWork(galleryLists, captureDates, limit).map((id: string) => byId.get(id)!),
  };
}

// The named sidecar fields that are non-empty strings, as an object —
// an author clearing a field in Obsidian shouldn't leave a blank row.
function pick<K extends string>(
  data: Partial<Record<K, string>> | undefined,
  keys: readonly K[],
): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  for (const key of keys) {
    const value = data?.[key];
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

// Append to a map of lists, creating the list on first use.
function push<T>(map: Map<string, T[]>, key: string, value: T): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

function byNewest(a: CollectionEntry<'galleries'>, b: CollectionEntry<'galleries'>): number {
  const ad = a.data.date?.valueOf() ?? -Infinity;
  const bd = b.data.date?.valueOf() ?? -Infinity;
  return bd - ad || a.data.title.localeCompare(b.data.title);
}
