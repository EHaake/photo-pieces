import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPieces } from '../lib/pieces';
import { withBase } from '../lib/url';
import { SITE } from '../consts';
import { locale } from '../i18n';

export async function GET(context: APIContext) {
  const pieces = await getPublishedPieces();

  return rss({
    title: SITE.title,
    description: SITE.rssDescription,
    site: context.site ?? 'https://example.com',
    // Feed readers use <language> to pick a reading direction and hyphenation.
    customData: `<language>${locale}</language>`,
    items: pieces.map((piece) => ({
      title: piece.data.title,
      description: piece.data.description,
      pubDate: piece.data.publishDate,
      link: withBase(`/pieces/${piece.id}/`),
      categories: [...piece.data.categories],
    })),
  });
}
