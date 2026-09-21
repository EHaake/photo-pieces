// Post-build barrier (spec 010): no dev-only route may ship. The
// page-head sampler (src/pages/dev/page-head/) returns no static paths
// unless import.meta.env.DEV, so `astro build` emits nothing under
// dist/dev/ — this is the check on the OUTPUT, so a future dev fixture
// that forgets the guard fails the build here rather than publishing.
// Runs from `postbuild`, after check-no-gps.
//
// Second scan (spec 014): the dev ground switch (src/components/DevGround.astro)
// is an inline head script on every page under `astro dev`, guarded by
// `{import.meta.env.DEV && ...}` in BaseLayout. It is not a route, so the
// dist/dev/ check cannot see it; instead every .html and .js under dist/ is
// read for the switch's marker, the string `dev-ground`, and the build fails
// naming the files if any carries it.
//
// Third scan (spec 016): the arrival's tuning control
// (src/components/DevArrival.astro + src/components/dev-arrival.ts) is the
// same shape one page down — a head applier the image page renders only
// under `{import.meta.env.DEV && ...}`, plus a served module that builds the
// bar. Three things carry its marker, the string `dev-arrival`: the applier's
// script attribute, the storage key, and the bar's own attribute. The scan
// takes .css as well as .html and .js, because the way this control would
// most quietly ship is a component <style> — bundled by the import whether or
// not the component ever renders.
//
//   node scripts/check-no-dev-routes.mjs [dir]   # default: dist
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = process.argv[2] ?? 'dist';

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

const built = [];
try {
  for await (const file of files(join(root, 'dev'))) built.push(file);
} catch (error) {
  // No dist/dev/ at all is the good case; anything else is real.
  if (error.code !== 'ENOENT') throw error;
}

if (built.length > 0) {
  console.error(
    `[check-no-dev-routes] ${root}/dev/ exists — a dev-only route was built: ${built.join(', ')}`,
  );
  process.exit(1);
}
// Each fixture's script attribute, storage key and bar attribute.
const MARKERS = ['dev-ground', 'dev-arrival'];

const scanned = [];
const shipped = new Map();
for await (const file of files(root)) {
  const ext = extname(file);
  if (ext !== '.html' && ext !== '.js' && ext !== '.css') continue;
  scanned.push(file);
  const text = await readFile(file, 'utf8');
  for (const marker of MARKERS) {
    if (text.includes(marker)) shipped.set(marker, [...(shipped.get(marker) ?? []), file]);
  }
}

if (shipped.size > 0) {
  // One line per marker, so the message names which fixture leaked.
  for (const [marker, leaked] of shipped) {
    console.error(
      `[check-no-dev-routes] a dev-only marker shipped (${marker}): ${leaked.join(', ')}`,
    );
  }
  process.exit(1);
}
console.log(
  `[check-no-dev-routes] no dev routes in ${root}/; no ${MARKERS.join(' or ')} marker in ${scanned.length} files.`,
);
