// Generates the placeholder images for the spec-003 fixture pieces
// (vocabulary sampler + the two essay-style demos). Flat, muted duotone
// fields with a horizon band and a small ratio label — clearly not
// photographs, pleasant enough to judge layout by. Swap real frames into
// the piece folders anytime; nothing references these by content.
//
//   node scripts/gen-placeholders.mjs
//
// Idempotent: rewrites every placeholder in place.
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const PALETTE = {
  sage: ['#aab5a4', '#8b9887'],
  slate: ['#9fabb8', '#7e8b9b'],
  ochre: ['#c2ab8d', '#a58c6c'],
  fog: ['#b8b5ae', '#98958e'],
  moss: ['#a3a98f', '#848b72'],
  clay: ['#b39c94', '#937b73'],
};

const IMAGES = [
  // [file, width, height, palette, label]
  ['land-a.jpg', 1800, 1200, 'sage', '3:2'],
  ['land-b.jpg', 1800, 1200, 'slate', '3:2'],
  ['land-c.jpg', 1800, 1200, 'ochre', '3:2'],
  ['port-a.jpg', 1200, 1800, 'fog', '2:3'],
  ['port-b.jpg', 1200, 1800, 'moss', '2:3'],
  ['port-45.jpg', 1280, 1600, 'clay', '4:5'],
  ['square.jpg', 1400, 1400, 'slate', '1:1'],
  ['pano.jpg', 2400, 800, 'sage', '3:1'],
];

const PIECES = [
  'src/content/pieces/vocabulary-sampler',
  'src/content/pieces/where-the-fog-lets-go',
  'src/content/pieces/market-day-camera-low',
];

const svgOverlay = (w, h, [, dark], label) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${Math.round(h * 0.62)}" width="${w}" height="${Math.round(h * 0.38)}" fill="${dark}"/>
  <text x="${w - 24}" y="${h - 24}" text-anchor="end" font-family="monospace"
        font-size="${Math.round(Math.min(w, h) * 0.05)}" fill="#ffffff" fill-opacity="0.55">${label}</text>
</svg>`;

for (const dir of PIECES) {
  await mkdir(dir, { recursive: true });
  for (const [file, w, h, palette, label] of IMAGES) {
    const [light] = PALETTE[palette];
    await sharp({
      create: { width: w, height: h, channels: 3, background: light },
    })
      .composite([{ input: Buffer.from(svgOverlay(w, h, PALETTE[palette], label)) }])
      .jpeg({ quality: 82 })
      .toFile(`${dir}/${file}`);
  }
  console.log('wrote placeholders →', dir);
}
