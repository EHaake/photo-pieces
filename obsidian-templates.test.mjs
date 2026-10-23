import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PHOTOGRAPH_FIELDS } from './src/lib/image-meta.mjs';

// The vault's templates (spec 019, T1735d): the files Obsidian's core
// Templates plugin inserts, one per thing the photographer writes. Each
// is held to the collection schema it is for by reading the source, as
// image-meta.test.mjs holds PHOTOGRAPH_FIELDS — a field renamed in
// src/content.config.ts fails here, by the template and the key.
//
// Since T1735e a blank field means not set (src/lib/blank-fields.ts), so
// each template carries every field its schema has, the optional ones
// blank, in the schema's order.

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

// A template's frontmatter lines, as written.
const frontmatterLines = (name) => {
  const source = readFileSync(new URL(name, TEMPLATES), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  expect(match, `${name} opens with a frontmatter block`).not.toBeNull();
  return match[1].split('\n');
};

const templateKeys = (name) =>
  frontmatterLines(name).flatMap((line) => line.match(/^([A-Za-z]+):/)?.[1] ?? []);

// The schema's own fields, in the order it declares them: the keys at
// the indentation of its first one, so a nested object's keys (a
// stage's) are not among them however the source is wrapped.
const schemaKeys = (name) => {
  const [start, end] = SCHEMA_OF[name];
  const block = config.slice(config.indexOf(start), config.indexOf(end));
  const fields = [...block.matchAll(/^( +)([A-Za-z]+): (?:z\b|image\()/gm)];
  return fields.filter((field) => field[1] === fields[0][1]).map((field) => field[2]);
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
      const keys = templateKeys(name);
      expect(keys.length).toBeGreaterThan(0);
      for (const key of keys) {
        expect(block).toMatch(new RegExp(`^\\s+${key}: (z\\b|image\\()`, 'm'));
      }
    },
  );

  it.each(Object.keys(SCHEMA_OF))(
    "%s carries every field of its schema, in the schema's order",
    (name) => {
      // The journal folder's sidecar is the same schema without the
      // three fields that are the photographs folder's alone.
      const leftOut = name === 'journal-photograph.md' ? Object.values(PHOTOGRAPH_FIELDS) : [];
      const expected = schemaKeys(name).filter((key) => !leftOut.includes(key));
      expect(expected.length).toBeGreaterThan(0);
      expect(templateKeys(name)).toEqual(expected);
    },
  );

  it.each(['photograph.md', 'journal-photograph.md'])(
    "%s's stages line is blank, with no commented example beside it",
    (name) => {
      const lines = frontmatterLines(name);
      expect(lines).toContain('stages:');
      expect(lines.filter((line) => /^\s*#/.test(line))).toEqual([]);
      expect(lines.filter((line) => /^\s/.test(line))).toEqual([]);
    },
  );
});
