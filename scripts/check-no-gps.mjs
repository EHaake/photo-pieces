// Post-build barrier (spec 004): no image in the built site may carry
// GPS metadata. The image registry never reads GPS and Astro's image
// service strips metadata from everything it optimizes — this is the
// check on the OUTPUT, so a future path that copies an original into
// dist/ (a `public/` file, an unprocessed import) fails the build here
// rather than publishing a location. Runs from `postbuild`, so CI's
// build step can't go green with a leak.
//
//   node scripts/check-no-gps.mjs [dir]     # default: dist
//
// sharp reads every raster format the site emits (webp and avif
// included, which exifr can't open on its own) and hands back the raw
// EXIF and XMP blocks; exifr decodes the EXIF, XMP is searched as text.
import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import exifr from 'exifr';
import sharp from 'sharp';

const root = process.argv[2] ?? 'dist';
const RASTER = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);
const EXIF_GPS = /^(GPS|latitude$|longitude$)/;
const XMP_GPS = /GPS(Latitude|Longitude|Position|Altitude|DateStamp|TimeStamp)/i;

async function* rasters(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* rasters(path);
    else if (RASTER.has(extname(entry.name).toLowerCase())) yield path;
  }
}

async function gpsIn(file) {
  const meta = await sharp(file).metadata();
  const hits = [];
  if (meta.exif) {
    // sharp returns the APP1 payload, "Exif\0\0" + TIFF; exifr wants
    // the TIFF.
    const tiff = meta.exif.subarray(meta.exif.indexOf('Exif\0\0') === 0 ? 6 : 0);
    const tags = await exifr
      .parse(tiff, { tiff: true, ifd0: true, exif: true, gps: true, xmp: false, mergeOutput: true })
      .catch(() => null);
    for (const key of Object.keys(tags ?? {})) if (EXIF_GPS.test(key)) hits.push(`exif:${key}`);
  }
  if (meta.xmp) {
    const match = meta.xmp.toString('utf8').match(XMP_GPS);
    if (match) hits.push(`xmp:${match[0]}`);
  }
  return [...new Set(hits)];
}

let scanned = 0;
const leaks = [];
for await (const file of rasters(root)) {
  scanned += 1;
  const hits = await gpsIn(file);
  if (hits.length > 0) leaks.push({ file, hits });
}

if (leaks.length > 0) {
  console.error(
    `[check-no-gps] ${leaks.length} of ${scanned} images in ${root}/ carry GPS metadata:`,
  );
  for (const leak of leaks) console.error(`  ${leak.file} — ${leak.hits.join(', ')}`);
  process.exit(1);
}
console.log(`[check-no-gps] ${scanned} images scanned in ${root}/ — no GPS metadata.`);
