import type { ImageMetadata } from 'astro';
import { root } from 'astro:config/server';
import { getCollection, type CollectionEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readExposure } from './exif.mjs';
import { GEAR_FILE, parseGearTable, unknownGear } from './gear.mjs';
import type { SetKind } from './image-set';
import { byNewestPublished, byOldestPublished, isPublished } from './pieces';
import {
  attachPrivates,
  classifyContentImage,
  crossReferences,
  findIdCollisions,
  firstAltFor,
  formatCollision,
  formatExposure,
  formatGalleryProblems,
  groupByPlace,
  hasBlock,
  homeSlugOf,
  humanizeBasename,
  ImageIdError,
  imageUrlFor,
  isPrivateRaster,
  mergeOverrides,
  nearest,
  neighbours,
  passageFor,
  pieceFrames,
  placeNameProblem,
  placeOf,
  placeProblems,
  placeSummary,
  privateMessage,
  referenceProblems,
  resolveStages,
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
 * gallery in its curated order, the piece's frames in the order the
 * piece shows them, or, since spec 009, the place's frames. Neighbours
 * are ids — resolve through `byId` — so the registry stays a tree, not
 * a graph. The kind is `SetKind` (image-set.ts), the one definition the
 * layout's click handler and the image page's script also read.
 */
export interface ImageSet {
  kind: SetKind;
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

/**
 * A place that publishes (spec 009): its writing, its outings — the
 * published pieces with at least one frame at it, oldest first, each
 * outing's frames in that piece's own order — and the card's summary.
 * Frames are ids only, so an image can point at its place without a
 * cycle. A draft place, or one with no published frame, is not here.
 */
export interface SitePlace {
  slug: string;
  entry: CollectionEntry<'places'>;
  title: string;
  /** `/places/<slug>/` (site-root; pages apply withBase). */
  url: string;
  /** Oldest first; each outing's frames in the piece's order, own-folder only. */
  outings: { piece: CollectionEntry<'pieces'>; frames: string[] }[];
  /** The outings' frames concatenated — the set the arrows step through. */
  frames: string[];
  /** An id among `frames`: the declared cover, else the most recent outing's first frame. */
  cover: string;
  /** The most recent outing's publishDate — the index's order. */
  latest: Date;
  /** "N outings · M frames · 2019–2026" (placeSummary). */
  summary: string;
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
  /** The place this frame is at (spec 009) — null when it names none,
   *  when its place is a draft, or at the gallery root. */
  place: SitePlace | null;
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
  /** The steps between the camera's frame and the photograph (spec 019),
   *  in the sidecar's `stages:` order — each a private file
   *  (`_<basename>.<word>.<ext>`) with its label and note. Empty when the
   *  sidecar lists none. Never images of the site. */
  stages: { image: ImageMetadata; label: string; note?: string }[];
  /** The loupe's export (`_<basename>.detail.<ext>` beside the image,
   *  spec 019), found by name; null when there is none. Private, like
   *  the frame. */
  detail: ImageMetadata | null;
  /** The story writes its own `:::compare` (spec 019), so the page's
   *  built-in compare stands aside. */
  storyHasCompare: boolean;
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
  /** Every published place (spec 009), most recent outing first, ties by title. */
  places: SitePlace[];
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

  // Places (spec 009): a place file's name is its URL segment and the
  // value every `at:` line names, so nothing may sit between the two —
  // the id must be a slug, and never `none`. All bad names at once.
  const placeEntries = await getCollection('places');
  const placeNameProblems = placeEntries.flatMap((entry) => {
    const problem = placeNameProblem(
      entry.id,
      entry.filePath ?? `src/content/places/${entry.id}.md`,
    );
    return problem ? [problem] : [];
  });
  if (placeNameProblems.length) {
    throw new Error(placeNameProblems.join('\n'));
  }
  const placeById = new Map(placeEntries.map((entry) => [entry.id, entry]));

  // Discovery: classify every file, drop nested ones with a warning,
  // set private rasters (the camera's frame, spec 006; a stage and the
  // loupe's export, spec 019) aside for their photographs — they never
  // get an id.
  const files: {
    key: string;
    id: string;
    folder: string;
    basename: string;
    pieceSlug: string | null;
  }[] = [];
  const privates: { key: string; folder: string; basename: string; file: string }[] = [];
  for (const key of Object.keys(discovered).sort()) {
    const info = classifyContentImage(key) as Classified;
    if (info.nested) {
      console.warn(
        `[images] ignoring ${key}: images live directly in a piece folder or the gallery root, not in sub-folders`,
      );
      continue;
    }
    if (info.private) {
      privates.push({ key, folder: info.folder, basename: info.basename, file: info.file });
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

  // Private files (spec 006, widened at spec 019): each must sit beside
  // its photograph — by basename, whatever the extensions — in a folder
  // the site knows, published or not (a frame in a draft piece's folder
  // is fine). An orphan is the author's typo, and silence would hide it;
  // two frames, or two detail exports, for one photograph is a choice
  // the site can't make for them. All at once.
  const basenamesByFolder = new Map<string, Set<string>>();
  for (const file of files) {
    if (!basenamesByFolder.has(file.folder)) basenamesByFolder.set(file.folder, new Set());
    basenamesByFolder.get(file.folder)!.add(file.basename);
  }
  const family = attachPrivates(privates, basenamesByFolder) as {
    frame: Map<string, string>;
    detail: Map<string, string>;
    stages: Map<string, { file: string; key: string }[]>;
    problems: string[];
  };
  if (family.problems.length) {
    throw new Error(
      `[images] private file${family.problems.length > 1 ? 's' : ''}:\n${family.problems.join('\n')}`,
    );
  }

  // Sidecars: each must describe an image that exists (published or
  // not — a sidecar on a draft piece's image is fine, a typo is not).
  const sidecars = new Map<string, CollectionEntry<'imageMeta'>>();
  const orphans: string[] = [];
  // Each sidecar's `stages:` (spec 019), checked against its photograph's
  // own stage files; the problems of every sidecar, thrown at once.
  const stagesById = new Map<string, SiteImage['stages']>();
  const stageProblems: string[] = [];
  const sidecarEntries = await getCollection('imageMeta');
  for (const entry of sidecarEntries) {
    const imageId = sidecarImageId(entry.id);
    if (!known.has(imageId)) {
      orphans.push(
        `${entry.filePath ?? entry.id} describes "${imageId}", which is not an image on the site`,
      );
    } else {
      sidecars.set(imageId, entry);
      const resolved = resolveStages(
        entry.data.stages,
        family.stages.get(imageId),
        entry.filePath ?? entry.id,
      ) as { stages: { key: string; label: string; note?: string }[]; problems: string[] };
      stageProblems.push(...resolved.problems);
      stagesById.set(
        imageId,
        resolved.stages.map(({ key, label, note }) => ({
          image: discovered[key].default,
          label,
          ...(note === undefined ? {} : { note }),
        })),
      );
    }
  }
  if (orphans.length) {
    throw new Error(
      `[images] orphan sidecar${orphans.length > 1 ? 's' : ''}:\n${orphans.join('\n')}`,
    );
  }
  if (stageProblems.length) {
    throw new Error(`[images] stages:\n${stageProblems.join('\n')}`);
  }

  // The slug rule (spec 009): every `at:` other than `none`, on any
  // piece — draft or not, a typo in a draft is still a typo — and on
  // any sidecar, must name a declared place, draft or not. All at once.
  const slugProblems = placeProblems(
    [
      ...pieces.map((piece) => ({
        file: piece.filePath ?? piece.id,
        slug: (piece.data.at ?? '').trim(),
      })),
      ...sidecarEntries.map((entry) => ({
        file: entry.filePath ?? entry.id,
        slug: (entry.data.at ?? '').trim(),
      })),
    ],
    placeById.keys(),
  );
  if (slugProblems.length) {
    throw new Error(slugProblems.join('\n'));
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

  // Where each published frame was made (spec 009): its sidecar's `at`,
  // else its piece's default — `placeOf` is the only copy of that
  // precedence. A draft place resolves to no place, so the frame's label
  // shows the free text alone and links nowhere; the note names it below.
  // A gallery-root frame has no piece to group under, so a place page
  // could never show it: the line is checked for its slug and ignored.
  const placeOfId = new Map<string, string | null>();
  for (const file of files) {
    if (known.get(file.id) !== 'published') continue;
    const sidecar = sidecars.get(file.id) ?? null;
    if (file.pieceSlug === null) {
      if (placeOf(sidecar?.data.at, undefined) !== null) {
        console.warn(
          `[places] ${sidecar!.filePath ?? sidecar!.id}: gallery-root photographs are not grouped under a place — the line is ignored`,
        );
      }
      continue;
    }
    const slug = placeOf(sidecar?.data.at, pieceById.get(file.pieceSlug)?.data.at);
    placeOfId.set(file.id, slug && !placeById.get(slug)?.data.draft ? slug : null);
  }

  // The outings: for each published piece oldest first, its own-folder
  // frames in the piece's order, bucketed by place. A place publishes
  // when it has an outing and is not a draft; otherwise the build says
  // so and builds nothing for it. The cover, checked only on a place
  // that publishes, must be one of its frames — a place declared ahead
  // of its first outing may name a frame not yet published.
  const publishedOldestFirst = pieces.filter(isPublished).sort(byOldestPublished);
  const dateByPiece = new Map(
    publishedOldestFirst.map((piece) => [piece.id, piece.data.publishDate]),
  );
  const grouped = groupByPlace(
    framesByPiece,
    placeOfId,
    publishedOldestFirst.map((piece) => piece.id),
  );
  const coverProblems: string[] = [];
  const sitePlaces: SitePlace[] = [];
  for (const entry of placeEntries) {
    if (entry.data.draft) {
      console.warn(`[places] note: ${entry.id} is a draft — no page, and its frames show no place`);
      continue;
    }
    const group = grouped.get(entry.id);
    if (!group) {
      console.warn(
        `[places] note: ${entry.id} has no published frame yet — no page until a photograph names it`,
      );
      continue;
    }
    const outings = group.outings.map((outing: { piece: string; frames: string[] }) => ({
      piece: pieceById.get(outing.piece)!,
      frames: outing.frames,
    }));
    const newest = outings.at(-1)!;
    const cover = entry.data.cover;
    if (cover !== undefined && !group.frames.includes(cover)) {
      coverProblems.push(
        `[places] ${entry.filePath ?? `src/content/places/${entry.id}.md`}: cover "${cover}" is not one of this place's frames`,
      );
      continue;
    }
    sitePlaces.push({
      slug: entry.id,
      entry,
      title: entry.data.title,
      url: `/places/${entry.id}/`,
      outings,
      frames: group.frames,
      cover: cover ?? newest.frames[0],
      latest: newest.piece.data.publishDate,
      summary: placeSummary(group.outings, dateByPiece),
    });
  }
  if (coverProblems.length) {
    throw new Error(coverProblems.join('\n'));
  }
  const places = sitePlaces.sort(
    (a, b) => b.latest.valueOf() - a.latest.valueOf() || a.title.localeCompare(b.title),
  );
  const placeBySlug = new Map(places.map((place) => [place.slug, place]));

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

  // The published set, with labels. The gear table (spec 019) names
  // the camera and lens; each image's raw tags are kept, in file order,
  // for the warnings below.
  const gear = parseGearTable(await readFile(new URL(GEAR_FILE, root), 'utf8'), GEAR_FILE);
  const rawTags: { file: string; raw: object }[] = [];
  const images = await Promise.all(
    files
      .filter((file) => known.get(file.id) === 'published')
      .map(async (file, index): Promise<SiteImage> => {
        const piece = file.pieceSlug === null ? null : (pieceById.get(file.pieceSlug) ?? null);
        const sidecar = sidecars.get(file.id) ?? null;
        const raw = await readExposure(fileURLToPath(new URL(`.${file.key}`, root)));
        rawTags[index] = { file: file.key.slice(1), raw };
        const exposure = formatExposure(raw, gear);
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
        // The place, last of the sets (spec 009): the default set stays
        // the gallery or the piece, and the arrows step through the
        // place's frames only for a reader who arrived from its page.
        const place = placeBySlug.get(placeOfId.get(file.id) ?? '') ?? null;
        if (place) {
          sets.push({
            kind: 'place',
            id: place.slug,
            title: place.title,
            url: place.url,
            count: place.frames.length,
            ...neighbours(place.frames, file.id),
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
          place,
          title,
          caption: sidecar?.data.caption,
          label,
          hasStory: (sidecar?.body ?? '').trim() !== '',
          record: pick(sidecar?.data, ['format', 'filters', 'support', 'processing']),
          print: pick(sidecar?.data, ['edition', 'sizes', 'paper']),
          before: family.frame.has(file.id)
            ? discovered[family.frame.get(file.id)!].default
            : null,
          stages: stagesById.get(file.id) ?? [],
          detail: family.detail.has(file.id)
            ? discovered[family.detail.get(file.id)!].default
            : null,
          storyHasCompare: hasBlock(sidecar?.body ?? '', 'compare'),
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
  for (const { kind, value, file } of unknownGear(rawTags, gear)) {
    console.warn(
      `[gear] no display name for the ${kind} "${value}" (first in ${file}) — add it to ${GEAR_FILE}`,
    );
  }

  const byId = new Map(images.map((image) => [image.id, image]));

  return {
    images,
    byId,
    galleries,
    places,
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
