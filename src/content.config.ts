import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Astro 7 Content Layer API: each collection declares a `loader`.
// Pieces are plain Markdown only (no MDX) so the files stay renderable
// and editable in Obsidian — enforced here by the loader pattern.
const pieces = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/pieces' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      publishDate: z.coerce.date(),
      categories: z
        .array(z.enum(['landscape', 'street', 'portrait', 'event']))
        .min(1),
      description: z.string(),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { pieces };
