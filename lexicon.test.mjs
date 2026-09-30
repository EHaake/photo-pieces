import { describe, expect, it } from 'vitest';
import {
  INDEX_NARROW_SHORT_PX,
  INDEX_SHORT_PX,
  byIndexOrder,
  indexFlowStyle,
} from './src/lib/gallery-layout.ts';
import { FOOTER_LINKS, NAV_ITEMS } from './src/consts.ts';

// The lexicon's tunable envelope (spec 019): each knob in its one place,
// pinned here by name and value, so a change to one is a deliberate edit
// of this file too.

const ids = (list) => [...list].sort(byIndexOrder).map((x) => x.id);

describe('the photographs index (spec 019, T1747)', () => {
  it('the frame size: INDEX_SHORT_PX is 88 and INDEX_NARROW_SHORT_PX 72, both in the clamp', () => {
    expect(INDEX_SHORT_PX).toBe(88);
    expect(INDEX_NARROW_SHORT_PX).toBe(72);
    expect(indexFlowStyle).toContain('--gallery-short: clamp(72px, 11vw, 88px)');
  });

  it('the order ignores case: "bank" before "Dock, late"', () => {
    expect(
      ids([
        { id: 'dock-a', title: 'Dock, late' },
        { id: 'bank', title: 'bank' },
      ]),
    ).toEqual(['bank', 'dock-a']);
  });

  it('the order reads numbers as numbers: "Frame 2" before "Frame 10"', () => {
    expect(
      ids([
        { id: 'f10', title: 'Frame 10' },
        { id: 'f2', title: 'Frame 2' },
      ]),
    ).toEqual(['f2', 'f10']);
  });

  it('equal titles order by id', () => {
    expect(
      ids([
        { id: 'fog/land-b', title: 'Fog' },
        { id: 'fog/land-a', title: 'Fog' },
      ]),
    ).toEqual(['fog/land-a', 'fog/land-b']);
  });
});

describe('the footer and the nav (spec 019, T1747)', () => {
  it('the footer holds one link to /photographs/, "Index of photographs", after Contact; the nav none', () => {
    const index = FOOTER_LINKS.filter((l) => l.href === '/photographs/');
    expect(index).toEqual([{ href: '/photographs/', label: 'Index of photographs' }]);
    expect(FOOTER_LINKS.map((l) => l.href)).toEqual(['/contact/', '/photographs/']);
    expect(NAV_ITEMS.filter((i) => i.href === '/photographs/')).toEqual([]);
  });
});
