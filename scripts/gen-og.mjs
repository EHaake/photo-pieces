// The static social image's generator (spec 014). `public/og.jpg` is the
// site-wide Open Graph fallback for every page that isn't a piece; spec
// 002 made it ad hoc "with the existing satori setup" and spec 003
// resynced it by hand. Now that `ground.test.mjs` pins its background to
// `--color-bg`, every retune of the ground needs that resync — so it is
// one command instead of a remembered procedure.
//
//   npm run og                      # writes public/og.jpg
//   npm run og -- --out /tmp/og.jpg # writes elsewhere, for a compare
//
// It reads `:root` from global.css and converts the five tokens the card
// draws with through src/lib/ground.ts, the same converter the test uses,
// and REFUSES to write while any of them differs from `COLOR` in
// src/lib/og-card.mjs by more than 2/255 in a channel: the hexes are the
// hand-kept copies, and a generator that quietly drew the ground while
// the route still drew the old one would hide exactly the drift this
// spec is about. Run under type stripping (`--experimental-strip-types`,
// an alias of `--strip-types` from Node 24) so ground.ts and consts.ts
// can be imported directly — both are erasable syntax, and their
// specifiers carry their extensions because Node resolves them itself.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { oklchToRgb255, parseOklch, rootTokens, toHex } from '../src/lib/ground.ts';
import { SITE } from '../src/consts.ts';
import { card, COLOR, loadFonts } from '../src/lib/og-card.mjs';

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/** COLOR's key -> the token it is a copy of. */
const COPIES = {
  bg: '--color-bg',
  text: '--color-text',
  muted: '--color-muted',
  line: '--color-line',
  accent: '--color-accent',
};

const flag = process.argv.indexOf('--out');
const out = flag === -1 ? null : process.argv[flag + 1];
if (flag !== -1 && !out) {
  console.error('[gen-og] --out needs a path');
  process.exit(1);
}
const target = out ? resolve(process.cwd(), out) : here('../public/og.jpg');

const root = rootTokens(await readFile(here('../src/styles/global.css'), 'utf8'));

let drifted = null;
for (const [key, token] of Object.entries(COPIES)) {
  const tokenRgb = oklchToRgb255(parseOklch(root[token]));
  const copy = COLOR[key];
  const hex = toHex(tokenRgb);
  console.log(`[gen-og] ${token}: ${hex}  COLOR.${key}: ${copy}`);
  const off = tokenRgb.some(
    (channel, index) =>
      Math.abs(channel - Number.parseInt(copy.slice(1 + index * 2, 3 + index * 2), 16)) > 2,
  );
  if (off && !drifted) drifted = `${token}: ${copy} vs ${hex}`;
}

if (drifted) {
  console.error(
    `[gen-og] COLOR in src/lib/og-card.mjs drifts from :root (${drifted}) — update it first`,
  );
  process.exit(1);
}

// No `kind`: the fallback image stands for the site, not for a piece, so
// it carries no category eyebrow.
const svg = await satori(card({ title: SITE.title, description: SITE.description, kind: '' }), {
  width: 1200,
  height: 630,
  fonts: await loadFonts(),
});

await writeFile(target, await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer());
console.log(`[gen-og] wrote ${out ?? 'public/og.jpg'} (1200×630) on ${COLOR.bg}`);
