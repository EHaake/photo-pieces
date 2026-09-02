import type { ImageMetadata } from 'astro';

/**
 * The getImage() options for a page's Open Graph image (spec 004).
 *
 * The output must be an optimized, metadata-stripped file — never the
 * original, which may carry EXIF the site doesn't publish. Astro's
 * image service hands the original bytes through untouched when the
 * requested width and format equal the source's, so a 1200px-wide JPEG
 * asked for at 1200px as JPEG came back with its GPS block intact
 * (caught by the post-build scan at T312). Asking for one pixel less
 * in that one case forces a real transform; every other request is a
 * resize or a format change already.
 */
export function ogImageOptions(source: ImageMetadata) {
  const target = Math.min(1200, source.width);
  const wouldPassThrough =
    target === source.width && (source.format === 'jpg' || source.format === 'jpeg');
  return { src: source, width: wouldPassThrough ? target - 1 : target, format: 'jpg' as const };
}
