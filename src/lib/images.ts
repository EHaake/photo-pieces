import type { ImageMetadata } from 'astro';
import { root } from 'astro:config/server';
import { getCollection, type CollectionEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readExposure } from './exif.mjs';
import { isPublished } from './pieces';
import {
  classifyContentImage,
  findIdCollisions,
  firstAltFor,
  formatCollision,
  formatExposure,
  formatGalleryProblems,
  humanizeBasename,
  imageUrlFor,
  mergeOverrides,
  orderLatestWork,
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
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  date?: Date;
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

let registry: Promise<ImageRegistry> | undefined;

export function getImageRegistry(): Promise<ImageRegistry> {
  registry ??= buildRegistry();
  return registry;
}

type Status = 'published' | 'draft' | 'unowned';

async function buildRegistry(): Promise<ImageRegistry> {
  const pieces = await getCollection('pieces');
  const pieceById = new Map(pieces.map((piece) => [piece.id, piece]));

  // Discovery: classify every file, drop nested ones with a warning.
  const files: {
    key: string;
    id: string;
    folder: string;
    basename: string;
    pieceSlug: string | null;
  }[] = [];
  for (const key of Object.keys(discovered).sort()) {
    const info = classifyContentImage(key);
    if (info.nested || !('id' in info)) {
      console.warn(
        `[images] ignoring ${key}: images live directly in a piece folder or the gallery root, not in sub-folders`,
      );
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
          galleries: galleries.filter((gallery) => gallery.data.images.includes(file.id)),
          sidecar,
          title,
          caption: sidecar?.data.caption,
          label,
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

function byNewest(a: CollectionEntry<'galleries'>, b: CollectionEntry<'galleries'>): number {
  const ad = a.data.date?.valueOf() ?? -Infinity;
  const bd = b.data.date?.valueOf() ?? -Infinity;
  return bd - ad || a.data.title.localeCompare(b.data.title);
}
