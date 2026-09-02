// Generates the placeholder images for the fixture pieces (spec 003's
// vocabulary sampler + the two essay-style demos) and the test fixtures
// that need synthetic metadata (spec 004). Flat, muted duotone fields
// with a horizon band and a small ratio label — clearly not
// photographs, pleasant enough to judge layout by. Swap real frames into
// the piece folders anytime; nothing references these by content.
//
//   node scripts/gen-placeholders.mjs            # everything
//   node scripts/gen-placeholders.mjs pieces     # the fixture pieces only
//   node scripts/gen-placeholders.mjs gallery    # src/content/gallery-images only
//   node scripts/gen-placeholders.mjs fixtures   # tests/fixtures only
//
// Idempotent: rewrites every placeholder in place.
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';

const PALETTE = {
  sage: ['#aab5a4', '#8b9887'],
  slate: ['#9fabb8', '#7e8b9b'],
  ochre: ['#c2ab8d', '#a58c6c'],
  fog: ['#b8b5ae', '#98958e'],
  moss: ['#a3a98f', '#848b72'],
  clay: ['#b39c94', '#937b73'],
};

// Synthetic EXIF (spec 004): fictional make/model so no real gear is
// implied, realistic exposure values varied per image, so the image
// pages' wall labels exercise the EXIF path. GPS is absent from every
// piece placeholder; the one content image that carries it (dock-b in
// the gallery root) does so deliberately, as the build-level leak
// test's subject.
const IMAGES = [
  // [file, width, height, palette, label, exif]
  ['land-a.jpg', 1800, 1200, 'sage', '3:2', exif('35', '8', '1/250', '100', '2026:08:28 06:41:12')],
  [
    'land-b.jpg',
    1800,
    1200,
    'slate',
    '3:2',
    exif('24', '11', '1/60', '200', '2026:08:28 07:02:40'),
  ],
  [
    'land-c.jpg',
    1800,
    1200,
    'ochre',
    '3:2',
    exif('50', '5.6', '1/500', '400', '2026:08:28 07:15:03'),
  ],
  ['port-a.jpg', 1200, 1800, 'fog', '2:3', exif('85', '2', '1/1000', '160', '2026:08:30 09:12:55')],
  ['port-b.jpg', 1200, 1800, 'moss', '2:3', exif('35', '4', '1/125', '800', '2026:08:30 09:48:19')],
  [
    'port-45.jpg',
    1280,
    1600,
    'clay',
    '4:5',
    exif('85', '1.8', '1/640', '100', '2026:08:30 10:05:31'),
  ],
  [
    'square.jpg',
    1400,
    1400,
    'slate',
    '1:1',
    exif('50', '2.8', '1/200', '320', '2026:08:30 10:22:08'),
  ],
  ['pano.jpg', 2400, 800, 'sage', '3:1', exif('24', '16', '1/30', '100', '2026:08:28 07:40:27')],
];

// A GPS block (IFD3) for the leak-test subjects. The coordinates are
// sharp's own documentation example (Trafalgar Square), not anywhere
// the photographer has been.
const TRAFALGAR_GPS = {
  IFD3: {
    GPSVersionID: '2 3 0 0',
    GPSLatitudeRef: 'N',
    GPSLatitude: '51/1 30/1 3230/100',
    GPSLongitudeRef: 'W',
    GPSLongitude: '0/1 7/1 4366/100',
  },
};

// Test fixtures. gps.jpg is the subject of spec 004's unit-level leak
// tests: full exposure EXIF plus GPS — the allowlist reader must never
// surface the coordinates.
const FIXTURES = [
  [
    'tests/fixtures/gps.jpg',
    600,
    400,
    'ochre',
    'GPS',
    { ...exif('35', '8', '1/250', '100', '2026:08:28 06:41:12'), ...TRAFALGAR_GPS },
  ],
];

// Gallery-root placeholders (spec 004): images that belong to no piece.
// dock-b carries GPS so the build-level scan of dist/ has a real leak
// to catch if the pipeline ever emits an original.
const GALLERY_IMAGES = [
  [
    'src/content/gallery-images/dock-a.jpg',
    1800,
    1200,
    'fog',
    '3:2',
    exif('35', '5.6', '1/320', '200', '2026:08:29 18:12:44'),
  ],
  [
    'src/content/gallery-images/dock-b.jpg',
    1200,
    1800,
    'clay',
    '2:3 · GPS',
    { ...exif('50', '2.8', '1/125', '640', '2026:08:29 19:03:10'), ...TRAFALGAR_GPS },
  ],
];

function exif(focal, aperture, shutter, iso, taken) {
  return {
    IFD0: { Make: 'Fixture', Model: 'Fixture FX-1', Software: 'gen-placeholders.mjs' },
    IFD2: {
      LensModel: 'Fixture 24-85mm f/1.8',
      FocalLength: focal,
      FNumber: aperture,
      ExposureTime: shutter,
      ISOSpeedRatings: iso,
      DateTimeOriginal: taken,
    },
  };
}

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

async function writePlaceholder(path, w, h, palette, label, meta) {
  const [light] = PALETTE[palette];
  await mkdir(dirname(path), { recursive: true });
  await sharp({
    create: { width: w, height: h, channels: 3, background: light },
  })
    .composite([{ input: Buffer.from(svgOverlay(w, h, PALETTE[palette], label)) }])
    .withExif(meta)
    .jpeg({ quality: 82 })
    .toFile(path);
}

const target = process.argv[2] ?? 'all';

if (target === 'all' || target === 'pieces') {
  for (const dir of PIECES) {
    for (const [file, w, h, palette, label, meta] of IMAGES) {
      await writePlaceholder(`${dir}/${file}`, w, h, palette, label, meta);
    }
    console.log('wrote placeholders →', dir);
  }
}

if (target === 'all' || target === 'gallery') {
  for (const [path, w, h, palette, label, meta] of GALLERY_IMAGES) {
    await writePlaceholder(path, w, h, palette, label, meta);
    console.log('wrote gallery image →', path);
  }
}

if (target === 'all' || target === 'fixtures') {
  for (const [path, w, h, palette, label, meta] of FIXTURES) {
    await writePlaceholder(path, w, h, palette, label, meta);
    console.log('wrote fixture →', path);
  }
}
