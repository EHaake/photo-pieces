import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The vault's templates (spec 019, T1735d): the files Obsidian's core
// Templates plugin inserts, one per thing the photographer writes. Each
// is held to the collection schema it is for by reading the source, as
// image-meta.test.mjs holds PHOTOGRAPH_FIELDS — a field renamed in
// src/content.config.ts fails here, by the template and the key.

const TEMPLATES = new URL('./obsidian/vault/templates/', import.meta.url);

// Each template, and where its schema starts and ends in the config.
const SCHEMA_OF = {
  'journal.md': ['const journal', 'const galleries'],
  'photograph.md': ['const imageMeta', 'const places'],
  'journal-photograph.md': ['const imageMeta', 'const places'],
  'gallery.md': ['const galleries', 'const imageMeta'],
  'place.md': ['const places', 'export const collections'],
};

const config = readFileSync(new URL('./src/content.config.ts', import.meta.url), 'utf8');

// A template's frontmatter lines; the commented `stages:` example is
// read as written, so it is held to the schema too.
const frontmatterLines = (name) => {
  const source = readFileSync(new URL(name, TEMPLATES), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  expect(match, `${name} opens with a frontmatter block`).not.toBeNull();
  return match[1].split('\n').map((line) => line.replace(/^# ?/, ''));
};

describe("the vault's templates", () => {
  it('there is a schema named for every template in obsidian/vault/templates/', () => {
    expect(readdirSync(TEMPLATES).sort()).toEqual(Object.keys(SCHEMA_OF).sort());
  });

  it.each(Object.entries(SCHEMA_OF))(
    "each frontmatter key of %s is a key of content.config.ts's schema for it",
    (name, [start, end]) => {
      const block = config.slice(config.indexOf(start), config.indexOf(end));
      expect(block).toMatch(/z\s*\.object\(/);
      const keys = frontmatterLines(name).flatMap((line) => line.match(/^([A-Za-z]+):/)?.[1] ?? []);
      expect(keys.length).toBeGreaterThan(0);
      for (const key of keys) {
        expect(block).toMatch(new RegExp(`^\\s+${key}: (z\\b|image\\()`, 'm'));
      }
    },
  );

  it.each(['photograph.md', 'journal-photograph.md'])(
    "each key of %s's stages example is a key of the imageMeta schema's stage",
    (name) => {
      const stage = config.slice(config.indexOf('stages: z'), config.indexOf('edition: z'));
      expect(stage).toContain('z.object(');
      const keys = frontmatterLines(name).flatMap(
        (line) => line.match(/^\s+(?:- )?([A-Za-z]+):/)?.[1] ?? [],
      );
      expect(keys.length).toBeGreaterThan(0);
      for (const key of keys) {
        expect(stage).toMatch(new RegExp(`\\b${key}: z\\.`));
      }
    },
  );
});
