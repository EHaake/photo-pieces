import { describe, expect, it } from 'vitest';
import { FRONT_DOOR, mergeLatest } from './src/lib/front-door.mjs';

// The front door's latest list (spec 019, T1741): the journal's entries
// and the photographs with a `published:` date, newest first, a tie to
// the journal entry, cut to FRONT_DOOR.latest. Each case is a row: the
// journal and photographs given, the length (default when absent), and
// the list expected as `<kind>:<id>` in order.

const day = (iso) => new Date(`${iso}T00:00:00Z`);
const entry = (id, iso) => ({ id, date: day(iso) });

// The journal as the page passes it — today's order, newest first.
const JOURNAL = [
  entry('vocabulary-sampler', '2026-09-01'),
  entry('first-light-at-the-jetty', '2026-08-30'),
  entry('market-day-camera-low', '2026-08-30'),
  entry('older-entry', '2026-08-01'),
];

const CASES = [
  {
    name: "no photographs → the first three journal entries, in today's order",
    journal: JOURNAL,
    photographs: [],
    expected: [
      'journal:vocabulary-sampler',
      'journal:first-light-at-the-jetty',
      'journal:market-day-camera-low',
    ],
  },
  {
    name: 'a photograph newer than every entry → first',
    journal: JOURNAL,
    photographs: [entry('dock-b', '2026-09-10')],
    expected: [
      'photograph:dock-b',
      'journal:vocabulary-sampler',
      'journal:first-light-at-the-jetty',
    ],
  },
  {
    name: 'a photograph dated between two entries → between them',
    journal: JOURNAL,
    photographs: [entry('dock-b', '2026-08-31')],
    expected: [
      'journal:vocabulary-sampler',
      'photograph:dock-b',
      'journal:first-light-at-the-jetty',
    ],
  },
  {
    name: 'a tie → the journal entry first, then the photograph',
    journal: JOURNAL,
    photographs: [entry('aaa-before-every-entry-by-id', '2026-09-01')],
    expected: [
      'journal:vocabulary-sampler',
      'photograph:aaa-before-every-entry-by-id',
      'journal:first-light-at-the-jetty',
    ],
  },
  {
    name: 'a tie within a kind → by id, whatever order the input came in',
    journal: [entry('b-entry', '2026-08-30'), entry('a-entry', '2026-08-30')],
    photographs: [entry('d-photo', '2026-08-29'), entry('c-photo', '2026-08-29')],
    length: 4,
    expected: ['journal:a-entry', 'journal:b-entry', 'photograph:c-photo', 'photograph:d-photo'],
  },
  {
    name: 'a list longer than length → cut to length',
    journal: JOURNAL,
    photographs: [entry('dock-b', '2026-08-31'), entry('dock-a', '2026-07-01')],
    length: 2,
    expected: ['journal:vocabulary-sampler', 'photograph:dock-b'],
  },
  {
    name: 'a list longer than FRONT_DOOR.latest, no length given → cut to FRONT_DOOR.latest',
    journal: JOURNAL,
    photographs: [entry('dock-b', '2026-08-31'), entry('dock-a', '2026-07-01')],
    expected: [
      'journal:vocabulary-sampler',
      'photograph:dock-b',
      'journal:first-light-at-the-jetty',
    ],
  },
];

describe('the front door (T1741)', () => {
  it('FRONT_DOOR.latest is 3, and the tunables are frozen', () => {
    expect(FRONT_DOOR).toEqual({ latest: 3 });
    expect(Object.isFrozen(FRONT_DOOR)).toBe(true);
  });

  for (const { name, journal, photographs, length, expected } of CASES) {
    it(`mergeLatest: ${name}`, () => {
      const merged = mergeLatest(journal, photographs, length);
      expect(merged.map(({ kind, id }) => `${kind}:${id}`)).toEqual(expected);
    });
  }

  it("mergeLatest carries each item's date through unchanged", () => {
    const [first] = mergeLatest([], [entry('dock-b', '2026-08-31')]);
    expect(first).toEqual({ kind: 'photograph', id: 'dock-b', date: day('2026-08-31') });
  });
});
