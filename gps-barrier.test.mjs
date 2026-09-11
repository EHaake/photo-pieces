import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// The GPS barrier (spec 004) as a standing test (T901, spec 011). The
// post-build scan had been proven only against dist/ at build time,
// with no test of its own (spec 010's open note). Here it runs for
// real against a temporary fixture directory, since the barrier takes
// an optional [dir] — no dist/ is touched.

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

describe('the GPS barrier (T901, spec 011)', () => {
  const barrier = here('./scripts/check-no-gps.mjs');
  let root;
  let withGps;
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
    root = mkdtempSync(join(tmpdir(), 'gps-barrier-'));
    withGps = join(root, 'leak');
    clean = join(root, 'clean');
    mkdirSync(withGps, { recursive: true });
    mkdirSync(clean, { recursive: true });
    copyFileSync(here('./tests/fixtures/gps.jpg'), join(withGps, 'gps.jpg'));
    copyFileSync(here('./tests/fixtures/photo.jpg'), join(clean, 'photo.jpg'));
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('a GPS-bearing image fails with a non-zero exit, naming the file and a GPS hit', () => {
    const result = run(withGps);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('[check-no-gps]');
    expect(result.stderr).toContain(join(withGps, 'gps.jpg'));
    expect(result.stderr).toContain('GPS');
  });

  it('a clean raster exits 0 and reports no GPS metadata', () => {
    const result = run(clean);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(`[check-no-gps] 1 images scanned in ${clean}/ — no GPS metadata.`);
  });
});
