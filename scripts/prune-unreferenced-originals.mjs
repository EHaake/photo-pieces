// Post-build cleanup (spec 004): remove original image files that Astro
// emitted into dist/_astro/ but nothing in the site references.
//
// Why this exists: Astro emits every ESM-imported image as an asset
// (`name.<hash>.jpg`) so its image service can read it, generates the
// transforms (`name.<hash>_<hash>.webp` …), then deletes the original
// unless it was "referenced outside of image processing". In this
// static build that check marks every imported image as referenced —
// piece covers and the image registry's imports alike — so the
// untouched originals (metadata included) ship alongside the
// transforms, unlinked from any page. Spec 004's contract is that an
// original never reaches the output, so this does the deletion Astro
// meant to: an original is pruned when no file in dist/ mentions its
// name. (Until spec 006 the rule also required a transform sibling, as
// the sign Astro had processed the image — but an image that is
// imported and never rendered has no transforms and still ships as an
// original, which the GPS scan caught at T403 with the camera's-frame
// fixture. Unreferenced is the whole test: nothing can reach a file no
// page names.) Runs from `postbuild` before the GPS scan
// (scripts/check-no-gps.mjs), which stays the barrier if this ever
// misses.
//
//   node scripts/prune-unreferenced-originals.mjs [dist]
import { readdir, readFile, unlink } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { IMAGE_EXTENSIONS } from '../src/lib/image-meta.mjs';

const root = process.argv[2] ?? 'dist';
const assets = join(root, '_astro');
// The registry's accepted formats plus the ones Astro can emit for a
// plain markdown image; matched case-insensitively (`.JPG` is accepted).
const RASTER = new Set([...IMAGE_EXTENSIONS, 'tif', 'gif'].map((ext) => `.${ext}`));
const TEXT = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.xml',
  '.txt',
  '.webmanifest',
  '.svg',
]);

// An emitted original is `<base>.<hash>.<ext>`; its transforms are
// `<base>.<hash>_<hash>.<ext>` — the underscore separates them.
const ORIGINAL = /^(.+\.[A-Za-z0-9_-]+)\.([a-z]+)$/i;
const TRANSFORM = /^(.+\.[A-Za-z0-9_-]+)_[A-Za-z0-9_-]+\.[a-z]+$/i;

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

const names = await readdir(assets).catch(() => []);
const candidates = names.filter((name) => {
  if (!RASTER.has(extname(name).toLowerCase())) return false;
  if (TRANSFORM.test(name)) return false;
  return ORIGINAL.test(name);
});

if (candidates.length === 0) {
  console.log(`[prune-originals] no emitted originals in ${assets}/.`);
  process.exit(0);
}

// One pass over every text file in dist/, looking for any candidate's
// name; a page linking an original directly keeps it.
const referenced = new Set();
for await (const file of files(root)) {
  if (!TEXT.has(extname(file).toLowerCase())) continue;
  const text = await readFile(file, 'utf8');
  for (const name of candidates) if (text.includes(name)) referenced.add(name);
}

let pruned = 0;
for (const name of candidates) {
  if (referenced.has(name)) continue;
  await unlink(join(assets, name));
  pruned += 1;
}
console.log(
  `[prune-originals] ${candidates.length} emitted originals in ${assets}/: pruned ${pruned} unreferenced, kept ${referenced.size} referenced.`,
);
