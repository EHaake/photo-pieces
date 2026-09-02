// The one place the site reads EXIF from an image file (spec 004).
//
// Two independent barriers keep anything beyond the exposure fields —
// GPS above all — from ever reaching a page: exifr is asked for exactly
// the allowlisted tags with GPS parsing disabled, and the result is
// filtered to the same allowlist on the way out, so a future change in
// exifr's option semantics can't widen what comes back. The post-build
// scan (scripts/check-no-gps.mjs) is the third barrier, on the output.
import exifr from 'exifr';
import { EXPOSURE_TAGS } from './image-meta.mjs';

const OPTIONS = Object.freeze({
  pick: [...EXPOSURE_TAGS],
  gps: false,
  interop: false,
  ifd1: false,
  thumbnail: false,
  xmp: false,
  iptc: false,
  icc: false,
  jfif: false,
  ihdr: false,
});

/**
 * Reads the allowlisted exposure tags from an image file, in exifr's
 * raw value shapes (numbers; a Date for DateTimeOriginal) — see
 * formatExposure for the wall-label strings. A file with no EXIF reads
 * as an empty object; a file exifr can't open fails naming the path,
 * so a corrupt image stops the build with a file name rather than a
 * stack trace.
 */
export async function readExposure(filePath) {
  let raw;
  try {
    raw = await exifr.parse(filePath, OPTIONS);
  } catch (error) {
    throw new Error(`could not read EXIF from ${filePath}: ${error.message}`, { cause: error });
  }
  const out = {};
  if (raw) {
    for (const tag of EXPOSURE_TAGS) {
      if (raw[tag] !== undefined) out[tag] = raw[tag];
    }
  }
  return out;
}
