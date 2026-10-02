import { describe, expect, it } from 'vitest';
import { CATEGORIES, categoryRow, eyebrowCategories } from './src/lib/categories.ts';

// The category row (spec 010): three pages render it and only one of
// them marks a current category, so the rule for what the row contains
// is pinned here rather than in the component.

describe('the category row (T802, spec 010)', () => {
  it('without a current category the row is the four categories, each a link, and no All', () => {
    const row = categoryRow();
    expect(row.map((item) => item.label)).toEqual(['Landscape', 'Street', 'Portrait', 'Event']);
    expect(row.map((item) => item.href)).toEqual([
      '/categories/landscape/',
      '/categories/street/',
      '/categories/portrait/',
      '/categories/event/',
    ]);
  });

  it('with a current category All leads to the pieces index and the current item is not a link', () => {
    const row = categoryRow('street');
    expect(row).toHaveLength(5);
    expect(row[0]).toEqual({ label: 'All', href: '/journal/' });
    expect(row.slice(1).map((item) => item.label)).toEqual([
      'Landscape',
      'Street',
      'Portrait',
      'Event',
    ]);
    expect(row.find((item) => item.href === null)).toEqual({ label: 'Street', href: null });
    expect(row.filter((item) => item.href === null)).toHaveLength(1);
    expect(row.slice(1).map((item) => item.href)).toEqual([
      '/categories/landscape/',
      null,
      '/categories/portrait/',
      '/categories/event/',
    ]);
  });

  it("the row's order is CATEGORIES' own, not a hard-coded list", () => {
    const row = categoryRow();
    expect(row.map((item) => item.href)).toEqual(
      CATEGORIES.map((category) => `/categories/${category}/`),
    );
  });
});

// The eyebrow on a photograph's page (spec 019, amendment 4): one page
// renders it, so the rule for which categories it shows is pinned here
// rather than in the page.

describe("the eyebrow's categories (T1750, spec 019)", () => {
  it("the journal entry's categories win over a sidecar line and the galleries'", () => {
    expect(
      eyebrowCategories({ entry: ['event'], own: ['street'], galleries: ['landscape'] }),
    ).toEqual(['event']);
  });

  it("a sidecar line wins whole — the galleries' are not merged in", () => {
    expect(eyebrowCategories({ entry: null, own: ['street'], galleries: ['landscape'] })).toEqual([
      'street',
    ]);
  });

  it("a sidecar line's order is kept", () => {
    expect(eyebrowCategories({ entry: null, own: ['street', 'landscape'], galleries: [] })).toEqual(
      ['street', 'landscape'],
    );
  });

  it("without a line the galleries' categories, deduplicated, first seen first", () => {
    expect(
      eyebrowCategories({
        entry: null,
        own: undefined,
        galleries: ['landscape', 'street', 'landscape'],
      }),
    ).toEqual(['landscape', 'street']);
  });

  it("an empty line falls back to the galleries' (the schema refuses it; the rule does not rely on that)", () => {
    expect(eyebrowCategories({ entry: null, own: [], galleries: ['portrait'] })).toEqual([
      'portrait',
    ]);
  });

  it('with nothing, no categories', () => {
    expect(eyebrowCategories({ entry: null, own: undefined, galleries: [] })).toEqual([]);
  });
});
