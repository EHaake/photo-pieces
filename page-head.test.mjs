import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { blocks, declarations, selects, uncomment } from './src/lib/ground.ts';

// Two standing guards (spec 010, T807). The first: the reading head's
// values are a visual-gate decision (2026-09-07) that lives only in CSS,
// so deleting or retuning the media block would have failed nothing.
// The second: the post-build dev-route barrier's failure path had been
// exercised once, by hand — here it runs for real, against a temporary
// fixture directory, since the barrier takes an optional [dir].

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

let css;
let mediaWithHead;
let rootDecls;
let sectionDecls;

beforeAll(async () => {
  css = uncomment(await readFile(here('./src/styles/global.css'), 'utf8'));
  const top = blocks(css);
  mediaWithHead = top.filter(
    (block) => block.prelude.startsWith('@media') && block.body.includes('--head-pad-reading'),
  );
  const roots = top.filter((block) => selects(block.prelude, ':root'));
  rootDecls = Object.assign({}, ...roots.map((block) => declarations(block.body)));
  const sections = top.filter(
    (block) => selects(block.prelude, '.section') && 'padding-block' in declarations(block.body),
  );
  expect(sections).toHaveLength(1);
  sectionDecls = declarations(sections[0].body);
});

describe("the reading head's values in global.css (T807, spec 010)", () => {
  it('both head tokens tighten to 3rem, in a :root inside the media block that overrides them', () => {
    expect(mediaWithHead).toHaveLength(1);
    const nested = blocks(mediaWithHead[0].body).filter((block) => selects(block.prelude, ':root'));
    expect(nested).toHaveLength(1);
    const decls = declarations(nested[0].body);
    expect(decls['--head-pad-reading']).toBe('3rem');
    expect(decls['--head-gap-reading']).toBe('3rem');
  });

  it('the block that tightens them is @media (min-width: 720px)', () => {
    expect(mediaWithHead).toHaveLength(1);
    expect(mediaWithHead[0].prelude).toBe('@media (min-width: 720px)');
  });

  it("outside the query :root declares both head tokens at .section's clamp", () => {
    const clamp = sectionDecls['padding-block'];
    expect(clamp).toMatch(/^clamp\(/);
    expect(rootDecls['--head-pad-reading']).toBe(clamp);
    expect(rootDecls['--head-gap-reading']).toBe(clamp);
  });
});

describe('the dev-route barrier (T807, spec 010)', () => {
  const barrier = here('./scripts/check-no-dev-routes.mjs');
  let root;
  let withDevRoute;
  let withMarker;
  let clean;

  const run = (dir) => {
    try {
      return {
        status: 0,
        stdout: execFileSync(process.execPath, [barrier, dir], { encoding: 'utf8' }),
        stderr: '',
      };
    } catch (error) {
      return { status: error.status, stdout: error.stdout, stderr: error.stderr };
    }
  };

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'page-head-barrier-'));
    withDevRoute = join(root, 'built');
    clean = join(root, 'clean');
    mkdirSync(join(withDevRoute, 'dev', 'page-head'), { recursive: true });
    writeFileSync(join(withDevRoute, 'dev', 'page-head', 'index.html'), '<!doctype html>\n');
    withMarker = join(root, 'shipped');
    mkdirSync(withMarker, { recursive: true });
    writeFileSync(
      join(withMarker, 'index.html'),
      '<!doctype html>\n<script data-dev-ground>localStorage.getItem("dev-ground")</script>\n',
    );
    mkdirSync(join(clean, 'pieces'), { recursive: true });
    writeFileSync(join(clean, 'pieces', 'index.html'), '<!doctype html>\n');
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('a built dev route fails with a non-zero exit and names the path', () => {
    const result = run(withDevRoute);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('[check-no-dev-routes]');
    expect(result.stderr).toContain(join(withDevRoute, 'dev', 'page-head', 'index.html'));
  });

  it('a shipped dev-ground marker fails with a non-zero exit and names the file', () => {
    const result = run(withMarker);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      '[check-no-dev-routes] a dev-only marker shipped (dev-ground):',
    );
    expect(result.stderr).toContain(join(withMarker, 'index.html'));
  });

  it('a directory with no dev/ and no marker exits 0 and reports both scans', () => {
    const result = run(clean);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      `[check-no-dev-routes] no dev routes in ${clean}/; no dev-ground or dev-arrival marker in 1 files.`,
    );
  });
});
