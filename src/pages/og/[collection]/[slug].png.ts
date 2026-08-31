import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { SITE } from '../../../consts';

// Build-time generated Open Graph images for every blog post and work entry,
// rendered in the theme's light palette (see global.css tokens). The static
// `public/og.jpg` remains the site-wide fallback for all other pages.

interface OgProps {
  title: string;
  description: string;
  kind: string;
}

export const getStaticPaths = (async () => {
  const blog = await getCollection('blog', ({ data }) => !data.draft);
  const works = await getCollection('works');
  return [
    ...blog.map((entry) => ({
      params: { collection: 'blog', slug: entry.id },
      props: {
        title: entry.data.title,
        description: entry.data.description,
        kind: 'Blog',
      } satisfies OgProps,
    })),
    ...works.map((entry) => ({
      params: { collection: 'works', slug: entry.id },
      props: {
        title: entry.data.title,
        description: entry.data.description,
        kind: 'Work',
      } satisfies OgProps,
    })),
  ];
}) satisfies GetStaticPaths;

// Satori has no oklch() support, so these are hex equivalents of the
// light-theme tokens in global.css. They do NOT update automatically —
// after retuning any token, recompute these (standard OKLab math; the
// pre-merge review of spec 001 caught the accent still terracotta after
// the token had gone teal).
const COLOR = {
  bg: '#fcfcfa',
  text: '#1e2226',
  muted: '#5e646a',
  line: '#d2d1cb',
  accent: '#004942',
};

const require = createRequire(import.meta.url);
const font = (pkgPath: string) => readFile(require.resolve(pkgPath));

// Latin subsets, to keep the build light. Satori draws any glyph these fonts
// lack as an empty box, which is why the `kind` labels above stay Latin rather
// than going through the UI dictionary — `SITE.locale = 'ja'` would otherwise
// render them as tofu in every share image. Post titles in a non-Latin script
// hit the same limit: install a face that covers them (e.g.
// `@fontsource/noto-sans-jp`) and point the paths below at it.
const [spectral, publicSans] = await Promise.all([
  font('@fontsource/spectral/files/spectral-latin-600-normal.woff'),
  font('@fontsource/public-sans/files/public-sans-latin-400-normal.woff'),
]);

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export const GET: APIRoute<OgProps> = async ({ props }) => {
  const { title, description, kind } = props;

  const svg = await satori(
    {
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
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'Spectral',
                          fontSize: title.length > 55 ? 54 : 64,
                          lineHeight: 1.15,
                          color: COLOR.text,
                        },
                        children: truncate(title, 90),
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
                  children: truncate(description, 120),
                },
              },
            ],
          },
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Spectral', data: spectral, weight: 600, style: 'normal' },
        { name: 'Public Sans', data: publicSans, weight: 400, style: 'normal' },
      ],
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
