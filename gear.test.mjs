import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { readExposure } from './src/lib/exif.mjs';
import { EMPTY_GEAR, GEAR_FILE, parseGearTable, unknownGear } from './src/lib/gear.mjs';
import {
  classifyContentImage,
  formatExposure,
  IMAGE_EXTENSIONS,
  mergeOverrides,
} from './src/lib/image-meta.mjs';

// Spec 019's gear names: the table in src/content/gear.md, its parser,
// the label's lookup, and the warning's rule — read against the
// committed table and the repo's real image files.

const repo = (path) => fileURLToPath(new URL(`./${path}`, import.meta.url));
const tableText = readFileSync(repo(GEAR_FILE), 'utf8');
const table = parseGearTable(tableText, GEAR_FILE);

// The spec's Decided section, verbatim: EXIF string → display name.
const DECIDED_CAMERAS = [
  ['ILCE-7RM4', 'Sony α7R IV'],
  ['ILCE-7RM5', 'Sony α7R V'],
  ['ILCE-7M5', 'Sony α7 V'],
  ['PENTAX K-1', 'Pentax K-1'],
];
const DECIDED_LENSES = [
  ['100-400mm F5-6.3 DG DN OS | Contemporary 020', 'Sigma 100-400mm f/5-6.3 DG DN OS Contemporary'],
  ['FE 16-35mm F2.8 GM II', 'Sony FE 16-35mm f/2.8 GM II'],
  ['FE 16-35mm F4 ZA OSS', 'Sony Zeiss FE 16-35mm f/4 ZA OSS'],
  ['FE 24-105mm F4 G OSS', 'Sony FE 24-105mm f/4 G OSS'],
  ['E 50-400mm F4.5-6.3 A067', 'Tamron 50-400mm f/4.5-6.3 Di III VC VXD'],
  ['HD PENTAX-D FA 15-30mm F2.8ED SDM WR', 'HD Pentax-D FA 15-30mm f/2.8 ED SDM WR'],
];

const parse = (lines) => () => parseGearTable(lines.join('\n'), 'gear.md');

describe('the gear table parser (T1704)', () => {
  it('the committed table parses: the Decided rows and the fixtures, nothing else', () => {
    expect([...table.cameras]).toEqual([...DECIDED_CAMERAS, ['Fixture FX-1', 'Fixture FX-1']]);
    expect([...table.lenses]).toEqual([
      ...DECIDED_LENSES,
      ['Fixture 24-85mm f/1.8', 'Fixture 24-85mm f/1.8'],
    ]);
  });

  it('keeps a `|` and a double space in the key, and drops NULs and padding', () => {
    const gear = parseGearTable(
      ['## Lenses', '- `A | B  C` = Lens one', '- `\0 D \0` = Lens two'].join('\n'),
      'gear.md',
    );
    expect([...gear.lenses]).toEqual([
      ['A | B  C', 'Lens one'],
      ['D', 'Lens two'],
    ]);
  });

  it('a malformed line in a section throws naming the file and line', () => {
    const expected =
      '[gear] gear.md:3 — expected "- `<EXIF string>` = <display name>" under "## Cameras" or "## Lenses"';
    expect(parse(['## Cameras', '', '- ILCE-7RM4 = Sony α7R IV'])).toThrow(expected);
    expect(parse(['## Cameras', '', '- `ILCE-7RM4` ='])).toThrow(expected);
    expect(parse(['## Cameras', '', 'Some prose'])).toThrow(expected);
  });

  it('a line outside the two sections throws naming the line', () => {
    expect(parse(['## Cameras', '- `X` = Y', '## Bodies', '- `Z` = W'])).toThrow(
      /^\[gear\] gear\.md:3 — expected/,
    );
  });

  it('prose before the first section parses; a line there that is not prose throws naming it', () => {
    expect(parse(['# Gear names', '', 'A paragraph with `code`.', '## Cameras'])).not.toThrow();
    expect(parse(['# Gear names', '', '- `ILCE-7RM4` = Sony α7R IV', '## Cameras'])).toThrow(
      /^\[gear\] gear\.md:3 — expected/,
    );
  });

  it('a key listed twice in one section throws naming the line; once per section is fine', () => {
    expect(parse(['## Cameras', '- `ILCE-7RM4` = A', '- `ILCE-7RM4` = B'])).toThrow(
      '[gear] gear.md:3 — "ILCE-7RM4" is listed twice under Cameras',
    );
    expect(parse(['## Cameras', '- `X` = A', '## Lenses', '- `X` = B'])).not.toThrow();
  });
});

describe('the label lookup (T1704)', () => {
  it('prints Sony α7R V for ILCE-7RM5, discarding the make', () => {
    expect(formatExposure({ Make: 'SONY', Model: 'ILCE-7RM5' }, table).camera).toBe('Sony α7R V');
  });

  it('prints Pentax K-1 for the Ricoh make and PENTAX K-1 model', () => {
    expect(
      formatExposure({ Make: 'RICOH IMAGING COMPANY, LTD.', Model: 'PENTAX K-1' }, table).camera,
    ).toBe('Pentax K-1');
  });

  it("prints the Sigma's display name for the `|` string", () => {
    expect(
      formatExposure({ LensModel: '100-400mm F5-6.3 DG DN OS | Contemporary 020' }, table).lens,
    ).toBe('Sigma 100-400mm f/5-6.3 DG DN OS Contemporary');
  });

  it.each(DECIDED_CAMERAS)('camera %s → %s', (model, name) => {
    expect(formatExposure({ Make: 'SONY', Model: model }, table).camera).toBe(name);
  });

  it.each(DECIDED_LENSES)('lens %s → %s', (lens, name) => {
    expect(formatExposure({ LensModel: lens }, table).lens).toBe(name);
  });

  it('a string padded with NULs finds its entry', () => {
    expect(
      formatExposure({ Model: 'ILCE-7RM5\0\0 ', LensModel: ' FE 16-35mm F2.8 GM II\0' }, table),
    ).toEqual({ camera: 'Sony α7R V', lens: 'Sony FE 16-35mm f/2.8 GM II' });
  });

  it("without the table, and for a string it lacks, today's strings", () => {
    const raw = { Make: 'SONY', Model: 'ILCE-7RM5', LensModel: 'FE 16-35mm F2.8 GM II' };
    expect(formatExposure(raw)).toMatchObject({
      camera: 'SONY ILCE-7RM5',
      lens: 'FE 16-35mm F2.8 GM II',
    });
    expect(formatExposure(raw, EMPTY_GEAR)).toMatchObject({ camera: 'SONY ILCE-7RM5' });
    expect(
      formatExposure({ Make: 'RICOH IMAGING COMPANY, LTD.', Model: 'PENTAX K-1' }).camera,
    ).toBe('RICOH IMAGING COMPANY, LTD. PENTAX K-1');
    expect(
      formatExposure({ Make: 'SONY', Model: 'ILCE-1', LensModel: 'E 70-180mm F2.8 A056' }, table),
    ).toMatchObject({ camera: 'SONY ILCE-1', lens: 'E 70-180mm F2.8 A056' });
  });

  it("a sidecar's camera: and lens: still win over the table", () => {
    const exposure = formatExposure(
      { Model: 'ILCE-7RM5', LensModel: 'FE 16-35mm F2.8 GM II' },
      table,
    );
    expect(mergeOverrides(exposure, { camera: 'Leica M6', lens: 'Summicron 35' })).toMatchObject({
      camera: 'Leica M6',
      lens: 'Summicron 35',
    });
  });
});

describe('the unknown-gear warning (T1704)', () => {
  it('one entry per distinct unknown string, with the first file that carries it', () => {
    const entries = [
      { file: 'a.jpg', raw: { Model: 'ILCE-7RM5', LensModel: 'E 70-180mm F2.8 A056' } },
      { file: 'b.jpg', raw: { Model: 'ILCE-1', LensModel: 'E 70-180mm F2.8 A056' } },
      { file: 'c.jpg', raw: { Model: 'ILCE-1\0', LensModel: 'FE 16-35mm F2.8 GM II' } },
      { file: 'd.jpg', raw: {} },
      { file: 'e.jpg', raw: { Model: 'X', LensModel: 'X' } },
    ];
    expect(unknownGear(entries, table)).toEqual([
      { kind: 'lens', value: 'E 70-180mm F2.8 A056', file: 'a.jpg' },
      { kind: 'camera', value: 'ILCE-1', file: 'b.jpg' },
      { kind: 'camera', value: 'X', file: 'e.jpg' },
      { kind: 'lens', value: 'X', file: 'e.jpg' },
    ]);
  });

  it('absent strings are not unknown', () => {
    expect(unknownGear([{ file: 'a.jpg', raw: { Make: 'SONY' } }], EMPTY_GEAR)).toEqual([]);
  });

  it('the build over the repo prints none: every public raster names only gear the table lists', async () => {
    const content = repo('src/content');
    const extension = new RegExp(`\\.(${IMAGE_EXTENSIONS.join('|')})$`, 'i');
    const files = readdirSync(content, { recursive: true })
      .map((path) => `src/content/${String(path).replaceAll('\\', '/')}`)
      .filter((path) => extension.test(path))
      .sort()
      .filter((path) => {
        const info = classifyContentImage(`/${path}`);
        return !info.nested && !info.private;
      });
    // Guards the case: with no files, or none carrying gear, it passes empty.
    expect(files.length).toBeGreaterThan(50);
    const entries = await Promise.all(
      files.map(async (file) => ({ file, raw: await readExposure(repo(file)) })),
    );
    expect(entries.filter(({ raw }) => raw.Model === 'ILCE-7RM4').length).toBeGreaterThan(0);
    expect(unknownGear(entries, table)).toEqual([]);
  });
});
