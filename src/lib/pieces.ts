import { getCollection } from 'astro:content';

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
  return (await getCollection('pieces', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
}
