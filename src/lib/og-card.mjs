// The Open Graph card, shared by the per-piece route and the generator
// that writes the static `public/og.jpg` (spec 014, T1201). One tree and
// one palette in one module: the route
// (`src/pages/og/pieces/[slug].png.ts`) and `scripts/gen-og.mjs` render
// the same card, so the site-wide fallback image and the per-piece
// images cannot drift apart — and `ground.test.mjs` has one `COLOR` to
// pin against `:root`.
//
// Plain JS with JSDoc rather than TypeScript: the generator runs under
// Node's type stripping, and a module it imports that needs no stripping
// is one less thing that can fail there.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { SITE } from '../consts.ts';

// Satori has no oklch() support, so these are hex equivalents of the
// light-theme tokens in global.css. They do NOT update automatically —
// after retuning any token, recompute these (standard OKLab math; the
// pre-merge review of spec 001 caught the accent still terracotta after
// the token had gone teal). `npm run og` refuses to write while any of
// them differs from its token, and `ground.test.mjs` pins all five.
export const COLOR = {
  bg: '#fcfcfa',
  text: '#1e2226',
  muted: '#5e646a',
  line: '#d9d8d4',
  accent: '#004942',
};

const require = createRequire(import.meta.url);
const font = (pkgPath) => readFile(require.resolve(pkgPath));

/** Satori's own `weight` and `style` are literal unions, so the JSDoc
 *  spells them out rather than widening to number/string.
 *  @type {Promise<{ name: string, data: Buffer, weight: 400 | 600, style: 'normal' }[]> | null} */
let fonts = null;

/**
 * The two faces the card draws with, in Satori's `fonts` form — read
 * once per process, on first use.
 *
 * Latin subsets, to keep the build light. Satori draws any glyph these
 * fonts lack as an empty box, which is why the `kind` labels stay Latin
 * rather than going through the UI dictionary — a non-Latin `SITE.locale`
 * would otherwise render them as tofu in every share image. Post titles
 * in a non-Latin script hit the same limit: install a face that covers
 * them (e.g. `@fontsource/noto-sans-jp`) and point the paths below at
 * it.
 */
export function loadFonts() {
  fonts ??= Promise.all([
    font('@fontsource/spectral/files/spectral-latin-600-normal.woff'),
    font('@fontsource/public-sans/files/public-sans-latin-400-normal.woff'),
  ]).then(([spectral, publicSans]) => [
    { name: 'Spectral', data: spectral, weight: 600, style: 'normal' },
    { name: 'Public Sans', data: publicSans, weight: 400, style: 'normal' },
  ]);
  return fonts;
}

/**
 * The card's Satori tree at 1200×630. `title` and `description` are
 * drawn as given — the caller truncates. An empty `kind` renders no
 * eyebrow row, which is how the site-wide fallback image is made: it
 * stands for no piece and so has no categories to name.
 *
 * @param {{ title: string, description: string, kind: string }} content
 */
export function card({ title, description, kind }) {
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: COLOR.bg,
        padding: 40,
        fontFamily: 'Public Sans',
      },
      children: {
        type: 'div',
        props: {
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1px solid ${COLOR.line}`,
            padding: '52px 60px',
          },
          children: [
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', gap: 16 },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: 22,
                        height: 22,
                        backgroundColor: COLOR.accent,
                      },
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontFamily: 'Spectral',
                        fontSize: 30,
                        color: COLOR.text,
                      },
                      children: SITE.title,
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column' },
                children: [
                  ...(kind === ''
                    ? []
                    : [
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: 14,
                              marginBottom: 28,
                              color: COLOR.accent,
                              fontFamily: 'Spectral',
                              fontSize: 24,
                              textTransform: 'uppercase',
                              letterSpacing: 4,
                            },
                            children: [
                              {
                                type: 'div',
                                props: {
                                  style: {
                                    width: 40,
                                    height: 1,
                                    backgroundColor: COLOR.accent,
                                  },
                                },
                              },
                              { type: 'div', props: { children: kind } },
                            ],
                          },
                        },
                      ]),
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontFamily: 'Spectral',
                        fontSize: title.length > 55 ? 54 : 64,
                        lineHeight: 1.15,
                        color: COLOR.text,
                      },
                      children: title,
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: 26,
                  lineHeight: 1.4,
                  color: COLOR.muted,
                },
                children: description,
              },
            },
          ],
        },
      },
    },
  };
}
