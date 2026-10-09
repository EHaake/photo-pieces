// The front door's latest list (spec 019): the journal's entries and the
// photographs that carry a `published:` date, in one list, newest first.
// A pure module so the suite can load it — the page's own code runs only
// inside Astro, and src/lib/pieces.ts imports `astro:content`.

/** The list's tunables, each one value in one place. */
export const FRONT_DOOR = Object.freeze({
  latest: 3, // the list's length
});

const KIND_ORDER = Object.freeze({ journal: 0, photograph: 1 });

/**
 * Merges the journal's entries and the published photographs, newest
 * first by date; a tie puts the journal entry first, then orders by id
 * (the journal's own tie rule, `byNewestPublished`); cut to `length`.
 *
 * @param {{ id: string, date: Date }[]} journal
 * @param {{ id: string, date: Date }[]} photographs
 * @param {number} [length]
 * @returns {{ kind: 'journal' | 'photograph', id: string, date: Date }[]}
 */
export function mergeLatest(journal, photographs, length = FRONT_DOOR.latest) {
  return [
    ...journal.map(({ id, date }) => ({ kind: 'journal', id, date })),
    ...photographs.map(({ id, date }) => ({ kind: 'photograph', id, date })),
  ]
    .sort(
      (a, b) =>
        b.date.valueOf() - a.date.valueOf() ||
        KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
        a.id.localeCompare(b.id),
    )
    .slice(0, length);
}
