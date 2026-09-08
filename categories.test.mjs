import { describe, expect, it } from 'vitest';
import { CATEGORIES, categoryRow } from './src/lib/categories.ts';

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
    expect(row[0]).toEqual({ label: 'All', href: '/pieces/' });
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
