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
const MARKER = 'dev-ground'; // the switch's script attribute and storage key

const scanned = [];
const shipped = [];
for await (const file of files(root)) {
  const ext = extname(file);
  if (ext !== '.html' && ext !== '.js') continue;
  scanned.push(file);
  if ((await readFile(file, 'utf8')).includes(MARKER)) shipped.push(file);
}

if (shipped.length > 0) {
  console.error(`[check-no-dev-routes] the dev ground switch shipped: ${shipped.join(', ')}`);
  process.exit(1);
}
console.log(
  `[check-no-dev-routes] no dev routes in ${root}/; no ${MARKER} marker in ${scanned.length} files.`,
);
