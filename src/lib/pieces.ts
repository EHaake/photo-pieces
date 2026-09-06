import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Every published (non-draft) piece, newest first — the one definition of
 * "published" and of ordering, shared by every consumer (homepage, pieces
 * index, reading page, RSS, OG images; galleries will be next). Extracted
 * at 002's pre-merge review, which found five independent copies of the
 * filter drifting toward inconsistency.
 *
 * Not unit-tested: `astro:content` is a Vite virtual module that only
 * exists inside Astro's build graph, so this module can't load under the
 * plain Vitest setup. The draft-exclusion behavior is exercised by build
 * verification instead (a draft piece produces no page and appears in no
 * consumer's output).
 */
export async function getPublishedPieces() {
  return (await getCollection('pieces', isPublished)).sort(byNewestPublished);
}

/** The one piece ordering — newest first by publishDate, ties settled by
 *  id so lists are stable across builds. Shared with the image registry
 *  (spec 008), whose sets and appearances must agree with the site's
 *  order by construction rather than by a second copy of this rule. */
export const byNewestPublished = (
  a: CollectionEntry<'pieces'>,
  b: CollectionEntry<'pieces'>,
): number =>
  b.data.publishDate.valueOf() - a.data.publishDate.valueOf() || a.id.localeCompare(b.id);

/** The mirror of `byNewestPublished` — oldest first, the same tie order by
 *  id — kept beside it so the two cannot disagree. A place's outings read
 *  oldest first (spec 009). */
export const byOldestPublished = (
  a: CollectionEntry<'pieces'>,
  b: CollectionEntry<'pieces'>,
): number =>
  a.data.publishDate.valueOf() - b.data.publishDate.valueOf() || a.id.localeCompare(b.id);

/** The one definition of "published" — shared with the image registry,
 *  which unpublishes a piece's images by the same rule (spec 004). */
export function isPublished(piece: CollectionEntry<'pieces'>): boolean {
  return !piece.data.draft;
}
