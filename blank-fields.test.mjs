import { describe, expect, it } from 'vitest';
import { withoutBlankFields } from './src/lib/blank-fields.ts';

// A blank field means not set (spec 019, T1735e): the step every
// collection's schema runs before it validates (src/content.config.ts).
// Pinned here on the function itself, since the schemas import
// `astro:content` and cannot run under Vitest.

describe('a blank field means not set (T1735e, spec 019)', () => {
  it('a field with nothing after it (null) is read as if the line were not there', () => {
    expect(withoutBlankFields({ title: 'Dock, late', place: null })).toEqual({
      title: 'Dock, late',
    });
    expect('place' in withoutBlankFields({ place: null })).toBe(false);
  });

  it('an empty string is not set', () => {
    expect(withoutBlankFields({ title: '', lens: 'Fixture 50mm' })).toEqual({
      lens: 'Fixture 50mm',
    });
  });

  it('a string of whitespace alone is not set', () => {
    expect(withoutBlankFields({ title: '  \t', caption: '\n' })).toEqual({});
  });

  it('an empty list is not set', () => {
    expect(withoutBlankFields({ categories: [], stages: [] })).toEqual({});
  });

  it("a nested stage's blank note is not set, and the stage and its other fields stay", () => {
    expect(
      withoutBlankFields({
        stages: [
          { file: '_dock-b.tones.jpg', label: 'Tones', note: null },
          { file: '_dock-b.colour.jpg', label: 'Colour', note: '' },
          { file: '_dock-b.crop.jpg', label: 'Crop', note: 'Tighter on the boats.' },
        ],
      }),
    ).toEqual({
      stages: [
        { file: '_dock-b.tones.jpg', label: 'Tones' },
        { file: '_dock-b.colour.jpg', label: 'Colour' },
        { file: '_dock-b.crop.jpg', label: 'Crop', note: 'Tighter on the boats.' },
      ],
    });
  });

  it('0, false and a non-empty value are kept', () => {
    const date = new Date(Date.UTC(2026, 7, 29));
    const written = {
      iso: 0,
      draft: false,
      title: 'Dock, late',
      categories: ['street'],
      date,
    };
    expect(withoutBlankFields(written)).toEqual(written);
    expect(withoutBlankFields(written).date).toBe(date);
  });
});
