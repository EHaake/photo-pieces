import { describe, expect, it } from 'vitest';
import { COMPARE_PATTERN, parseCompareBody } from './obsidian-plugin/compare.ts';

// The plugin's reading of a :::compare body (spec 019, T1714). Live
// Preview itself is attested by the photographer; this is the parse.

const flow = [
  '![Camera](./_land-b.jpg) Straight out of the camera, flat profile.',
  "![Tones](./_land-b.tones.jpg) Shadows lifted on the ridge, the fog's highlights held.",
  '![Finished](./land-b.jpg) A touch of warmth over the whole frame.',
].join('\n');

const expected = [
  { src: './_land-b.jpg', label: 'Camera', note: 'Straight out of the camera, flat profile.' },
  {
    src: './_land-b.tones.jpg',
    label: 'Tones',
    note: "Shadows lifted on the ridge, the fog's highlights held.",
  },
  { src: './land-b.jpg', label: 'Finished', note: 'A touch of warmth over the whole frame.' },
];

describe('parseCompareBody', () => {
  it("reads the flow's three lines as three stages, each image's text its label and the rest of the line its note", () => {
    expect(parseCompareBody(flow)).toEqual(expected);
  });

  it('reads stages separated by blank lines as it reads one stage per line', () => {
    const spaced = flow.split('\n').join('\n\n');
    expect(parseCompareBody(spaced)).toEqual(expected);
  });

  it('skips a stray line before the first image rather than making it a stage or a note', () => {
    const stray = `A line that belongs to no stage.\n${flow}`;
    expect(parseCompareBody(stray)).toEqual(expected);
  });
});

describe('COMPARE_PATTERN', () => {
  it("matches the flow's whole block, attributes and all, and captures the body between the fences", () => {
    const doc = `Before.\n\n:::compare{mode="slider"}\n${flow}\n:::\n\nAfter.`;
    const match = new RegExp(COMPARE_PATTERN, 'gm').exec(doc);
    expect(match?.[0]).toBe(`:::compare{mode="slider"}\n${flow}\n:::`);
    expect(match?.[2]).toBe(flow);
  });
});
