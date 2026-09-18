import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedPieces } from '../../../lib/pieces';
import satori from 'satori';
import sharp from 'sharp';
import { card, loadFonts } from '../../../lib/og-card.mjs';

// Build-time generated Open Graph images for every published piece,
// rendered in the theme's light palette (see global.css tokens). The card
// itself — its palette, its fonts, its tree — lives in src/lib/og-card.mjs,
// shared with `npm run og`, which draws the same card for the static
// `public/og.jpg` fallback used by all other pages.

interface OgProps {
  title: string;
  description: string;
  kind: string;
}

export const getStaticPaths = (async () => {
  const pieces = await getPublishedPieces();
  return pieces.map((entry) => ({
    params: { slug: entry.id },
    props: {
      title: entry.data.title,
      description: entry.data.description,
      // The eyebrow is data, not invented copy: the piece's categories.
      kind: entry.data.categories.join(' / '),
    } satisfies OgProps,
  }));
}) satisfies GetStaticPaths;

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export const GET: APIRoute<OgProps> = async ({ props }) => {
  const { title, description, kind } = props;

  const svg = await satori(
    card({ title: truncate(title, 90), description: truncate(description, 120), kind }),
    {
      width: 1200,
      height: 630,
      fonts: await loadFonts(),
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
